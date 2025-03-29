import json
import re
from typing import Dict, List, Any, Optional, Union
from modules.schemas import (
    EmailInfo, IndustryCode, BaseRateInfo, RevenueInfo, BasePremiumInfo,
    PremiumInfo, AuthorityInfo, CoverageInfo, RiskAssessmentResult
)
from modules.insurance_risk_agent import InsuranceRiskAgent
from config.config import Config

class InsurancePipeline:
    """
    A simplified insurance quote processing pipeline that leverages an LLM to
    extract information from emails and generate responses based on insurance documents.
    """
    
    def __init__(self, llm_client, document_paths: Dict[str, str], serp_api_key: Optional[str] = None):
        """
        Initialize the pipeline with an LLM client and reference document paths.
        
        Args:
            llm_client: The LLM client to use for processing
            document_paths: Dictionary of document names and their file paths or URLs
            serp_api_key: API key for SERP API (for risk assessment)
        """
        self.llm = llm_client
        self.document_paths = document_paths
        self.serp_api_key = serp_api_key or Config.SERP_API_KEY
        
        # Initialize risk assessment agent if API key is provided
        self.risk_agent = InsuranceRiskAgent(llm_client) if self.serp_api_key else None
    
    def process_quote_request(self, email_content: str) -> Dict[str, Any]:
        """
        Process an insurance quote request email through the entire pipeline.
        
        Args:
            email_content: The raw email content to process
            
        Returns:
            Dictionary containing all extracted and calculated information
        """
        # Step 1: Extract structured information from the email
        email_info = self.extract_email_info(email_content)
        
        # Step 2: Identify BIC code based on industry, passing along the explanation for context
        industry_code = self.get_industry_code(
            email_info["industry"], 
            industry_explanation=email_info.get("explanation", "")
        )
        
        # Step 3: Get base rate per $1,000 revenue
        base_rate_info = self.get_base_rate(industry_code["bic_code"])
        
        # Step 4: Estimate annual revenue
        revenue_info = self.estimate_annual_revenue(
            industry_code["bic_code"], 
            email_info
        )
        
        # Step 5: Calculate base premium
        base_premium_info = self.calculate_base_premium(
            revenue_info["estimated_annual_revenue"],
            base_rate_info["base_rate_per_1000"]
        )
        
        # Step 6: Apply modifiers and calculate final premium
        premium_info = self.calculate_premium_with_modifiers(
            base_premium_info["base_premium"],
            email_info,
            industry_code["bic_code"]
        )
        
        # Step 7: Check if within authority limits
        authority_info = self.check_authority_level(
            self.parse_coverage_limit(email_info["coverage_requested"]["limits"]),
            industry_code["bic_code"]
        )
        
        # Step 8: Get coverage details and endorsements
        coverage_info = self.get_coverage_details(
            email_info["industry"],
            email_info["coverage_requested"]["type"]
        )
        
        # New Step: Perform risk assessment on the client company if risk agent is available
        risk_assessment = None
        requires_human_review = False
        risk_level = "unknown"
        
        if self.risk_agent and self.serp_api_key and email_info["client_name"]:
            risk_assessment = self.perform_risk_assessment(email_info["client_name"])
            
            # Check if risk level requires human intervention
            if risk_assessment and "risk_assessment" in risk_assessment:
                risk_data = risk_assessment["risk_assessment"]
                risk_level = risk_data.get("overall_risk_level", "unknown").lower()
                
                # Determine if human review is required based on risk level
                high_risk_indicators = ["high", "extreme"]
                requires_human_review = risk_level in high_risk_indicators
                
                # Also require human review for prohibited industries
                if industry_code["bic_code"] == "N/A (Prohibited)":
                    requires_human_review = True
        
        # Step 9: Generate response email (only if human review not required)
        response_email_data = {
            "client_name": email_info["client_name"],
            "broker_contact": email_info["broker_contact"],
            "coverage_requested": email_info["coverage_requested"],
            "final_premium": premium_info["final_premium"],
            "coverage_limitations": coverage_info["coverage_limitations"],
            "recommended_endorsements": coverage_info["recommended_endorsements"]
        }
        
        # Add broker-appropriate risk information if available
        # Don't share full risk assessment with broker
        if risk_assessment:
            response_email_data["internal_risk_notes"] = risk_assessment.get("underwriter_summary")
        
        # Add authority info for internal reference but not for sharing
        response_email_data["internal_authority_info"] = authority_info["authority_check"]
        
        response_email = None
        human_review_reason = None
        
        if requires_human_review:
            human_review_reason = f"Risk assessment indicates {risk_level} risk level requiring human review"
            if industry_code["bic_code"] == "N/A (Prohibited)":
                human_review_reason = "Industry falls under prohibited classification"
        else:
            response_email = self.generate_response_email(response_email_data, email_content)
        
        # Return all collected information
        result = {
            "email_info": email_info,
            "industry_code": industry_code,
            "base_rate_info": base_rate_info,
            "revenue_info": revenue_info,
            "base_premium_info": base_premium_info,
            "premium_info": premium_info,
            "authority_info": authority_info,
            "coverage_info": coverage_info,
            "requires_human_review": requires_human_review,
            "human_review_reason": human_review_reason,
            "response_email": response_email
        }
        
        # Add risk assessment if available
        if risk_assessment:
            result["risk_assessment"] = risk_assessment
            
        return result
        
    def perform_risk_assessment(self, company_name: str) -> Optional[Dict[str, Any]]:
        """
        Perform a risk assessment on the client company.
        
        Args:
            company_name: The name of the company to assess
            
        Returns:
            Dictionary containing risk assessment information or None if assessment fails
        """
        if not self.risk_agent or not self.serp_api_key:
            return None
            
        try:
            # Generate the risk assessment
            assessment = self.risk_agent.generate_risk_assessment(company_name, self.serp_api_key)
            
            # Generate underwriter summary
            underwriter_summary = self.risk_agent.generate_underwriter_summary(assessment)
            
            return {
                "company_name": assessment["company_name"],
                "assessment_date": assessment["assessment_date"],
                "risk_assessment": assessment["risk_assessment"],
                "underwriter_summary": underwriter_summary
            }
        except Exception as e:
            print(f"Error performing risk assessment: {e}")
            return None

    def extract_email_info(self, email_content: str) -> Dict[str, Any]:
        """Extract structured information from an insurance quote request email."""
        prompt = f"""You are an insurance underwriting assistant. Extract ALL relevant information 
        from this insurance quote request email that would be needed for generating a quote.
        
        Include:
        1. Client name
        2. Industry (based on their PRIMARY business activity)
        3. Coverage requested (type and limits)
        4. Fleet size (if mentioned or applicable)
        5. Urgency of the request
        6. Loss history (if mentioned)
        7. Annual revenue (if mentioned)
        8. Number of employees (if mentioned)
        9. Company size indicators (store square footage, fleet size, etc.)
        10. Business description
        11. Additional requests or considerations
        12. Broker contact information
        
        For industry: Focus on the company's core business function - what they do, not who they serve.
        For urgency: Only return one of: "standard", "urgent", "exploratory", or "preliminary"
        For coverage_requested.limits: Format as $XM where X is the limit in millions
        For fleet_size: Return "N/A" if not applicable to this business type

        Thoroughly analyze the email to identify ALL information that could be relevant for insurance underwriting.
        Include an explanation that describes your reasoning for each extracted data point.

        Email content:
        {email_content}
        """
        
        documents = {"commercial-lines-app-templates.pdf": self.document_paths.get("commercial-lines-app-templates.pdf", "")}
        
        try:
            return self.llm.generate_structured_json(prompt, EmailInfo, documents)
        except Exception:
            # Fallback extraction if LLM doesn't return valid JSON
            return self._fallback_email_extraction(email_content)
    
    def get_industry_code(self, industry: str, industry_explanation: Optional[str] = None) -> Dict[str, str]:
        """Identify the Business Industry Classification (BIC) code for an industry."""
        context = industry_explanation if industry_explanation else ""
        
        prompt = f"""You are an insurance underwriting assistant. Based on the industry description and additional context, determine the appropriate Business Industry Classification (BIC) code.
        
        Reference the industry classification guidelines in the industry-uw-guidelines.pdf document, and use general knowledge to make a determination when a range of codes is given.
        
        Also reference the rating-factors.pdf document to ensure the BIC code you select aligns with our rating categories for premium calculation.
        
        Return a 4 digit BIC code e.g. "4200". Do not leave it blank, and do not give a range of codes. If you cannot find a match, return "N/A (Prohibited)".
        
        IMPORTANT: Include an explanation that explains your reasoning for selecting this BIC code, referencing specific keywords or characteristics from the industry description and how it aligns with our rating categories.

        Industry: {industry}
        Additional Context: {context}
        """
        
        documents = {
            "industry-uw-guidelines.pdf": self.document_paths.get("industry-uw-guidelines.pdf", ""),
            "rating-factors.pdf": self.document_paths.get("rating-factors.pdf", "")
        }
        
        try:
            return self.llm.generate_structured_json(prompt, IndustryCode, documents)
        except Exception as e:
            print(f"Error in get_industry_code: {e}")
            # Fallback with a simplified matching approach
            normalized_industry = industry.lower()
            if any(term in normalized_industry for term in ["transport", "trucking", "freight", "logistics"]):
                return {"bic_code": "42xx"}
            elif any(term in normalized_industry for term in ["manufactur", "industrial", "factory"]):
                return {"bic_code": "35xx"}
            elif any(term in normalized_industry for term in ["restaurant", "cafe", "catering"]):
                return {"bic_code": "58xx"}
            elif any(term in normalized_industry for term in ["retail", "store", "shop", "food"]):
                return {"bic_code": "54xx"}
            elif any(term in normalized_industry for term in ["firework", "explosive", "cannabis", "adult"]):
                return {"bic_code": "N/A (Prohibited)"}
            else:
                return {"bic_code": "42xx"}  # Default to transportation

    def get_base_rate(self, bic_code: str) -> Dict[str, Union[float, str]]:
        """Retrieve the base rate per $1,000 revenue for a given BIC code."""
        prompt = f"""You are an insurance underwriting assistant. Based on the Business Industry Classification (BIC) code,
        determine the appropriate base rate per $1,000 of revenue.
                
        Reference the rating manual and rating factors in the document.
        
        The base rate should be between 0.50 and 5.00, unless this is a prohibited class (then 0.00).
        
        Include an explanation that explains your reasoning for selecting this base rate,
        including any risk factors or industry considerations that influenced your decision.

        BIC Code: {bic_code}
        """
        
        documents = {
            "rating-manual.pdf": self.document_paths.get("rating-manual.pdf", ""),
            "rating-factors.pdf": self.document_paths.get("rating-factors.pdf", "")
        }
        
        try:
            return self.llm.generate_structured_json(prompt, BaseRateInfo, documents)
        except Exception:
            # Fallback with hardcoded rates
            base_rates = {
                "42xx": 1.90,  # Transportation Services
                "35xx": 1.20,  # Manufacturing
                "54xx": 0.85,  # Retail - Food
                "58xx": 1.00,  # Restaurants
                "N/A (Prohibited)": 0.00  # Prohibited class
            }
            return {"base_rate_per_1000": base_rates.get(bic_code, 0.0)}
    
    def estimate_annual_revenue(self, bic_code: str, email_info: Dict[str, Any]) -> Dict[str, Union[int, str]]:
        """Estimate annual revenue based on industry norms and available information."""
        prompt = f"""You are an insurance underwriting assistant. Estimate the annual revenue for this business
        based on ALL available information in the email.

        Reference the rating factors in the rating-factors.pdf document.
        Also reference the industry-uw-guidelines.pdf document for industry-specific revenue benchmarks
        and typical business size characteristics.
        
        Consider these approaches in your estimation:
        1. Use explicitly mentioned revenue if available
        2. Use industry-specific indicators (fleet size, employee count, store size, etc.)
        3. Consider the coverage limits requested (higher limits often correlate with larger businesses)
        4. Use industry averages based on the BIC code
        5. Consider any business descriptions that indicate size or scale
        
        Be adaptable in your approach - different business types have different relevant metrics:
        - Transportation: primarily fleet size-based estimation
        - Manufacturing: employee count and operation scale
        - Retail: store size, locations, inventory value
        - Food service: location count, service type
        - Other industries: use appropriate indicators

        Always provide a reasonable revenue estimate, even with limited information.
        If the business type doesn't have a fleet, don't use fleet size in your calculation.
        
        Include a detailed explanation of your estimation methodology, assumptions, and reasoning.

        Business Industry Classification (BIC) Code: {bic_code}
        
        Extracted Email Information:
        {json.dumps(email_info, indent=2)}
        """
        
        documents = {
            "rating-factors.pdf": self.document_paths.get("rating-factors.pdf", ""),
            "industry-uw-guidelines.pdf": self.document_paths.get("industry-uw-guidelines.pdf", "")
        }
        
        try:
            return self.llm.generate_structured_json(prompt, RevenueInfo, documents)
        except Exception as e:
            print(f"Error in estimate_annual_revenue: {e}")
            # Fallback with a simplified approach
            return self._fallback_revenue_estimation(bic_code, email_info)

    def calculate_base_premium(self, annual_revenue: int, base_rate: float) -> Dict[str, float]:
        """Calculate the base premium based on annual revenue and base rate."""
        base_premium = (annual_revenue / 1000) * base_rate
        return {"base_premium": round(base_premium, 2)}
    
    def calculate_premium_with_modifiers(self, base_premium: float, email_info: Dict[str, Any],
                                       industry_code: str) -> Dict[str, Any]:
        """Apply modifiers to base premium and calculate final premium."""
        prompt = f"""You are an insurance underwriting assistant. Calculate the final premium by applying
        appropriate modifiers to the base premium based on ALL information available.
        
        Consider these modifier categories:
        1. Fleet/Size discount (0.85-1.00): Applies if the business has a fleet; larger fleets get bigger discounts
        2. Loss history factor (0.90-1.25): Better history gets discounts, worse history gets surcharges
        3. Territory factor (0.90-1.05): Depends on operation area
        4. Coverage limit factor (1.00-1.25): Higher limits increase the premium
        5. Business type factor (0.95-1.15): Adjusts based on industry risk level
        6. Other relevant factors based on the specific business and request
        
        IMPORTANT: 
        - Only apply fleet discounts if the business actually has a fleet
        - Apply industry-appropriate modifiers (e.g., manufacturing vs. transportation)
        - Consider the urgency and any special circumstances mentioned in the email
        - Higher liability limits should generally increase the premium

        Include a detailed explanation for each modifier applied, showing your calculation and reasoning.

        Base Premium: ${base_premium:.2f}
        Industry Code: {industry_code}
        
        Extracted Email Information:
        {json.dumps(email_info, indent=2)}
        """
        
        documents = {"rating-factors.pdf": self.document_paths.get("rating-factors.pdf", "")}
        
        try:
            return self.llm.generate_structured_json(prompt, PremiumInfo, documents)
        except Exception as e:
            print(f"Error in calculate_premium_with_modifiers: {e}")
            # Fallback with simplified approach
            return self._fallback_premium_calculation(base_premium, email_info, industry_code)
    
    def parse_coverage_limit(self, limit_str: str) -> float:
        """Parse coverage limit string into a numeric value."""
        match = re.search(r'\$?([0-9.]+)\s*[mM]', limit_str)
        if match:
            return float(match.group(1)) * 1000000
        return 1000000  # Default to $1M if parsing fails

    def check_authority_level(self, coverage_limit: float, bic_code: str) -> Dict[str, Any]:
        """Check if the requested coverage limit falls within underwriting authority."""
        prompt = f"""You are an insurance underwriting assistant. Determine if the requested coverage limit
        falls within the underwriter's authority level based on the BIC code.
        
        Reference the authority levels in the document.
        
        Include an explanation that describes your reasoning process, including
        what authority level thresholds you considered and why you reached your conclusion.

        Coverage Limit: ${coverage_limit:.2f}
        BIC Code: {bic_code}
        """
        
        documents = {"authority-levels.pdf": self.document_paths.get("authority-levels.pdf", "")}
        
        try:
            return self.llm.generate_structured_json(prompt, AuthorityInfo, documents)
        except Exception:
            # Fallback authority check
            risk_level = "standard"
            if bic_code == "58xx":
                risk_level = "non-standard"
            elif bic_code == "N/A (Prohibited)":
                return {
                    "authority_check": "prohibited",
                    "referral_required": True
                }
            
            # Authority limits by risk level
            limits = {
                "standard": {
                    "underwriter": 1000000,
                    "senior_underwriter": 2000000,
                    "manager": 5000000,
                    "regional": 10000000
                },
                "non-standard": {
                    "underwriter": 500000,
                    "senior_underwriter": 1000000,
                    "manager": 2000000,
                    "regional": 5000000
                }
            }
            
            risk_limits = limits.get(risk_level, limits["standard"])
            
            if coverage_limit <= risk_limits["underwriter"]:
                return {
                    "authority_check": "approved",
                    "referral_required": False
                }
            elif coverage_limit <= risk_limits["senior_underwriter"]:
                return {
                    "authority_check": "requires senior management referral",
                    "referral_required": True
                }
            elif coverage_limit <= risk_limits["manager"]:
                return {
                    "authority_check": "requires manager approval",
                    "referral_required": True
                }
            else:
                return {
                    "authority_check": "requires regional approval",
                    "referral_required": True
                }
    
    def get_coverage_details(self, industry: str, coverage_type: str) -> Dict[str, Any]:
        """Determine coverage limitations and recommended endorsements."""
        prompt = f"""You are an insurance underwriting assistant. Determine applicable coverage limitations
        and recommended endorsements based on the industry and coverage type.
        
        Reference the following documents:
        1. coverage-limitations.pdf for industry-specific coverage restrictions
        2. coverage-options.pdf for available coverage enhancements and endorsements
        3. policy-form-library.pdf for specific policy forms and endorsement numbers
        
        For each recommended endorsement, provide the specific form number (e.g., "CG 20 10") 
        from the policy-form-library.pdf when available, along with its title.
        
        Include an explanation that explains your reasoning for each recommended
        endorsement and coverage limitation, referencing specific industry risks and
        how these address the client's needs.

        Industry: {industry}
        Coverage Type: {coverage_type}
        """
        
        documents = {
            "coverage-limitations.pdf": self.document_paths.get("coverage-limitations.pdf", ""),
            "coverage-options.pdf": self.document_paths.get("coverage-options.pdf", ""),
            "policy-form-library.pdf": self.document_paths.get("policy-form-library.pdf", "")
        }
        
        try:
            return self.llm.generate_structured_json(prompt, CoverageInfo, documents)
        except Exception:
            # Fallback coverage details
            normalized_industry = industry.lower()
            normalized_coverage = coverage_type.lower()
            
            # Default values
            limitations = "Standard terms and conditions apply."
            endorsements = ["Additional Insured Endorsement"]
            
            # Transportation-specific
            if any(term in normalized_industry for term in ["transport", "trucking", "fleet"]):
                if any(term in normalized_coverage for term in ["auto", "fleet", "liability"]):
                    limitations = "Coverage is subject to driver experience requirements and radius of operation limitations."
                    endorsements = ["Motor Truck Cargo Coverage", "Trailer Interchange Coverage"]
            
            # Agricultural-specific
            if "agricult" in normalized_industry:
                limitations = "No restrictions noted for agricultural transportation operations."
                endorsements = ["Agricultural Transport Endorsement"]
            
            return {
                "coverage_limitations": limitations,
                "recommended_endorsements": endorsements
            }
    
    def generate_response_email(self, quote_info: Dict[str, Any], original_email_content: str) -> str:
        """Generate a professional response email for the insurance quote request."""
        # Ensure we're using the correct variable names and values
        prompt = f"""You are an insurance underwriter. Generate a professional response email for an insurance
        quote request with the following information:
        
        The email should:
        1. Be professionally formatted
        2. Include a subject line
        3. Address the broker by name
        4. Provide the quote details (or explain why a quote cannot be provided)
        5. Request any additional information needed
        6. Include standard closing
        7. Do not explicitly mention the documents you are referencing (like policy-form-library.pdf or commercial-lines-app-templates.pdf)
        8. Maintain a personalized tone that responds to the specific context, questions, and concerns raised in the original email
        
        IMPORTANT: This is an external communication with a broker. DO NOT include any internal risk assessment information, risk levels, or detailed company risk factors. Those are for internal use only. DO NOT mention the internal documents you are referencing (such as policy-form-library.pdf or commercial-lines-app-templates.pdf) in the response email.
        
        Do not include any placeholders like [Insurance Company Representative].
        Use "Insurance Underwriter" in the signature if no other name is provided.
        
        Reference the policy-form-library.pdf document to cite specific policy forms by number, particularly when mentioning coverages and endorsements.
        
        Reference the commercial-lines-app-templates.pdf document to identify any additional information that would be required to complete the application, and request that information if it appears to be missing from the original submission.

        Original Email:
        {original_email_content}
        
        Client Name: {quote_info.get('client_name', 'the client')}
        Coverage Requested: {quote_info.get('coverage_requested', {}).get('type', 'insurance coverage')} with {quote_info.get('coverage_requested', {}).get('limits', 'unspecified limits')}
        Final Premium: ${quote_info.get('final_premium', 0.00):.2f}
        Coverage Limitations: {quote_info.get('coverage_limitations', 'Standard terms apply.')}
        Recommended Endorsements: {', '.join(quote_info.get('recommended_endorsements', ['None specified']))}
        Broker Name: {quote_info.get('broker_contact', {}).get('name', 'Insurance Broker')}
        """
        
        documents = {
            "policy-form-library.pdf": self.document_paths.get("policy-form-library.pdf", ""),
            "commercial-lines-app-templates.pdf": self.document_paths.get("commercial-lines-app-templates.pdf", "")
        }
        
        response = self.llm.generate_text(prompt, documents)
        return response
    
    def _fallback_email_extraction(self, email_content: str) -> Dict[str, Any]:
        """Simple regex-based fallback for extracting email information."""
        result = {
            "client_name": "",
            "industry": "",
            "coverage_requested": {
                "type": "",
                "limits": ""
            },
            "fleet_size": 0,
            "urgency": "standard",
            "loss_history": "",
            "additional_requests": [],
            "broker_contact": {
                "name": "",
                "brokerage": "",
                "email": ""
            }
        }
        
        # Extract client name
        client_match = re.search(r'for\s+([^,\n.]+)', email_content)
        if client_match:
            result["client_name"] = client_match.group(1).strip()
        
        # Extract fleet size
        fleet_match = re.search(r'([0-9]+)\s*(?:commercial)?\s*vehicles?', email_content)
        if fleet_match:
            result["fleet_size"] = int(fleet_match.group(1))
        
        # Extract coverage limit
        limit_match = re.search(r'\$([0-9.]+)\s*million', email_content)
        if limit_match:
            result["coverage_requested"]["limits"] = f"${limit_match.group(1)}M"
        
        # Determine industry
        if "transport" in email_content.lower():
            result["industry"] = "Transportation"
        elif "manufactur" in email_content.lower():
            result["industry"] = "Manufacturing"
        
        # Extract coverage type
        if "liability" in email_content.lower():
            result["coverage_requested"]["type"] = "Liability Insurance"
        elif "fleet" in email_content.lower():
            result["coverage_requested"]["type"] = "Commercial Fleet Insurance"
        
        return result 

    def _fallback_revenue_estimation(self, bic_code: str, email_info: Dict[str, Any]) -> Dict[str, int]:
        """Simple fallback for revenue estimation if LLM fails."""
        # Set default revenue based on industry
        industry_defaults = {
            "42xx": 1500000,  # Transportation
            "35xx": 3000000,  # Manufacturing
            "54xx": 1200000,  # Retail 
            "58xx": 800000,   # Food Service
            "N/A (Prohibited)": 0
        }
        
        # Try to use explicitly mentioned revenue first
        if "revenue" in email_info and email_info["revenue"]:
            try:
                return {"estimated_annual_revenue": int(email_info["revenue"])}
            except (ValueError, TypeError):
                pass
        
        # Extract revenue from coverage limit as fallback
        coverage_requested = email_info.get("coverage_requested", {})
        limit_str = coverage_requested.get("limits", "$1M")
        limit_match = re.search(r'\$?([0-9.]+)\s*[mM]', limit_str)
        
        estimated_revenue = industry_defaults.get(bic_code[:4], 1500000)
        if limit_match:
            limit_value = float(limit_match.group(1))
            if limit_value > 5:
                estimated_revenue *= 2  # Double default for high limits
        
        return {"estimated_annual_revenue": estimated_revenue}

    def _fallback_premium_calculation(self, base_premium: float, email_info: Dict[str, Any], 
                                   industry_code: str) -> Dict[str, Any]:
        """Simple fallback for premium calculation if LLM fails."""
        modifiers = {
            "loss_history_factor": 1.0,
            "limit_factor": 1.0,
            "business_factor": 1.0
        }
        
        # Basic limit factor
        coverage_requested = email_info.get("coverage_requested", {})
        limit_str = coverage_requested.get("limits", "$1M")
        limit_match = re.search(r'\$?([0-9.]+)\s*[mM]', limit_str)
        if limit_match:
            limit_value = float(limit_match.group(1))
            if limit_value >= 10:
                modifiers["limit_factor"] = 1.25
            elif limit_value >= 5:
                modifiers["limit_factor"] = 1.15
            elif limit_value >= 2:
                modifiers["limit_factor"] = 1.05
        
        # Calculate final premium
        final_premium = base_premium
        for factor_name, factor_value in modifiers.items():
            final_premium *= factor_value
        
        return {
            "modifiers": modifiers,
            "final_premium": round(final_premium, 2)
        } 

    def generate_human_review_notification(self, result: Dict[str, Any]) -> str:
        """
        Generate a notification for the underwriter when human review is required.
        
        Args:
            result: The complete processing result dictionary
            
        Returns:
            String containing notification text for underwriters
        """
        if not result.get("requires_human_review", False):
            return "No human review required."
        
        email_info = result.get("email_info", {})
        risk_assessment = result.get("risk_assessment", {})
        
        prompt = f"""Generate a concise notification for the underwriting team about a high-risk quote request that requires human review.
        
        Include:
        1. Client name and industry
        2. Brief summary of the coverage requested
        3. The specific reason human review is required: {result.get("human_review_reason", "Unknown reason")}
        4. Key risk factors identified in the assessment
        5. Any authority considerations
        
        Format the notification as a prioritized alert for immediate attention.
        
        Client: {email_info.get("client_name", "Unknown client")}
        Industry: {email_info.get("industry", "Unknown industry")}
        Coverage: {email_info.get("coverage_requested", {}).get("type", "Unknown")} with limits {email_info.get("coverage_requested", {}).get("limits", "unspecified")}
        Risk Level: {risk_assessment.get("risk_assessment", {}).get("overall_risk_level", "Unknown")}
        """
        
        return self.llm.generate_text(prompt, {})