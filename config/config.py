import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Config:
    """Configuration settings for the application."""
    
    # API key for Fireworks AI LLM service
    FIREWORKS_API_KEY = os.environ.get("FIREWORKS_API_KEY", "")
    
    # Default model ID
    DEFAULT_MODEL = "accounts/fireworks/models/qwen2p5-72b-instruct"
    
    # Temperature for LLM generation (0.0-1.0)
    DEFAULT_TEMPERATURE = 0.6
    
    # Maximum tokens to generate
    DEFAULT_MAX_TOKENS = 4096
    
    # Output directory for saving results
    OUTPUT_DIR = "dream_results"
    
    @classmethod
    def validate(cls):
        """Validate that required configuration is set."""
        if not cls.FIREWORKS_API_KEY:
            print("\nWARNING: FIREWORKS_API_KEY is not set.")
            print("You can set it in a .env file or as an environment variable.")
            print("For testing purposes, mock responses will be used.\n")
        
        # Create output directory if it doesn't exist
        os.makedirs(cls.OUTPUT_DIR, exist_ok=True)

