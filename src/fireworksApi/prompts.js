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

Your response must be in JSON format with the following structure:
{
  "interpretation": "Your insightful interpretation of the dream, or an empty string if not determinable",
  "symbols": [
    {
      "title": "Symbol name, or an empty string if not determinable",
      "explanation": "Explanation of what this symbol represents in the dream, or an empty string if not determinable"
    }
  ],
  "advice": "Practical advice for the dreamer based on the interpretation, or an empty string if not determinable",
  "imagePrompt": "Detailed visual description for generating an image, or an empty string if not determinable"
}

Ensure the following:
1. All fields in the JSON structure are present and non-empty (use empty strings or empty arrays if data is not determinable). This is such that zod validation can be performed on the response.
2. The response is valid JSON and does not include any additional text, commentary, or formatting like "\`\`\`JSON".
3. Avoid omitting any fields, even if their values are empty.

Example response:
{
  "interpretation": "This dream suggests...",
  "symbols": [
    {
      "title": "Water",
      "explanation": "Represents emotions and the subconscious"
    }
  ],
  "advice": "Consider exploring your feelings about...",
  "imagePrompt": "A surreal landscape with flowing water, vibrant colors..."
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
  return DREAM_ANALYSIS_PROMPT.replace("{narrative}", dreamData.narrative)
    .replace("{symbols}", dreamData.mainSymbols.join(", "))
    .replace("{emotion}", dreamData.primaryEmotion)
    .replace("{intensity}", dreamData.emotionalIntensity)
    .replace("{life_connection}", dreamData.lifeConnection);
}

function formatImagePrompt(dreamData) {
  return IMAGE_GENERATION_PROMPT.replace(
    "{image_prompt}",
    dreamData.imagePrompt
  )
    .replace("{emotion}", dreamData.primaryEmotion)
    .replace("{intensity}", dreamData.emotionalIntensity)
    .replace("{symbols}", dreamData.mainSymbols.join(", "));
}

module.exports = { formatAnalysisPrompt, formatImagePrompt };
