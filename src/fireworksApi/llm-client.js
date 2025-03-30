import * as FileSystem from "expo-file-system";
import fetch from "node-fetch";
import { z } from "zod";

class LLMClient {
  constructor(
    apiKey,
    model = "accounts/fireworks/models/llama-v3p3-70b-instruct",
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
      const data = test;
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
      
      const content = data.choices[0].message.content;
      let parsedContent;
      
      try {
        parsedContent = JSON.parse(content);
      } catch (e) {
        throw new Error("Failed to parse JSON response from LLM");
      }
      
      // Extract the object at the specified key if objectName is provided
      const objectToValidate = objectName && parsedContent[objectName] 
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
              parsed: validatedData
            }
          }
        ]
      };
    } catch (error) {
      console.error("Error generating structured response:", error);
      throw error;
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
