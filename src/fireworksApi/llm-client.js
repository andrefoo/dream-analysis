import * as FileSystem from "expo-file-system";
import fetch from "node-fetch";

class LLMClient {
  constructor(
    apiKey,
    model = "accounts/fireworks/models/deepseek-v3-0324",
    maxTokens = 2000,
    temperature = 1
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  async generateText(prompt, systemMessage = "", user = "") {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "system", content: systemMessage}],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        user,
      }),
    };

    try {
      console.log("Before fetching");
      const response = await fetch(
        "https://api.fireworks.ai/inference/v1/chat/completions",
        options
      );
      console.log("After fetching", response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error generating text:", error);
    }
  }

  async generateImage(prompt, outputPath = "generated_image.png") {
    const formData = new FormData();
    formData.append("mode", "text-to-image");
    formData.append("aspect_ratio", "1:1");
    formData.append("output_format", "png");
    formData.append("model", "sd3");

    try {
      const response = await fetch(
        "https://api.stability.ai/v2beta/stable-image/generate/sd3",
        {
          method: "POST",
          headers: {
            Accept: "image/*",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: formData,
        }
      );

      const buffer = await response.arrayBuffer();
      const fileUri = FileSystem.documentDirectory + outputPath;
      await FileSystem.writeAsStringAsync(
        fileUri,
        Buffer.from(buffer).toString("base64"),
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );
      console.log("Finished downloading!");
    } catch (error) {
      console.error("Error generating image:", error);
    }
  }
}

export default LLMClient;
