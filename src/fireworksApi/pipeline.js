import * as FileSystem from "expo-file-system";
import LLMClient from "./llm-client";
import { formatAnalysisPrompt, formatImagePrompt } from "./prompts.js";
import { z } from "zod";

// Define the Zod schema for dream analysis response
const DreamAnalysisSchema = z.object({
  interpretation: z.string(),
  symbols: z.array(
    z.object({
      title: z.string(),
      explanation: z.string(),
    })
  ),
  advice: z.string(),
  imagePrompt: z.string(),
});

class DreamAnalysisPipeline {
  constructor(apiKey, llmClient = new LLMClient(apiKey)) {
    this.llmClient = llmClient;
    this.dreamData = null;
  }

  collectDreamInformation(dream, mood) {
    // This function should collect input from the user via a web interface or command-line prompts
    this.dreamData = {
      narrative: dream,
      mainSymbols: ["Symbol1", "Symbol2"],
      primaryEmotion: mood,
      emotionalIntensity: 4,
      lifeConnection:
        "User's description of how the dream relates to their life",
      analysis: "",
      imagePrompt: "",
      symbols: [],
      advice: "",
    };
    return this.dreamData;
  }

  async generateAnalysis() {
    if (!this.dreamData) {
      throw new Error(
        "No dream data available. Please collect dream information first."
      );
    }

    const prompt = formatAnalysisPrompt(this.dreamData);
    console.log("Prompt = ", prompt);

    // Create messages array for structured response
    const messages = [{ role: "system", content: prompt }];

    // Use generateStructuredResponse instead of generateText
    const completion = await this.llmClient.generateStructuredResponse(
      DreamAnalysisSchema,
      messages,
      null
    );

    // Extract the validated data from the parsed response
    const analysisData = completion.choices[0].message.parsed;

    // Update dreamData with the analysis information
    this.dreamData.analysis = analysisData.interpretation;
    this.dreamData.symbols = analysisData.symbols;
    this.dreamData.advice = analysisData.advice;
    this.dreamData.imagePrompt = analysisData.imagePrompt;

    return this.dreamData;
  }

  async generateDreamImage() {
    if (!this.dreamData || !this.dreamData.imagePrompt) {
      throw new Error(
        "No image prompt available. Please generate analysis first."
      );
    }

    const formattedImagePrompt = formatImagePrompt(this.dreamData);
    const imagePath = `./dream_results/dream_image_${Date.now()}.png`;
    const test = await this.llmClient.generateImage(
      formattedImagePrompt,
      imagePath
    );
    console.log("testImage = ", test);
    return test;
  }

  saveDreamData(filePath) {
    if (!this.dreamData) {
      throw new Error("No dream data available.");
    }

    const fullFilePath = FileSystem.documentDirectory + filePath;
    FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + "dream_results",
      { intermediates: true }
    )
      .then(() => {
        return FileSystem.writeAsStringAsync(
          fullFilePath,
          JSON.stringify(this.dreamData, null, 2)
        );
      })
      .then(() => console.log(`Dream data saved to ${fullFilePath}`))
      .catch((error) => console.error("Error saving dream data:", error));
  }

  async runPipeline(dream, mood) {
    this.collectDreamInformation(dream, mood);

    await this.generateAnalysis();
    const image = await this.generateDreamImage();
    console.log("Image generated: ", image);

    this.saveDreamData("./dream_results/dream_analysis.json");
    return this.dreamData;
  }
}

export default DreamAnalysisPipeline;
