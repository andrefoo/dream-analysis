from .base_model import BaseModel
from mongoengine import *
from config import Config
from typing import Literal, Dict, Any


###cost to pricing
class Email(BaseModel):
    # Basic email metadata
    subject: str = StringField(required=True)
    sender: str = StringField(required=True)
    recipient: str = StringField(required=True)
    received_date = DateTimeField(required=True)
    body_content: str = StringField(required=True)
    
    # Extracted information
    client_name: str = StringField(required=False)
    industry: str = StringField(required=False)
    coverage_requested_type: str = StringField(required=False)
    coverage_requested_limits: str = StringField(required=False)
    fleet_size: int = IntField(required=False)
    urgency: str = StringField(required=False, choices=["standard", "urgent", "exploratory", "preliminary"])
    loss_history: str = StringField(required=False)
    annual_revenue: int = IntField(required=False)
    employee_count: int = IntField(required=False)
    business_description: str = StringField(required=False)
    additional_requests: list = ListField(StringField(), required=False)
    
    # Broker information
    broker_name: str = StringField(required=False)
    broker_brokerage: str = StringField(required=False)
    broker_email: str = StringField(required=False)
    
    # Processing steps with inputs, outputs, and explanations
    # Step 1: Email extraction
    email_extraction_input = StringField(required=False)  # Raw email content
    email_extraction_output = DictField(required=False)   # Structured extraction result
    email_extraction_explanation = StringField(required=False)  # LLM's reasoning
    
    # Step 2: Industry code identification
    industry_code_input = DictField(required=False)  # Industry description and context
    industry_code_output = DictField(required=False)  # BIC code result
    industry_code_explanation = StringField(required=False)  # Reasoning for BIC code selection
    bic_code: str = StringField(required=False)  # Final BIC code (for quick access)
    
    # Step 3: Base rate determination
    base_rate_input = DictField(required=False)  # BIC code and other inputs
    base_rate_output = DictField(required=False)  # Base rate result
    base_rate_explanation = StringField(required=False)  # Reasoning for base rate
    base_rate_per_1000: float = FloatField(required=False)  # Final base rate (for quick access)
    
    # Step 4: Revenue estimation
    revenue_estimation_input = DictField(required=False)  # BIC code and email info
    revenue_estimation_output = DictField(required=False)  # Revenue estimation result
    revenue_estimation_explanation = StringField(required=False)  # Reasoning for revenue estimate
    estimated_annual_revenue: int = IntField(required=False)  # Final revenue estimate (for quick access)
    
    # Step 5: Base premium calculation
    base_premium_input = DictField(required=False)  # Revenue and base rate
    base_premium_output = DictField(required=False)  # Base premium result
    base_premium: float = FloatField(required=False)  # Final base premium (for quick access)
    
    # Step 6: Premium with modifiers
    premium_modifiers_input = DictField(required=False)  # Base premium and email info
    premium_modifiers_output = DictField(required=False)  # Premium with modifiers result
    premium_modifiers_explanation = StringField(required=False)  # Reasoning for each modifier
    final_premium: float = FloatField(required=False)  # Final premium (for quick access)
    premium_modifiers = DictField(required=False)  # Individual modifiers (for quick access)
    
    # Step 7: Authority check
    authority_check_input = DictField(required=False)  # Coverage limit and BIC code
    authority_check_output = DictField(required=False)  # Authority check result
    authority_check_explanation = StringField(required=False)  # Reasoning for authority determination
    authority_check: str = StringField(required=False)  # Final authority check (for quick access)
    referral_required: bool = BooleanField(required=False, default=False)  # Quick access flag
    
    # Step 8: Coverage details
    coverage_details_input = DictField(required=False)  # Industry and coverage type
    coverage_details_output = DictField(required=False)  # Coverage details result
    coverage_details_explanation = StringField(required=False)  # Reasoning for coverage recommendations
    coverage_limitations: str = StringField(required=False)  # Final limitations (for quick access)
    recommended_endorsements = ListField(StringField(), required=False)  # Final endorsements (for quick access)
    
    # Risk assessment
    risk_assessment_input = DictField(required=False)  # Company name and search results
    risk_assessment_output = DictField(required=False)  # Complete risk assessment
    risk_assessment_explanation = StringField(required=False)  # Reasoning for risk assessment
    risk_level: str = StringField(required=False, choices=["low", "medium", "high", "extreme", "unknown"])
    risk_factors = ListField(StringField(), required=False)
    financial_stability: str = StringField(required=False)
    market_position: str = StringField(required=False)
    claims_history: str = StringField(required=False)
    risk_assessment_summary: str = StringField(required=False)
    
    # Response generation
    response_email_input = DictField(required=False)  # Quote info and original email
    response_email: str = StringField(required=False)  # Generated response
    
    # Processing status
    status: str = StringField(
        required=True, 
        default="pending",
        choices=["pending", "processing", "completed", "failed", "requires_human_review"]
    )
    human_review_reason: str = StringField(required=False)
    
    # Processing metadata
    processing_start_time = DateTimeField(required=False)
    processing_end_time = DateTimeField(required=False)
    processing_time_ms: int = IntField(required=False)
    current_step: str = StringField(required=False)
    error_message: str = StringField(required=False)
    seen: bool = BooleanField(required=False, default=False)
    
    # User interaction tracking
    reviewed_by: str = StringField(required=False)
    reviewed_at = DateTimeField(required=False)
    manual_adjustments = DictField(required=False)  # Track any manual changes made
    notes = StringField(required=False)  # Underwriter notes
    
    meta = {
        "indexes": [
            "client_name", 
            "created_at", 
            "status", 
            "bic_code", 
            "risk_level",
            "referral_required",
            "reviewed_by",
            "processing_start_time"
        ],
        "collection": "insurance_emails",
        "db_alias": "default",
    }
    