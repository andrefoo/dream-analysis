// Removed unused Buffer import
import * as FileSystem from "expo-file-system";
import fetch from "node-fetch";
import supabaseService from "../services/supabaseService"; // Adjusted import path if necessary

class LLMClient {
  constructor(
    apiKey,
    model = "accounts/fireworks/models/qwen2p5-72b-instruct",
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
        messages: [{ role: "system", content: prompt }],
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
      const test = await response.json();
      console.log("After fetching", test.choices[0].message.content);
      const data = test.choices[0].message.content;
      return data;
    } catch (error) {
      console.error("Error generating text:", error);
    }
  }

  async generateStructuredResponse(schema, messages, objectName = "data") {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        response_format: { type: "json_object" },
      }),
    };

    try {
      const response = await fetch(
        "https://api.fireworks.ai/inference/v1/chat/completions",
        options
      );

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from API");
      }

      console.log("Response from LLM:", data.choices[0].message.content);
      const content = data.choices[0].message.content;
      let parsedContent;

      try {
        parsedContent = JSON.parse(content);
      } catch (e) {
        throw new Error("Failed to parse JSON response from LLM");
      }

      // Extract the object at the specified key if objectName is provided
      const objectToValidate =
        objectName && parsedContent[objectName]
          ? parsedContent[objectName]
          : parsedContent;

      // Validate with Zod schema
      const validatedData = schema.parse(objectToValidate);

      return {
        ...data,
        choices: [
          {
            ...data.choices[0],
            message: {
              ...data.choices[0].message,
              parsed: validatedData,
            },
          },
        ],
      };
    } catch (error) {
      console.error("Error generating structured response:", error);
      throw error;
    }
  }

  async generateImage(prompt, outputPath = "generated_image.png") {
    const myHeaders = new Headers();
    myHeaders.append("Accept", "image/jpeg");
    myHeaders.append("Authorization", "fw_3ZRhMZ4RNnUv5u3GUtKfHeJz");
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      steps: 30,
      seed: 0,
      safety_check: false,
      prompt,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0",
      requestOptions
    );

    if (!response.ok) {
      console.error("Failed to fetch image");
      return;
    }

    const blob = await response.blob();
    const base64Image = await this.convertBlobToBase64(blob);

    // Upload to Supabase
    await supabaseService.uploadBase64Image(
      base64Image,
      "dream-images",
      "generated-image.png"
    );
  }

  convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result); // Keep "data:image/png;base64,..."
      };
      reader.onerror = reject;
    });
  }
}

export default LLMClient;
