"""
Prompts for the Dream Analysis Application.
This module contains template prompts for the LLM at different stages of the pipeline.
"""

# Prompt for generating the dream analysis
DREAM_ANALYSIS_PROMPT = """
As a dream interpreter, analyze the following dream information:

Dream narrative: {narrative}
Main symbols or elements: {symbols}
Primary emotion felt: {emotion}
Emotional intensity (1-5): {intensity}
Connection to waking life: {life_connection}

Provide a structured analysis with the following components:

1. Interpretation: Give a thoughtful overall interpretation of what this dream might mean, focusing on emotional insights.

2. Symbols: Analyze each of these key symbols from the dream:
{symbol_list}
For each symbol, provide:
- A title for the symbol
- An explanation of what the symbol might represent in the dreamer's psyche

3. Advice: Offer actionable guidance based on the dream's emotional underpinnings. What steps might the dreamer take to address the underlying feelings or situations?

4. Image Prompt: Create a vivid visual description that captures the essence of this dream using colors, shapes, and imagery. The visual description should incorporate the emotional tone of the dream.

Consider the personal context shared by the dreamer and avoid generic interpretations. Be insightful yet concise.
"""

# Prompt for generating the image from the dream
IMAGE_GENERATION_PROMPT = """
Create a dreamlike visualization of the following dream:

{image_prompt}

The dream evoked feelings of {emotion} with an intensity of {intensity}/5.
Key symbols included: {symbols}

Style: Dreamlike, surreal, with rich symbolism
"""

# Function to format prompts with dream data
def format_analysis_prompt(dream_data):
    """Format the analysis prompt with dream data."""
    # Create a formatted list of symbols for individual analysis
    symbol_list = "\n".join([f"- {symbol}" for symbol in dream_data.mainSymbols])
    
    return DREAM_ANALYSIS_PROMPT.format(
        narrative=dream_data.narrative,
        symbols=", ".join(dream_data.mainSymbols),
        symbol_list=symbol_list,
        emotion=dream_data.primaryEmotion,
        intensity=dream_data.emotionalIntensity,
        life_connection=dream_data.lifeConnection
    )

def format_image_prompt(dream_data):
    """Format the image generation prompt with dream data."""
    return IMAGE_GENERATION_PROMPT.format(
        image_prompt=dream_data.imagePrompt,
        emotion=dream_data.primaryEmotion,
        intensity=dream_data.emotionalIntensity,
        symbols=", ".join(dream_data.mainSymbols)
    )
