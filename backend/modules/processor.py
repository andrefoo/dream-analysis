from __future__ import absolute_import
from config.celery import app
import time
from config.db import connect_db
from models.Email import Email
from datetime import datetime
from modules.insurance_pipeline import InsurancePipeline
from modules.llm_client import LLMClient
import os
from config.config import Config

# Initialize database connection
connect_db()

# Define document paths
document_paths = {
    "industry-uw-guidelines.pdf": "./mock-docs/industry-uw-guidelines.pdf",
    "rating-manual.pdf": "./mock-docs/rating-manual.pdf",
    "rating-factors.pdf": "./mock-docs/rating-factors.pdf",
    "authority-levels.pdf": "./mock-docs/authority-levels.pdf",
    "coverage-limitations.pdf": "./mock-docs/coverage-limitations.pdf",
    "coverage-options.pdf": "./mock-docs/coverage-options.pdf",
    "commercial-lines-app-templates.pdf": "./mock-docs/commercial-lines-app-templates.pdf",
    "policy-form-library.pdf": "./mock-docs/policy-form-library.pdf"
}

@app.task
def process_document(mongo_id):
    """Main task that orchestrates the entire processing pipeline"""
    print(f"Starting email processing for ID: {mongo_id}")
    
    try:
        # Update status to processing
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.status = "processing"
        email_doc.current_step = "initializing"
        email_doc.processing_start_time = datetime.now()
        email_doc.save()
        
        # Chain the tasks together
        extract_email_info.delay(mongo_id)
        
        return True
        
    except Exception as e:
        print(f"Error starting email processing {mongo_id}: {e}")
        try:
            # Update status to failed
            email_doc = Email.objects.get(id=mongo_id)
            email_doc.status = "failed"
            email_doc.error_message = str(e)
            email_doc.processing_end_time = datetime.now()
            email_doc.save()
        except Exception as update_error:
            print(f"Error updating email status: {update_error}")
        
        return False

@app.task
def extract_email_info(mongo_id):
    """Task to extract information from the email"""
    try:
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.current_step = "extracting_email_info"
        email_doc.save()
        
        # Initialize LLM client
        llm_client = LLMClient()
        
        # Get SERP API key from Config
        serp_api_key = Config.SERP_API_KEY
        
        # Initialize insurance pipeline
        pipeline = InsurancePipeline(llm_client, document_paths, serp_api_key)
        
        # Process the email content to extract information
        email_info = pipeline.extract_email_info(email_doc.body_content)
        
        # Store email extraction results
        email_doc.client_name = email_info.get("client_name", "")
        email_doc.industry = email_info.get("industry", "")
        
        coverage_requested = email_info.get("coverage_requested", {})
        email_doc.coverage_requested_type = coverage_requested.get("type", "")
        email_doc.coverage_requested_limits = coverage_requested.get("limits", "")
        
        email_doc.fleet_size = email_info.get("fleet_size", 0)
        email_doc.urgency = email_info.get("urgency", "standard")
        email_doc.loss_history = email_info.get("loss_history", "")
        email_doc.annual_revenue = email_info.get("annual_revenue", 0)
        email_doc.employee_count = email_info.get("employee_count", 0)
        email_doc.business_description = email_info.get("business_description", "")
        
        broker_contact = email_info.get("broker_contact", {})
        email_doc.broker_name = broker_contact.get("name", "")
        email_doc.broker_brokerage = broker_contact.get("brokerage", "")
        email_doc.broker_email = broker_contact.get("email", "")
        
        # Store email extraction step details
        email_doc.email_extraction_input = email_doc.body_content
        email_doc.email_extraction_output = email_info
        email_doc.email_extraction_explanation = email_info.get("explanation", "")
        email_doc.save()
        
        # Chain to the next task
        determine_industry_code.delay(mongo_id)
        
    except Exception as e:
        handle_task_error(mongo_id, "extracting_email_info", str(e))

@app.task
def determine_industry_code(mongo_id):
    """Task to determine the industry code"""
    try:
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.current_step = "determining_industry_code"
        email_doc.save()
        
        # Initialize components
        llm_client = LLMClient()
        pipeline = InsurancePipeline(llm_client, document_paths, Config.SERP_API_KEY)
        
        # Get industry code
        industry_code_input = {"industry": email_doc.industry, "explanation": email_doc.email_extraction_explanation}
        industry_code = pipeline.get_industry_code(industry_code_input)
        
        # Store results
        email_doc.bic_code = industry_code.get("bic_code", "")
        email_doc.industry_code_input = industry_code_input
        email_doc.industry_code_output = industry_code
        email_doc.industry_code_explanation = industry_code.get("explanation", "")
        email_doc.save()
        
        # Chain to the next task
        determine_base_rate.delay(mongo_id)
        
    except Exception as e:
        handle_task_error(mongo_id, "determining_industry_code", str(e))

@app.task
def determine_base_rate(mongo_id):
    """Task to determine the base rate"""
    try:
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.current_step = "determining_base_rate"
        email_doc.save()
        
        # Initialize components
        llm_client = LLMClient()
        pipeline = InsurancePipeline(llm_client, document_paths, Config.SERP_API_KEY)
        
        # Get base rate
        base_rate_input = {"bic_code": email_doc.bic_code}
        base_rate_info = pipeline.get_base_rate(base_rate_input)  # Changed from determine_base_rate to get_base_rate
        
        # Store results
        email_doc.base_rate_per_1000 = base_rate_info.get("base_rate_per_1000", 0.0)
        email_doc.base_rate_input = base_rate_input
        email_doc.base_rate_output = base_rate_info
        email_doc.base_rate_explanation = base_rate_info.get("explanation", "")
        email_doc.save()
        
        # Chain to the next task
        estimate_revenue.delay(mongo_id)
        
    except Exception as e:
        handle_task_error(mongo_id, "determining_base_rate", str(e))

@app.task
def estimate_revenue(mongo_id):
    """Task to estimate revenue if not provided"""
    try:
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.current_step = "estimating_revenue"
        email_doc.save()
        
        # Initialize components
        llm_client = LLMClient()
        pipeline = InsurancePipeline(llm_client, document_paths, Config.SERP_API_KEY)
        
        # Get revenue estimation
        email_info = email_doc.email_extraction_output
        # Pass email_info directly as an argument, not in a dictionary
        revenue_info = pipeline.estimate_annual_revenue(email_doc.bic_code, email_info)
        
        # Store results
        email_doc.estimated_annual_revenue = revenue_info.get("estimated_annual_revenue", 0)
        email_doc.revenue_estimation_input = {
            "bic_code": email_doc.bic_code,
            "email_info": email_info
        }
        email_doc.revenue_estimation_output = revenue_info
        email_doc.revenue_estimation_explanation = revenue_info.get("explanation", "")
        email_doc.save()
        
        # Chain to the next task
        calculate_base_premium.delay(mongo_id)
        
    except Exception as e:
        handle_task_error(mongo_id, "estimating_revenue", str(e))

@app.task
def calculate_base_premium(mongo_id):
    """Task to calculate the base premium"""
    try:
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.current_step = "calculating_base_premium"
        email_doc.save()
        
        # Initialize components
        llm_client = LLMClient()
        pipeline = InsurancePipeline(llm_client, document_paths, Config.SERP_API_KEY)
        
        # Calculate base premium - pass parameters directly instead of as a dictionary
        annual_revenue = email_doc.estimated_annual_revenue
        base_rate = email_doc.base_rate_per_1000
        base_premium_info = pipeline.calculate_base_premium(annual_revenue, base_rate)
        
        # Store results
        email_doc.base_premium = base_premium_info.get("base_premium", 0.0)
        email_doc.base_premium_input = {
            "annual_revenue": annual_revenue,
            "base_rate": base_rate
        }
        email_doc.base_premium_output = base_premium_info
        email_doc.save()
        
        # Chain to the next task
        apply_premium_modifiers.delay(mongo_id)
        
    except Exception as e:
        handle_task_error(mongo_id, "calculating_base_premium", str(e))

@app.task
def apply_premium_modifiers(mongo_id):
    """Task to apply premium modifiers"""
    try:
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.current_step = "applying_premium_modifiers"
        email_doc.save()
        
        # Initialize components
        llm_client = LLMClient()
        pipeline = InsurancePipeline(llm_client, document_paths, Config.SERP_API_KEY)
        
        # Apply premium modifiers - pass parameters directly instead of as a dictionary
        base_premium = email_doc.base_premium
        email_info = email_doc.email_extraction_output
        industry_code = email_doc.bic_code
        premium_info = pipeline.calculate_premium_with_modifiers(base_premium, email_info, industry_code)
        
        # Store results
        email_doc.final_premium = premium_info.get("final_premium", 0.0)
        email_doc.premium_modifiers = premium_info.get("modifiers", {})
        email_doc.premium_modifiers_input = {
            "base_premium": base_premium,
            "email_info": email_info,
            "industry_code": industry_code
        }
        email_doc.premium_modifiers_output = premium_info
        email_doc.premium_modifiers_explanation = premium_info.get("explanation", "")
        email_doc.save()
        
        # Chain to the next task
        check_authority.delay(mongo_id)
        
    except Exception as e:
        handle_task_error(mongo_id, "applying_premium_modifiers", str(e))

@app.task
def check_authority(mongo_id):
    """Task to check authority levels"""
    try:
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.current_step = "checking_authority"
        email_doc.save()
        
        # Initialize components
        llm_client = LLMClient()
        pipeline = InsurancePipeline(llm_client, document_paths, Config.SERP_API_KEY)
        
        # Check authority - pass parameters directly instead of as a dictionary
        coverage_limit = pipeline.parse_coverage_limit(email_doc.coverage_requested_limits)
        bic_code = email_doc.bic_code
        authority_info = pipeline.check_authority_level(coverage_limit, bic_code)
        
        # Store results
        email_doc.authority_check = authority_info.get("authority_check", "")
        email_doc.referral_required = authority_info.get("referral_required", False)
        email_doc.authority_check_input = {
            "coverage_limit": email_doc.coverage_requested_limits,
            "bic_code": bic_code
        }
        email_doc.authority_check_output = authority_info
        email_doc.authority_check_explanation = authority_info.get("explanation", "")
        email_doc.save()
        
        # Chain to the next task
        determine_coverage_details.delay(mongo_id)
        
    except Exception as e:
        handle_task_error(mongo_id, "checking_authority", str(e))

@app.task
def determine_coverage_details(mongo_id):
    """Task to determine coverage details"""
    try:
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.current_step = "determining_coverage_details"
        email_doc.save()
        
        # Initialize components
        llm_client = LLMClient()
        pipeline = InsurancePipeline(llm_client, document_paths, Config.SERP_API_KEY)
        
        # Get coverage details - changed method name to match InsurancePipeline implementation
        coverage_input = {
            "industry": email_doc.industry,
            "coverage_type": email_doc.coverage_requested_type
        }
        coverage_info = pipeline.get_coverage_details(email_doc.industry, email_doc.coverage_requested_type)
        
        # Store results
        email_doc.coverage_limitations = coverage_info.get("coverage_limitations", "")
        email_doc.recommended_endorsements = coverage_info.get("recommended_endorsements", [])
        email_doc.coverage_details_input = coverage_input
        email_doc.coverage_details_output = coverage_info
        email_doc.coverage_details_explanation = coverage_info.get("explanation", "")
        email_doc.save()
        
        # Chain to the next task
        assess_risk.delay(mongo_id)
        
    except Exception as e:
        handle_task_error(mongo_id, "determining_coverage_details", str(e))

@app.task
def assess_risk(mongo_id):
    """Task to assess risk"""
    try:
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.current_step = "assessing_risk"
        email_doc.save()
        
        # Initialize components
        llm_client = LLMClient()
        pipeline = InsurancePipeline(llm_client, document_paths, Config.SERP_API_KEY)
        
        # Assess risk - changed method name to match InsurancePipeline implementation
        company_name = email_doc.client_name
        risk_assessment = pipeline.perform_risk_assessment(company_name)
        
        # Store results
        risk_data = risk_assessment.get("risk_assessment", {}) if risk_assessment else {}
        
        email_doc.risk_level = risk_data.get("overall_risk_level", "unknown")
        email_doc.risk_factors = risk_data.get("risk_factors", [])
        email_doc.financial_stability = risk_data.get("financial_stability", "")
        email_doc.market_position = risk_data.get("market_position", "")
        email_doc.claims_history = risk_data.get("claims_history", "")
        email_doc.risk_assessment_summary = risk_assessment.get("underwriter_summary", "") if risk_assessment else ""
        
        email_doc.risk_assessment_input = {"company_name": company_name}
        email_doc.risk_assessment_output = risk_assessment
        email_doc.risk_assessment_explanation = risk_data.get("detailed_assessment", "")
        email_doc.save()
        
        # Chain to the next task
        generate_response_email.delay(mongo_id)
        
    except Exception as e:
        handle_task_error(mongo_id, "assessing_risk", str(e))

@app.task
def generate_response_email(mongo_id):
    """Task to generate response email"""
    try:
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.current_step = "generating_response"
        email_doc.save()
        
        # Initialize components
        llm_client = LLMClient()
        pipeline = InsurancePipeline(llm_client, document_paths, Config.SERP_API_KEY)
        
        # Generate response email
        response_input = {
            "client_name": email_doc.client_name,
            "broker_contact": {
                "name": email_doc.broker_name,
                "brokerage": email_doc.broker_brokerage,
                "email": email_doc.broker_email
            },
            "coverage_requested": {
                "type": email_doc.coverage_requested_type,
                "limits": email_doc.coverage_requested_limits
            },
            "final_premium": email_doc.final_premium,
            "coverage_limitations": email_doc.coverage_limitations,
            "recommended_endorsements": email_doc.recommended_endorsements
        }
        
        response_email = pipeline.generate_response_email(response_input, email_doc.body_content)
        
        # Store results
        email_doc.response_email = response_email
        email_doc.response_email_input = response_input
        email_doc.save()
        
        # Chain to the final task
        finalize_processing.delay(mongo_id)
        
    except Exception as e:
        handle_task_error(mongo_id, "generating_response", str(e))

@app.task
def finalize_processing(mongo_id):
    """Task to finalize the processing"""
    try:
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.current_step = "finalizing"
        
        # Determine if human review is needed
        requires_review = False
        review_reason = ""
        
        # Check for conditions that would require human review
        if email_doc.referral_required:
            requires_review = True
            review_reason = "Authority limits exceeded"
        elif email_doc.risk_level in ["high", "very high"]:
            requires_review = True
            review_reason = f"High risk level: {email_doc.risk_level}"
        
        # Update final status
        email_doc.requires_human_review = requires_review
        email_doc.human_review_reason = review_reason
        
        if email_doc.requires_human_review:
            email_doc.status = "requires_human_review"
        else:
            email_doc.status = "completed"
        
        email_doc.processing_end_time = datetime.now()
        processing_time = (email_doc.processing_end_time - email_doc.processing_start_time).total_seconds() * 1000
        email_doc.processing_time_ms = int(processing_time)
        
        # Clear the current_step since processing is complete
        email_doc.current_step = ""
        
        email_doc.save()
        
        print(f"Email processing completed for ID: {mongo_id}, Status: {email_doc.status}")
        return True
        
    except Exception as e:
        handle_task_error(mongo_id, "finalizing", str(e))
        return False

def handle_task_error(mongo_id, step, error_message):
    """Helper function to handle errors in tasks"""
    print(f"Error in {step} for email {mongo_id}: {error_message}")
    try:
        # Update status to failed
        email_doc = Email.objects.get(id=mongo_id)
        email_doc.status = "failed"
        email_doc.current_step = step
        email_doc.error_message = error_message
        email_doc.processing_end_time = datetime.now()
        email_doc.save()
    except Exception as update_error:
        print(f"Error updating email status: {update_error}")