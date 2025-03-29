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

Provide a thoughtful analysis of what this dream might mean, focusing on emotional insights and 
potential symbolism. Consider the personal context shared by the dreamer and avoid generic 
interpretations. Be insightful yet concise.

Also create an abstract visual representation that captures the essence of this dream using color blobs. 
The visual description should be vivid, specific, and incorporate the emotional tone of the dream.
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
    return DREAM_ANALYSIS_PROMPT.format(
        narrative=dream_data.narrative,
        symbols=", ".join(dream_data.mainSymbols),
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
