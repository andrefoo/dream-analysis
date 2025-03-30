import os
import json
import base64
from typing import Dict, Any, Optional, Union, List
from pydantic import BaseModel, Field
import openai
import sys
import os

# Add the parent directory to sys.path to allow imports from the config package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config.config import Config

class LLMClient:
    """
    Client for interacting with Fireworks AI LLM API using OpenAI SDK.
    Supports structured JSON responses and document inlining.
    """
    
    def __init__(self, 
                 api_key: Optional[str] = None,
                 model: str = "accounts/fireworks/models/llama-v3p3-70b-instruct",
                 max_tokens: int = 4096,
                 temperature: float = 0.6):
        """
        Initialize the Fireworks LLM client.
        
        Args:
            api_key: API key for the Fireworks service (defaults to environment variable)
            model: Model identifier to use
            max_tokens: Maximum tokens to generate in the response
            temperature: Controls randomness in generation (0.0-1.0)
        """
        self.api_key = api_key or Config.FIREWORKS_API_KEY
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        
        # Initialize OpenAI client with Fireworks base URL
        self.client = openai.OpenAI(
            base_url="https://api.fireworks.ai/inference/v1",
            api_key=self.api_key,
        )
        
    def _create_message_with_documents(self, prompt: str, documents: Dict[str, str] = None) -> List[Dict]:
        """
        Create a message that includes document references using document inlining.
        
        Args:
            prompt: The text prompt
            documents: Dictionary of document paths and their file paths or base64 content
            
        Returns:
            List of message dictionaries for the API call
        """
        if not documents:
            return [{"role": "user", "content": prompt}]
        
        # Use the format from Approach 2 that was successful in testing
        content_parts = [{"type": "text", "text": prompt}]
        
        # Add each document as an image_url with proper nesting and transform in the URL
        for doc_name, doc_path in documents.items():
            if os.path.exists(doc_path):
                try:
                    # For PDFs
                    if doc_path.lower().endswith('.pdf'):
                        with open(doc_path, 'rb') as file:
                            base64_content = base64.b64encode(file.read()).decode('utf-8')
                            # Use the successful approach: transform=inline in URL
                            url_with_transform = f"data:application/pdf;base64,{base64_content}#transform=inline"
                            
                            # Add with the exact format from successful Approach 2
                            content_parts.append({
                                "type": "image_url",
                                "image_url": {
                                    "url": url_with_transform
                                }
                            })
                            print(f"Added document: {doc_name} ({os.path.getsize(doc_path)/1024:.1f} KB)")
                except Exception as e:
                    print(f"Error processing document {doc_name}: {e}")
        
        return [{"role": "user", "content": content_parts}]
        
    def generate_text(self, prompt: str, documents: Dict[str, str] = None) -> str:
        """
        Generate free-form text from the LLM based on the prompt and optional documents.
        
        Args:
            prompt: The input prompt for the LLM
            documents: Dictionary of document names and their file paths or URLs
            
        Returns:
            Generated text response
        """
        try:
            messages = self._create_message_with_documents(prompt, documents)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating text response: {e}")
            return f"Error generating response: {str(e)}"
    
    def generate_structured_json(self, prompt: str, schema_model: BaseModel, 
                                documents: Dict[str, str] = None) -> BaseModel:
        """
        Generate a structured JSON response from the LLM based on a Pydantic schema.
        
        Args:
            prompt: The input prompt for the LLM
            schema_model: Pydantic model defining the expected JSON structure
            documents: Dictionary of document names and their file paths or URLs
            
        Returns:
            Pydantic model object containing the parsed JSON response
        """
        # Set to True to bypass document processing temporarily
        DISABLE_DOCUMENTS = False
        
        if DISABLE_DOCUMENTS:
            documents = None
        
        try:
            messages = self._create_message_with_documents(prompt, documents)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                response_format={"type": "json_object", "schema": schema_model.model_json_schema()},
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            json_content = response.choices[0].message.content
            
            # Debug print to see raw response
            print(f"Raw JSON response: {json.dumps(json.loads(json_content), indent=2)}")
            
            parsed_content = json.loads(json_content)
            
            # Ensure explanation field exists
            if 'explanation' in schema_model.model_fields and 'explanation' not in parsed_content:
                parsed_content['explanation'] = "No explanation provided by the model."
                
            return schema_model(**parsed_content)
        except Exception as e:
            print(f"Error generating structured JSON response: {e}")
            # Return empty dict with expected keys from the schema
            default_values = {}
            
            # Build default values from schema including explanation fields
            for field_name, field in schema_model.model_fields.items():
                if field_name == 'explanation':
                    default_values[field_name] = f"Error generating explanation: {str(e)}"
                elif field.annotation == str:
                    default_values[field_name] = ""
                elif field.annotation in (int, float):
                    default_values[field_name] = 0
                elif field.annotation == bool:
                    default_values[field_name] = False
                elif field.annotation == list:
                    default_values[field_name] = []
                elif field.annotation == dict:
                    default_values[field_name] = {}
                else:
                    # Handle nested models by checking if they have default factories
                    if hasattr(field, 'default_factory') and field.default_factory is not None:
                        default_values[field_name] = field.default_factory()
                    else:
                        default_values[field_name] = None
            return schema_model(**default_values) 
            
    def generate_image(self, prompt: str, output_path: str = None) -> Union[str, bytes]:
        """
        Generate an image using Fireworks AI image generation API.
        
        Args:
            prompt: Text description of the desired image
            output_path: Path to save the image to (if None, returns bytes)
            
        Returns:
            If output_path is provided, returns path to saved image.
            Otherwise, returns the image as bytes.
        """
        try:
            # Default configuration for high-quality images
            model = "stable-diffusion-xl-1024-v1-0"
            width = 1024
            height = 1024
            steps = 30
            cfg_scale = 7
            seed = 0  # Random seed
            safety_check = True
            output_format = "PNG"
            
            # Import fireworks-ai client if available
            try:
                import fireworks.client
                from fireworks.client.image import ImageInference, Answer
                
                # Initialize the ImageInference client with our API key
                fireworks.client.api_key = self.api_key
                inference_client = ImageInference(model=model)
                
                # Generate an image using the text_to_image method
                answer: Answer = inference_client.text_to_image(
                    prompt=prompt,
                    height=height,
                    width=width,
                    seed=seed,
                    safety_check=safety_check,
                    output_image_format=output_format,
                    steps=steps,
                    cfg_scale=cfg_scale
                )
                
                if answer.image is None:
                    raise RuntimeError(f"No return image, {answer.finish_reason}")
                
                # Save image to file or return bytes
                if output_path:
                    answer.image.save(output_path)
                    print(f"Image saved to {output_path}")
                    return output_path
                else:
                    # Convert to bytes if no output path provided
                    import io
                    img_bytes = io.BytesIO()
                    answer.image.save(img_bytes, format=output_format)
                    return img_bytes.getvalue()
                
            except ImportError:
                # Fall back to using requests directly if fireworks-ai client is not available
                import requests
                
                # Prepare the request
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                
                # Construct the base URL for Fireworks Image API
                url = f"https://api.fireworks.ai/inference/v1/image/{simplified_model}"
                
                # Prepare the request payload
                payload = {
                    "prompt": prompt,
                    "height": height,
                    "width": width,
                    "seed": seed,
                    "output_format": output_format.lower(),
                    "steps": steps,
                    "cfg_scale": cfg_scale,
                    "safety_check": safety_check
                }
                
                # Make the API request
                response = requests.post(url, headers=headers, json=payload)
                
                if response.status_code == 200:
                    if output_path:
                        # Save the image to the specified path
                        with open(output_path, 'wb') as f:
                            f.write(response.content)
                        print(f"Image saved to {output_path}")
                        return output_path
                    else:
                        # Return the image bytes
                        return response.content
                else:
                    # Handle error
                    error_msg = f"Image generation failed with status code {response.status_code}"
                    try:
                        error_details = response.json()
                        error_msg += f": {error_details}"
                    except:
                        pass
                    raise Exception(error_msg)
                    
        except Exception as e:
            print(f"Error generating image: {e}")
            # Return empty bytes if failed and no output path
            if not output_path:
                return b''
            return None 