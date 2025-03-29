import os
import json
from pprint import pprint
from typing import Dict, Any
from dotenv import load_dotenv

# Import necessary modules
from modules.llm_client import LLMClient
from modules.insurance_pipeline import InsurancePipeline
from config.config import Config

# Load environment variables
load_dotenv()

def main():
    # Set up API keys from environment
    fireworks_api_key = os.environ.get("FIREWORKS_API_KEY")
    serp_api_key = os.environ.get("SERP_API_KEY")
    
    if not fireworks_api_key:
        print("ERROR: FIREWORKS_API_KEY environment variable not set")
        return
    
    # Document paths (same as in the websocket handler)
    document_paths = {
        "industry-uw-guidelines.pdf": "./modules/mock-docs/industry-uw-guidelines.pdf",
        "rating-manual.pdf": "./modules/mock-docs/rating-manual.pdf",
        "rating-factors.pdf": "./modules/mock-docs/rating-factors.pdf",
        "authority-levels.pdf": "./modules/mock-docs/authority-levels.pdf",
        "coverage-limitations.pdf": "./modules/mock-docs/coverage-limitations.pdf",
        "coverage-options.pdf": "./modules/mock-docs/coverage-options.pdf",
        "commercial-lines-app-templates.pdf": "./modules/mock-docs/commercial-lines-app-templates.pdf",
        "policy-form-library.pdf": "./modules/mock-docs/policy-form-library.pdf"
    }
    
    # Initialize LLM client
    print("Initializing LLM client...")
    llm_client = LLMClient(
        api_key=fireworks_api_key,
        model="accounts/fireworks/models/llama-v3p3-70b-instruct",
        mongo_uri=Config.MONGODB_URI
    )
    
    # Initialize insurance pipeline
    print("Initializing insurance pipeline...")
    pipeline = InsurancePipeline(
        llm_client=llm_client,
        document_paths=document_paths,
    )
    
    # Sample email content
    sample_email = """
    Subject: Insurance Quote Request for TechWave Solutions
    From: john.broker@acmeinsurance.com
    To: underwriting@insurance.com
    
    Dear Underwriting Team,
    
    I'm writing to request a commercial liability insurance quote for our new client, TechWave Solutions. They are a mid-sized software development company specializing in healthcare applications and data services.
    
    Client Details:
    - Company Name: TechWave Solutions
    - Industry: Software Development (Healthcare)
    - Annual Revenue: Approximately $3.5 million
    - Number of Employees: 25
    - Years in Business: 6
    
    Coverage Requirements:
    - General Liability: $2M per occurrence / $4M aggregate
    - Professional Liability/E&O
    - Cyber Liability
    
    They have had no previous claims or incidents. They're looking to secure coverage within the next 3 weeks as their current policy expires at the end of the month.
    
    Please let me know if you need any additional information to process this quote request.
    
    Best regards,
    John Smith
    Senior Broker
    ACME Insurance Services
    Phone: (555) 123-4567
    Email: john.broker@acmeinsurance.com
    """
    
    # Process the email
    print("\nProcessing sample email...\n")
    print("-" * 50)
    print(sample_email)
    print("-" * 50)
    print("\nGenerating quote...\n")
    
    try:
        # Process quote request
        result = pipeline.process_quote_request(sample_email)
        
        # Print formatted results
        print("\nQUOTE PROCESSING RESULTS:")
        print("=" * 80)
        
        # Extract key information
        client_name = result.get("email_info", {}).get("client_name", "Unknown")
        industry = result.get("email_info", {}).get("business_details", {}).get("industry", "Unknown")
        bic_code = result.get("industry_code", {}).get("bic_code", "Unknown")
        estimated_revenue = result.get("revenue_info", {}).get("estimated_annual_revenue", 0)
        base_premium = result.get("base_premium_info", {}).get("base_premium", 0)
        final_premium = result.get("premium_info", {}).get("final_premium", 0)
        risk_level = "Unknown"
        
        if "risk_assessment" in result and "risk_assessment" in result["risk_assessment"]:
            risk_level = result["risk_assessment"]["risk_assessment"].get("overall_risk_level", "Unknown")
        
        # Print summary
        print(f"Client: {client_name}")
        print(f"Industry: {industry}")
        print(f"BIC Code: {bic_code}")
        print(f"Estimated Annual Revenue: ${estimated_revenue:,}")
        print(f"Base Premium: ${base_premium:,.2f}")
        print(f"Final Premium: ${final_premium:,.2f}")
        print(f"Risk Level: {risk_level.upper()}")
        print(f"Requires Human Review: {result.get('requires_human_review', False)}")
        
        # Print response email if available
        if result.get("response_email"):
            print("\nGENERATED RESPONSE EMAIL:")
            print("-" * 80)
            print(result["response_email"])
            print("-" * 80)
        
        # Option to save full results to file
        save_option = input("\nSave full results to file? (y/n): ")
        if save_option.lower() == 'y':
            filename = "quote_results.json"
            with open(filename, 'w') as f:
                json.dump(result, f, indent=2, default=str)
            print(f"Results saved to {filename}")
    
    except Exception as e:
        print(f"Error processing quote: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 