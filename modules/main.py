import os
import argparse
from .pipeline import DreamAnalysisPipeline
from .llm_client import LLMClient

def main():
    """Main entry point for the Dream Analysis Application"""
    
    parser = argparse.ArgumentParser(description="Dream Analysis Application")
    parser.add_argument("--model", type=str, 
                        default="accounts/fireworks/models/qwen2p5-72b-instruct",
                        help="LLM model to use for analysis")
    parser.add_argument("--temperature", type=float, default=0.6,
                        help="Temperature for LLM generation (0.0-1.0)")
    parser.add_argument("--output", type=str, default="dream_results",
                        help="Output directory for saving results")
    args = parser.parse_args()
    
    # Ensure output directory exists
    os.makedirs(args.output, exist_ok=True)
    
    # Initialize LLM client
    llm_client = LLMClient(
        model=args.model,
        temperature=args.temperature
    )
    
    # Initialize pipeline
    pipeline = DreamAnalysisPipeline(llm_client=llm_client)
    
    # Welcome message
    print("\n" + "="*50)
    print("  DREAM ANALYSIS APPLICATION")
    print("="*50)
    print("\nWelcome to your personal dream analyzer!")
    print("I'll ask you a few questions about your dream,")
    print("then provide insights and generate a visual representation.")
    print("\nLet's begin...\n")
    
    try:
        # Run the pipeline
        result = pipeline.run_pipeline()
        
        # Save results
        output_file = os.path.join(args.output, "dream_analysis.json")
        pipeline.save_dream_data(output_file)
        
        # Completion message
        print("\n" + "="*50)
        print("  ANALYSIS COMPLETE")
        print("="*50)
        print(f"\nYour dream analysis has been saved to: {output_file}")
        print("\nThank you for using the Dream Analysis Application!")
        
    except KeyboardInterrupt:
        print("\n\nProcess interrupted by user. Exiting...")
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
    
if __name__ == "__main__":
    main()
