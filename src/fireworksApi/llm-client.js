import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import fetch from "node-fetch";

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
        console.log("Parsed content:", JSON.stringify(parsedContent, null, 2));
      } catch (e) {
        throw new Error("Failed to parse JSON response from LLM");
      }

      // Extract the object at the specified key if objectName is provided
      const objectToValidate =
        objectName && parsedContent[objectName]
          ? parsedContent[objectName]
          : parsedContent;
      
      console.log("Object to validate:", JSON.stringify(objectToValidate, null, 2));
      
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
    const formData = new FormData();
    formData.append("mode", "text-to-image");
    formData.append("aspect_ratio", "1:1");
    formData.append("output_format", "png");
    formData.append("model", "sd3");

    // try {
    async () => {
      const response = await fetch(
        "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "image/jpeg",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            steps: 30,
            seed: 0,
            safety_check: false,
            prompt,
          }),
        }
      );

      // To process the response and get the image:
      console.log("response = ", response);
      const buffer = await response.arrayBuffer();
      console.log("buffer = ", buffer);
      return buffer;
    };

    //   fs.writeFile("hi.jpg", Buffer.from(buffer), () =>
    //     console.log("finished downloading!")
    //   );
    // })().catch(console.error);

    //   const buffer = await response.arrayBuffer();

    //   console.log("test2");
    //   const base64Image = Buffer.from(buffer).toString("base64");

    //   console.log("test3");
    //   // Use the SupabaseService to save the image
    //   const { default: SupabaseService } = await import(
    //     "../services/supabaseService"
    //   );

    //   console.log("test4");
    //   const savedImage = await SupabaseService.uploadBase64Image(
    //     outputPath,
    //     Buffer.from(base64Image, "base64"),
    //     "image/png"
    //   );

    //   if (!savedImage) {
    //     throw new Error("Error uploading image to Supabase");
    //   }

    //   console.log("Image successfully uploaded to Supabase!", savedImage);
    // } catch (error) {
    //   console.error("Error generating image:", error);
  }
}

export default LLMClient;
