# Dream Analysis Application

An LLM-powered application for analyzing and visualizing dreams.

## Overview

This application guides users through a dream analysis process in four steps:

1. **User Input**: Collect essential information about the dream
2. **Data Processing**: Structure the information in a consistent format
3. **Analysis Generation**: Produce meaningful insights about the dream
4. **Visualization**: Create a visual representation of the dream using AI image generation

## Features

- Simple, conversational interface for dream information collection
- Focused collection of just the essential emotional and narrative elements
- AI-powered dream analysis with personalized insights
- Dream visualization through Fireworks AI image generation (Stable Diffusion)
- Easy-to-use command line interface

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/dream-analysis-app.git
   cd dream-analysis-app
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up your API key:
   Create a `.env` file in the root directory and add:
   ```
   FIREWORKS_API_KEY=your_api_key_here
   ```
   
   Or set it as an environment variable:
   ```
   export FIREWORKS_API_KEY=your_api_key_here
   ```

## Usage

### Running the Pipeline

There are two ways to run the application:

#### 1. Using the main.py entry point:

```
python -m modules.main
```

Optional arguments:
- `--model`: Specify the LLM model to use
- `--temperature`: Set the temperature for generation (0.0-1.0)
- `--output`: Specify the output directory for results

Example:
```
python -m modules.main --model accounts/fireworks/models/llama-v3p3-70b-instruct --temperature 0.7 --output my_dreams
```

#### 2. Using the pipeline directly:

You can also import and use the pipeline in your own code:

```python
from modules.pipeline import DreamAnalysisPipeline
from modules.llm_client import LLMClient

# Initialize the client and pipeline
client = LLMClient(model="accounts/fireworks/models/llama-v3p3-70b-instruct")
pipeline = DreamAnalysisPipeline(llm_client=client)

# Run the pipeline
dream_data = pipeline.run_pipeline()

# Save the results
pipeline.save_dream_data("dream_results/dream_analysis.json")
```

### Generated Files

The pipeline will create:
- A JSON file with the dream analysis and interpretation
- An image visualization of the dream (PNG format)

All output files are saved in the `dream_results` directory by default.

## Project Structure

```
dream-analysis-app/
├── modules/
│   ├── main.py            # Application entry point
│   ├── pipeline.py        # Dream analysis pipeline implementation
│   ├── prompts.py         # LLM prompt templates
│   ├── llm_client.py      # LLM and image generation client
│   └── READme.md          # This file
├── config/
│   └── config.py          # Configuration settings
├── dream_results/         # Output directory for dreams and images
├── requirements.txt       # Dependencies
└── .env                   # Environment variables (API keys)
```

## How It Works

1. The user is asked a series of focused questions about their dream
2. The responses are structured into a consistent JSON format
3. The LLM analyzes the dream information to generate insights
4. The image generation model (Stable Diffusion XL) creates a visual representation

### Image Generation Details

The application uses Fireworks AI's API to generate dream visualizations using Stable Diffusion XL. The process:

1. Formats the LLM-generated dream description into an image prompt
2. Sends the prompt to the Fireworks AI image API
3. Saves the generated image to the output directory

You can customize image generation parameters in the `generate_image` method in `llm_client.py`.

## Customization

You can customize the dream analysis by modifying the prompts in `prompts.py`. 

The simplified data structure focuses on these key elements:
- Narrative: What happened in the dream
- Main Symbols: Key objects or elements
- Primary Emotion: The dominant feeling
- Emotional Intensity: How strongly the emotion was felt
- Life Connection: How the dream relates to waking life

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
