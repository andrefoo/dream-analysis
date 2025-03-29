from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union

class BrokerContact(BaseModel):
    name: str = Field(description="The broker's full name")
    brokerage: str = Field(description="The name of the broker's company")
    email: str = Field(description="The broker's email address")

class CoverageRequested(BaseModel):
    type: str = Field(description="The type of insurance coverage requested")
    limits: str = Field(description="The coverage limits (e.g., $1M, $5M)")

class EmailInfo(BaseModel):
    client_name: str = Field(description="The name of the client company")
    industry: str = Field(description="The client's industry or business sector")
    coverage_requested: CoverageRequested
    fleet_size: Optional[int] = Field(
        description="Number of vehicles in the client's fleet (if applicable)",
        default=None
    )
    revenue: Optional[int] = Field(
        description="Annual revenue in USD (if mentioned)",
        default=None
    )
    employees: Optional[int] = Field(
        description="Number of employees (if mentioned)",
        default=None
    )
    facility_size: Optional[str] = Field(
        description="Size of facility/store in square feet (if mentioned)",
        default=None
    )
    urgency: str = Field(description="Urgency level: standard, urgent, exploratory, or preliminary")
    loss_history: str = Field(description="Client's loss history description")
    additional_requests: List[str] = Field(description="Any additional requirements or requests", default_factory=list)
    broker_contact: BrokerContact
    business_description: Optional[str] = Field(
        description="Additional business description or context"
    )
    explanation: str = Field(description="Explanation of reasoning for extracted information")

class IndustryCode(BaseModel):
    bic_code: str = Field(description="Business Industry Classification code (4-digit)")
    explanation: str = Field(description="Explanation of reasoning for BIC code selection")

class BaseRateInfo(BaseModel):
    base_rate_per_1000: float = Field(description="Base rate per $1,000 of revenue")
    explanation: str = Field(description="Explanation of reasoning for base rate selection")

class RevenueInfo(BaseModel):
    estimated_annual_revenue: int = Field(description="Estimated annual revenue in USD")
    explanation: str = Field(description="Explanation of calculation methodology for revenue estimate")

class BasePremiumInfo(BaseModel):
    base_premium: float = Field(description="Base premium amount in USD")

class PremiumModifiers(BaseModel):
    fleet_discount: Optional[float] = Field(
        description="Discount factor based on fleet size (if applicable)",
        default=1.0
    )
    loss_history_factor: float = Field(description="Factor based on loss history")
    territory_factor: float = Field(description="Factor based on operational territory")
    coverage_limit_factor: Optional[float] = Field(
        description="Factor based on requested coverage limits",
        default=1.0
    )
    business_type_factor: Optional[float] = Field(
        description="Factor based on business/industry type",
        default=1.0
    )
    other_factors: Optional[Dict[str, float]] = Field(
        description="Any additional factors applied",
        default_factory=dict
    )

class PremiumInfo(BaseModel):
    modifiers: PremiumModifiers
    final_premium: float = Field(description="Final premium amount in USD")
    explanation: str = Field(description="Explanation of premium calculation and modifier rationale")

class AuthorityInfo(BaseModel):
    authority_check: str = Field(description="Authority status: approved, requires referral, etc.")
    referral_required: bool = Field(description="Whether a referral is required for approval")
    explanation: str = Field(description="Explanation of authority determination process")

class CoverageInfo(BaseModel):
    coverage_limitations: str = Field(description="Any limitations or exclusions")
    recommended_endorsements: List[str] = Field(description="List of recommended endorsements")
    explanation: str = Field(description="Explanation of coverage recommendations and limitations")

class RiskAssessmentResult(BaseModel):
    company_name: str = Field(description="The name of the company assessed")
    assessment_date: str = Field(description="Date and time of the assessment")
    risk_assessment: str = Field(description="Detailed risk assessment text")
    underwriter_summary: str = Field(description="Summarized assessment for underwriters") 