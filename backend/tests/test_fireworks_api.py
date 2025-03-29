import os
import json
import openai

# Load environment variables if using a .env file

# Get API key from environment variables
api_key = "fw_3ZJgepmi2htwvHpcRxpzPH27"
if not api_key:
    raise ValueError("FIREWORKS_API_KEY environment variable is required")

# Initialize OpenAI client with Fireworks API base URL
client = openai.OpenAI(
    base_url="https://api.fireworks.ai/inference/v1",
    api_key=api_key,
)

# Set up parameters for the API call
model = "accounts/fireworks/models/llama-v3p3-70b-instruct"  # You can change this model
prompt = "Explain quantum computing in simple terms."  # Example prompt
max_tokens = 1000
temperature = 0.7

# Make the API call
response = client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": prompt}],
    max_tokens=max_tokens,
    temperature=temperature
)

# Convert the response object to a dictionary
response_dict = response.model_dump()

# Print the full JSON response
print(json.dumps(response_dict, indent=2))

# Optionally, save the response to a file
with open("fireworks_response.json", "w") as f:
    json.dump(response_dict, f, indent=2)

print("\nResponse content:")
print(response.choices[0].message.content)

print("\nResponse saved to fireworks_response.json") 