import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from serpapi import GoogleSearch
from pydantic import BaseModel, Field
from modules.schemas import RiskAssessmentResult
from config.config import Config

class InsuranceRiskAgent:
    def __init__(self, llm_client):
        """
        Initialize the Insurance Risk Assessment Agent with LLM client
        
        Args:
            llm_client: The LLM client to use for processing
        """
        self.llm = llm_client
        
        # Define risk assessment prompts
        self.risk_assessment_prompt = """
        You are an expert insurance risk assessor. Analyze the following company data and provide a comprehensive risk assessment including:
        1. Financial Stability Analysis
        2. Industry Risk Factors
        3. Claims History Analysis
        4. Market Position Assessment
        5. Overall Risk Rating (must be EXACTLY one of: "low", "medium", "high", or "extreme")

        Company Data:
        {company_data}
        
        Recent News and Updates:
        {news_data}
        
        Provide your assessment in a structured format, specifically:
        - overall_risk_level: One of "low", "medium", "high", or "extreme" ONLY
        - risk_factors: List of specific risk factors identified
        - financial_stability: Assessment of financial stability (string)
        - market_position: Assessment of market position (string)
        - claims_history: Assessment of claims history (string)
        - detailed_assessment: Longer detailed assessment
        
        Return your assessment as valid JSON.
        """

    def get_company_data(self, company_name: str, serp_api_key: str = None) -> Dict:
        """
        Fetch company information using SERP API
        
        Args:
            company_name: Name of the company to analyze
            serp_api_key: API key for SERP API
            
        Returns:
            Dict: Structured company information
        """
        # Use Config.SERP_API_KEY as fallback if not provided
        api_key = serp_api_key or Config.SERP_API_KEY
        
        # Search for company information
        search = GoogleSearch({
            "q": f"{company_name} company financials annual report",
            "api_key": api_key,
            "num": 5
        })
        results = search.get_dict()
        
        # Search for news articles
        news_search = GoogleSearch({
            "q": f"{company_name} insurance claims news",
            "api_key": api_key,
            "tbm": "nws",
            "num": 5
        })
        news_results = news_search.get_dict()
        
        return {
            "company_info": results.get("organic_results", []),
            "news": news_results.get("news_results", [])
        }

    def process_company_data(self, raw_data: Dict) -> Dict:
        """
        Process and structure the raw company data
        
        Args:
            raw_data: Raw data from SERP API
            
        Returns:
            Dict: Processed and structured company data
        """
        company_info = []
        for result in raw_data.get("company_info", []):
            company_info.append({
                "title": result.get("title", ""),
                "snippet": result.get("snippet", ""),
                "link": result.get("link", "")
            })
            
        news_info = []
        for news in raw_data.get("news", []):
            news_info.append({
                "title": news.get("title", ""),
                "snippet": news.get("snippet", ""),
                "date": news.get("date", "")
            })
            
        return {
            "company_data": company_info,
            "news_data": news_info
        }

    def generate_risk_assessment(self, company_name: str, serp_api_key: str = None) -> Dict:
        """
        Generate a complete risk assessment for the given company
        
        Args:
            company_name: Name of the company to assess
            serp_api_key: API key for SERP API
            
        Returns:
            Dict: Comprehensive risk assessment report
        """
        # Use Config.SERP_API_KEY as fallback if not provided
        api_key = serp_api_key or Config.SERP_API_KEY
        
        # Fetch and process company data
        raw_data = self.get_company_data(company_name, api_key)
        processed_data = self.process_company_data(raw_data)
        
        # Prepare data for LLM prompt
        company_data_str = json.dumps(processed_data["company_data"], indent=2)
        news_data_str = json.dumps(processed_data["news_data"], indent=2)
        
        # Define the schema for risk assessment
        class RiskAssessmentSchema(BaseModel):
            overall_risk_level: str = Field(description="Overall risk level (low, medium, high, or extreme)")
            risk_factors: List[str] = Field(description="List of identified risk factors")
            financial_stability: str = Field(description="Assessment of financial stability")
            market_position: str = Field(description="Assessment of market position")
            claims_history: str = Field(description="Assessment of claims history")
            detailed_assessment: str = Field(description="Detailed risk assessment narrative")
        
        try:
            # Generate structured risk assessment using JSON schema
            risk_data = self.llm.generate_structured_json(
                prompt=self.risk_assessment_prompt.format(
                    company_data=company_data_str,
                    news_data=news_data_str
                ),
                schema_model=RiskAssessmentSchema
            )
            
            # Ensure risk level is one of the allowed values
            allowed_risk_levels = ["low", "medium", "high", "extreme"]
            if risk_data.get("overall_risk_level", "").lower() not in allowed_risk_levels:
                risk_data["overall_risk_level"] = "medium"  # Default if invalid
                
            # Complete assessment data
            assessment = {
                "company_name": company_name,
                "assessment_date": datetime.now().isoformat(),
                "raw_data": processed_data,
                "risk_assessment": risk_data  # Now a structured dictionary
            }
            
            return assessment
            
        except Exception as e:
            print(f"Error generating structured risk assessment: {e}")
            # Return fallback assessment
            return {
                "company_name": company_name,
                "assessment_date": datetime.now().isoformat(),
                "risk_assessment": {
                    "overall_risk_level": "unknown",
                    "risk_factors": ["Unable to assess risk factors"],
                    "financial_stability": "Unknown",
                    "market_position": "Unknown",
                    "claims_history": "Unknown",
                    "detailed_assessment": f"Risk assessment failed: {str(e)}"
                }
            }

    def generate_underwriter_summary(self, assessment: Dict) -> str:
        """
        Create a concise, underwriter-friendly summary of the risk assessment
        
        Args:
            assessment: Risk assessment data
            
        Returns:
            str: Formatted summary for underwriters
        """
        # Generate summary using our existing LLM client
        risk_data = assessment.get("risk_assessment", {})
        risk_level = risk_data.get("overall_risk_level", "unknown")
        risk_factors = risk_data.get("risk_factors", [])
        financial_stability = risk_data.get("financial_stability", "")
        detailed_assessment = risk_data.get("detailed_assessment", "")
        
        prompt = f"""
        You are an expert insurance underwriter summarizer. Create a concise summary highlighting key risk factors, recommendations, and critical data points.
        
        Create a clear, concise underwriter summary from this risk assessment. 
        Include:
        - Executive Summary (2-3 sentences)
        - Key Risk Factors (bulleted)
        - Critical Financial Metrics
        - Recommendations
        - Overall Risk Rating: {risk_level}
        
        Risk Factors:
        {', '.join(risk_factors)}
        
        Financial Stability:
        {financial_stability}
        
        Detailed Assessment:
        {detailed_assessment}
        """
        
        summary = self.llm.generate_text(prompt=prompt)
        
        # Format the summary with timestamps and metadata
        formatted_summary = f"""
INSURANCE RISK ASSESSMENT SUMMARY
================================
Company: {assessment['company_name']}
Assessment Date: {assessment['assessment_date']}
Overall Risk Level: {risk_level.upper()}
--------------------------------

{summary}

--------------------------------
Generated by Insurance Risk Assessment Agent
Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        """
        
        return formatted_summary