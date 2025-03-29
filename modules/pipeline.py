import os
import json
from typing import Dict, Any, Optional, Union, List
from pydantic import BaseModel, Field
from .llm_client import LLMClient  # Fixed relative import
from .prompts import format_analysis_prompt, format_image_prompt

# 1. Define Pydantic models for our JSON structures

class DreamSchema(BaseModel):
    """Schema for collecting dream information from the user."""
    narrative: str = Field(description="Brief description of what happened in the dream")
    mainSymbols: List[str] = Field(description="Key objects, characters, or elements that stood out")
    primaryEmotion: str = Field(description="The dominant feeling experienced during the dream")
    emotionalIntensity: int = Field(description="How strongly the emotion was felt (1-5 scale)")
    lifeConnection: str = Field(description="How the dream might relate to the user's waking life")
    interpretation: str = Field(description="Overall interpretation of the dream's meaning")
    symbols: List[Dict[str, str]] = Field(
        default_factory=list, 
        description="Analysis of key symbols in the dream, each with a title and explanation"
    )
    advice: str = Field(description="Actionable guidance based on the dream's emotional underpinnings")
    imagePrompt: str = Field(description="Description to generate a visual representation")

class DreamAnalysis(BaseModel):
    """Schema for the analysis output."""
    interpretation: str = Field(description="Overall interpretation of the dream's meaning")
    symbols: List[Dict[str, str]] = Field(
        description="Analysis of key symbols in the dream, each with a title and explanation"
    )
    advice: str = Field(description="Actionable guidance based on the dream's emotional underpinnings")
    imagePrompt: str = Field(description="Detailed visual description for image generation")
    explanation: str = Field(description="Explanation of how the analysis was derived")

class DreamImageRequest(BaseModel):
    """Schema for requesting an image from a vision model."""
    prompt: str = Field(description="Detailed description for image generation")
    style: str = Field(default="dreamlike", description="Visual style for the image")
    width: int = Field(default=1024, description="Image width")
    height: int = Field(default=1024, description="Image height")

# 2. Create the pipeline manager

class DreamAnalysisPipeline:
    """
    End-to-end pipeline for dream analysis:
    1. Collect dream information from user
    2. Generate analysis from collected information
    3. Generate image from dream description
    """
    
    def __init__(self, llm_client: Optional[LLMClient] = None):
        """Initialize the pipeline with LLM client."""
        self.llm_client = llm_client or LLMClient()
        self.dream_data = None
    
    def collect_dream_information(self) -> DreamSchema:
        """
        Step 1: Interactive questioning to collect dream information.
        Returns the completed dream schema.
        """
        print("\n=== Dream Analysis Session ===\n")
        
        # Initialize with empty values
        dream_data = {
            "narrative": "",
            "mainSymbols": [],
            "primaryEmotion": "",
            "emotionalIntensity": 0,
            "lifeConnection": "",
            "interpretation": "",
            "symbols": [],
            "advice": "",
            "imagePrompt": ""
        }
        
        # 1. Collect narrative
        dream_data["narrative"] = input("Tell me briefly about your dream: ")
        
        # 2. Collect main symbols
        symbols_input = input("What were the most memorable objects or symbols in this dream? (comma-separated): ")
        dream_data["mainSymbols"] = [s.strip() for s in symbols_input.split(",") if s.strip()]
        
        # 3. Collect primary emotion
        dream_data["primaryEmotion"] = input("How did this dream make you feel? (main emotion): ")
        
        # 4. Collect emotional intensity
        while True:
            try:
                intensity = int(input("On a scale of 1-5, how intense was this emotion? "))
                if 1 <= intensity <= 5:
                    dream_data["emotionalIntensity"] = intensity
                    break
                else:
                    print("Please enter a number between 1 and 5.")
            except ValueError:
                print("Please enter a valid number.")
        
        # 5. Collect life connection
        dream_data["lifeConnection"] = input("Does this dream connect to anything happening in your life right now? ")
        
        # Store the collected data
        self.dream_data = DreamSchema(**dream_data)
        return self.dream_data
    
    def generate_analysis(self) -> DreamAnalysis:
        """
        Generate dream analysis based on collected information.
        Returns the dream analysis.
        """
        if not self.dream_data:
            raise ValueError("No dream data available. Please collect dream information first.")
        
        # Create prompt for analysis using the prompts module
        prompt = format_analysis_prompt(self.dream_data)
        
        # Generate structured analysis using the LLM
        analysis_dict = self.llm_client.generate_structured_json(prompt, DreamAnalysis)
        
        # Convert to a proper DreamAnalysis object if it's a dict
        if isinstance(analysis_dict, dict):
            analysis_data = DreamAnalysis(**analysis_dict)
        else:
            analysis_data = analysis_dict
        
        # Update the dream data with the analysis results
        self.dream_data.interpretation = analysis_data.interpretation
        self.dream_data.symbols = analysis_data.symbols
        self.dream_data.advice = analysis_data.advice
        self.dream_data.imagePrompt = analysis_data.imagePrompt
        
        return analysis_data
    
    def generate_dream_image(self) -> str:
        """
        Step 4: Generate dream image using the Fireworks AI image generation API.
        Returns the path to the generated image.
        """
        if not self.dream_data or not self.dream_data.imagePrompt:
            raise ValueError("No image prompt available. Please generate analysis first.")
        
        # Create image generation request with our prompt template
        formatted_image_prompt = format_image_prompt(self.dream_data)
        
        # Create output directory if it doesn't exist
        output_dir = "dream_results"
        os.makedirs(output_dir, exist_ok=True)
        
        # Create a unique filename based on timestamp
        import time
        timestamp = int(time.time())
        image_path = f"{output_dir}/dream_image_{timestamp}.png"
        
        # Log the image generation request
        print("\n=== Image Generation Request ===")
        print(f"Prompt: {formatted_image_prompt}")
        print(f"Style: dreamlike")
        print(f"Dimensions: 1024x1024")
        
        # Use the simplified LLM client's image generation function
        try:
            # Generate the image using our client with the simplified method
            result = self.llm_client.generate_image(
                prompt=formatted_image_prompt,
                output_path=image_path
            )
            
            print(f"\nDream image generated successfully at: {image_path}")
            return image_path
            
        except Exception as e:
            print(f"Error generating dream image: {e}")
            # Return a placeholder path if generation fails
            return "generated_dream_image.png"
    
    def save_dream_data(self, file_path: str) -> None:
        """Save the complete dream data to a JSON file."""
        if not self.dream_data:
            raise ValueError("No dream data available.")
        
        with open(file_path, 'w') as f:
            json.dump(self.dream_data.model_dump(), f, indent=2)
        
        print(f"Dream data saved to {file_path}")
    
    def run_pipeline(self) -> Dict[str, Any]:
        """
        Run the complete dream analysis pipeline.
        Returns the complete dream data.
        """
        # Step 1: Collect dream information
        self.collect_dream_information()
        
        # Step 2 (internal): LLM processes and structures the information (already done in Step 1)
        
        # Step 3: Generate analysis
        analysis = self.generate_analysis()
        print("\n=== Dream Analysis ===")
        print(f"Interpretation: {analysis.interpretation}\n")
        print("Symbols:")
        for symbol in analysis.symbols:
            print(f"  • {symbol.get('title', '')}: {symbol.get('explanation', '')}")
        print(f"\nAdvice: {analysis.advice}")
        
        # Step 4: Generate image
        image_path = self.generate_dream_image()
        print(f"\nDream image would be generated at: {image_path}")
        
        return self.dream_data.model_dump()


# Example usage
if __name__ == "__main__":
    # Initialize the pipeline
    pipeline = DreamAnalysisPipeline()
    
    # Run the complete pipeline
    dream_result = pipeline.run_pipeline()
    
    # Save the results
    pipeline.save_dream_data("dream_analysis_result.json")
