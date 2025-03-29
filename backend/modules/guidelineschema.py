from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, List, Dict, Any

class GuidelineTypeEnum(str, Enum):
    """Enum representing different types of underwriting guidelines."""
    general = "general"
    industry_specific = "industry_specific"
    regional = "regional"
    specialty = "specialty"
    regulatory = "regulatory"
    corporate = "corporate"
    custom = "custom"

class GuidelineSelectionCriteria(BaseModel):
    """Criteria used to select appropriate guidelines."""
    industry_code: Optional[str] = Field(
        description="Industry code that may determine applicable guidelines",
        default=None
    )
    territory: Optional[str] = Field(
        description="Geographic territory that may have specific guidelines",
        default=None
    )
    coverage_type: Optional[str] = Field(
        description="Type of coverage that requires specific guidelines",
        default=None
    )
    business_size: Optional[str] = Field(
        description="Size category of the business (small, medium, large)",
        default=None
    )
    risk_factors: Optional[List[str]] = Field(
        description="Specific risk factors that may trigger special guidelines",
        default_factory=list
    )

class GuidelineReference(BaseModel):
    """Reference to a specific guideline document or section."""
    guideline_id: str = Field(description="Unique identifier for the guideline")
    guideline_type: GuidelineTypeEnum = Field(description="Type of guideline")
    guideline_name: str = Field(description="Name or title of the guideline")
    guideline_version: Optional[str] = Field(
        description="Version of the guideline",
        default="current"
    )
    section_references: Optional[List[str]] = Field(
        description="Specific sections of the guideline that apply",
        default_factory=list
    )

class GuidelineSelection(BaseModel):
    """Result of guideline selection process."""
    primary_guideline: GuidelineReference = Field(
        description="The primary guideline that should be applied"
    )
    supplementary_guidelines: List[GuidelineReference] = Field(
        description="Additional guidelines that should be considered",
        default_factory=list
    )
    selection_rationale: str = Field(
        description="Explanation of why these guidelines were selected"
    )
    selection_criteria_used: GuidelineSelectionCriteria = Field(
        description="The criteria that were used to select these guidelines"
    )
    override_reason: Optional[str] = Field(
        description="Reason for any manual override of the standard selection process",
        default=None
    ) 