import fetch from 'node-fetch';
import * as FileSystem from 'expo-file-system';

class LLMClient {
  constructor(apiKey, model = 'accounts/fireworks/models/llama-v3p1-8b-instruct', maxTokens = 2000, temperature = 1) {
    this.apiKey = apiKey;
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  async generateText(prompt, systemMessage = '', user = '') {
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'system', content: systemMessage, name: user }],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        top_p: 1,
        top_k: 50,
        frequency_penalty: 0,
        presence_penalty: 0,
        repetition_penalty: 1,
        reasoning_effort: 'low',
        n: 1,
        ignore_eos: false,
        context_length_exceeded_behavior: 'truncate',
        user
      })
    };

    try {
      const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', options);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating text:', error);
    }
  }

  async generateImage(prompt, outputPath = 'generated_image.png') {
    const formData = new FormData();
    formData.append('mode', 'text-to-image');
    formData.append('aspect_ratio', '1:1');
    formData.append('output_format', 'png');
    formData.append('model', 'sd3');

    try {
      const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
        method: 'POST',
        headers: {
          Accept: 'image/*',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: formData,
      });

      const buffer = await response.arrayBuffer();
      const fileUri = FileSystem.documentDirectory + outputPath;
      await FileSystem.writeAsStringAsync(fileUri, Buffer.from(buffer).toString('base64'), {
        encoding: FileSystem.EncodingType.Base64,
      });
      console.log('Finished downloading!');
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }
}

export default LLMClient;
