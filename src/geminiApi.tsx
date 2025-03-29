import { GoogleGenAI } from "@google/genai";

class GeminiApi {
  static async query(contents: string): Promise<string> {
    const apiKey = process.env.REACT_APP_GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      throw new Error("API key is not set");
    }
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Analyze the following sleep journal entry and provide a structured breakdown. Identify key aspects such as sleep duration, quality, disturbances, emotional state upon waking, and potential influencing factors. Additionally, highlight any patterns or concerns based on the provided details. Offer actionable insights or recommendations to improve sleep if necessary.

  Sleep Journal Entry: ${contents}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      // config: {
      //   responseSchema: {

      //   }
      // }
    });
    return response.text as string;
  }
}

export default GeminiApi;
