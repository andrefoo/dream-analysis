import { GoogleGenerativeAI } from '@google/generative-ai';

interface SymbolismItem {
  symbol: string;
  meaning: string;
}

interface Analysis {
  symbolism: SymbolismItem[];
  emotional: string;
  advice: string;
}

// Mock data for testing when API is not configured
const mockAnalysis: Analysis = {
  symbolism: [
    {
      symbol: "Flying",
      meaning: "Represents freedom, escape from limitations, or desire for new perspectives."
    },
    {
      symbol: "Water",
      meaning: "Symbolizes emotions, the unconscious mind, or personal transformation."
    },
    {
      symbol: "House",
      meaning: "Represents your self, your mind, or your current life situation."
    }
  ],
  emotional: "Your dream suggests feelings of anxiety mixed with curiosity. There seems to be an underlying desire for exploration while feeling somewhat constrained by current circumstances.",
  advice: "Consider areas in your life where you feel restricted and explore ways to create more personal freedom. This might be a good time to try new experiences that expand your horizons."
};

class GeminiApi {
  // Replace this with your actual API key if using the real API
  private static API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GENAI_API_KEY || '';
  private static genAI = new GoogleGenerativeAI(GeminiApi.API_KEY);
  
  static async query(dream: string): Promise<Analysis> {
    // If no API key is provided, return mock data
    if (!GeminiApi.API_KEY) {
      console.log('No API key provided, using mock data');
      return Promise.resolve(mockAnalysis);
    }
    
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Analyze this dream and provide insights in the following JSON format:
      {
        "symbolism": [
          {
            "symbol": "key symbol from the dream",
            "meaning": "interpretation of this symbol"
          }
        ],
        "emotional": "emotional state and feelings analysis",
        "advice": "practical advice based on the dream"
      }

      Dream: ${dream}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (error) {
        console.error('Error parsing Gemini response:', error);
        return mockAnalysis;
      }
    } catch (error) {
      console.error('Error analyzing dream:', error);
      return mockAnalysis;
    }
  }
}

export default GeminiApi; 