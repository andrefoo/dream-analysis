const DREAM_ANALYSIS_PROMPT = `
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

Your response should be in JSON format with the following structure:
{
  "interpretation": "Your insightful interpretation of the dream",
  "symbols": [
    {
      "title": "Symbol name",
      "explanation": "Explanation of what this symbol represents in the dream"
    }
  ],
  "advice": "Practical advice for the dreamer based on the interpretation",
  "imagePrompt": "Detailed visual description for generating an image"
}
`;

const IMAGE_GENERATION_PROMPT = `
Create a dreamlike visualization of the following dream:

{image_prompt}

The dream evoked feelings of {emotion} with an intensity of {intensity}/5.
Key symbols included: {symbols}

Style: Dreamlike, surreal, with rich symbolism
`;

function formatAnalysisPrompt(dreamData) {
  return DREAM_ANALYSIS_PROMPT.replace('{narrative}', dreamData.narrative)
    .replace('{symbols}', dreamData.mainSymbols.join(', '))
    .replace('{emotion}', dreamData.primaryEmotion)
    .replace('{intensity}', dreamData.emotionalIntensity)
    .replace('{life_connection}', dreamData.lifeConnection);
}

function formatImagePrompt(dreamData) {
  return IMAGE_GENERATION_PROMPT.replace('{image_prompt}', dreamData.imagePrompt)
    .replace('{emotion}', dreamData.primaryEmotion)
    .replace('{intensity}', dreamData.emotionalIntensity)
    .replace('{symbols}', dreamData.mainSymbols.join(', '));
}

module.exports = { formatAnalysisPrompt, formatImagePrompt };
