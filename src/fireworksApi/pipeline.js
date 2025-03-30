import * as FileSystem from "expo-file-system";
import LLMClient from "./llm-client";
import { formatAnalysisPrompt, formatImagePrompt } from "./prompts.js";

class DreamAnalysisPipeline {
  constructor(apiKey, llmClient = new LLMClient(apiKey)) {
    this.llmClient = llmClient;
    this.dreamData = null;
  }

  collectDreamInformation() {
    // This function should collect input from the user via a web interface or command-line prompts
    this.dreamData = {
      narrative: "User-provided narrative of the dream",
      mainSymbols: ["Symbol1", "Symbol2"],
      primaryEmotion: "Calm",
      emotionalIntensity: 4,
      lifeConnection:
        "User's description of how the dream relates to their life",
      analysis: "",
      imagePrompt: "",
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
    const analysisData = await this.llmClient.generateText(prompt);
    console.log("Analysis data = ", analysisData);

    this.dreamData.analysis = analysisData.analysis;
    this.dreamData.imagePrompt = analysisData.imagePrompt;

    console.log("Dream data = ", this.dreamData);
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
    await this.llmClient.generateImage(formattedImagePrompt, imagePath);
    console.log(`Dream image generated successfully at: ${imagePath}`);
    return imagePath;
  }

  saveDreamData(filePath) {
    if (!this.dreamData) {
      throw new Error("No dream data available.");
    }

    FileSystem.writeAsStringAsync(
      filePath,
      JSON.stringify(this.dreamData, null, 2)
    )
      .then(() => console.log(`Dream data saved to ${filePath}`))
      .catch((error) => console.error("Error saving dream data:", error));
    console.log(`Dream data saved to ${filePath}`);
  }

  async runPipeline() {
    this.collectDreamInformation();

    await this.generateAnalysis();
    const imagePath = await this.generateDreamImage();

    this.saveDreamData("./dream_results/dream_analysis.json");
    return this.dreamData;
  }
}

export default DreamAnalysisPipeline;
