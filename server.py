from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import json
from typing import List, Dict, Any
from pydantic import BaseModel, Field

# Add the parent directory to sys.path to allow imports from the modules package
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the modules for dream analysis
from modules.llm_client import LLMClient
from modules.pipeline import DreamAnalysisPipeline, DreamSchema, DreamAnalysis
from modules.prompts import format_analysis_prompt, format_image_prompt

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET", "POST", "OPTIONS"], allow_headers=["Content-Type"])  # Enable CORS for all routes and origins

# Initialize LLM client
llm_client = LLMClient()

# Initialize dream analysis pipeline
pipeline = DreamAnalysisPipeline(llm_client=llm_client)

@app.route('/api/analyze-dream', methods=['HEAD'])
def check_api():
    """Endpoint to check if the API is available"""
    return "", 200

@app.route('/api/analyze-dream', methods=['POST', 'GET'])
def analyze_dream():
    """Analyze a dream using the LLM pipeline"""
    # Get request data
    data = request.json
    
    try:
        # Create dream data object from request using our DreamSchema
        dream_data = DreamSchema(
            narrative=data.get('narrative', ''),
            mainSymbols=data.get('mainSymbols', []),
            primaryEmotion=data.get('primaryEmotion', ''),
            emotionalIntensity=data.get('emotionalIntensity', 3),
            lifeConnection=data.get('lifeConnection', '')
        )
        
        # Store the dream data in the pipeline
        pipeline.dream_data = dream_data
        
        # Generate the analysis using the LLM
        analysis = pipeline.generate_analysis()
        
        # Extract symbols from the dream narrative using our pipeline
        # If no real symbols are identified, we'll use placeholders
        identified_symbols = []
        for symbol in dream_data.mainSymbols:
            identified_symbols.append({
                "symbol": symbol.capitalize(),
                "meaning": f"This symbol appears significant in your dream context."
            })
        
        # If we have fewer than 3 symbols, add some generic ones
        if len(identified_symbols) < 3:
            for symbol in ["Dream", "Emotion", "Connection"]:
                if len(identified_symbols) >= 3:
                    break
                identified_symbols.append({
                    "symbol": symbol,
                    "meaning": f"Represents an aspect of your unconscious mind."
                })
        
        # Return the analysis result
        return jsonify({
            'success': True,
            'analysis': analysis.analysis,
            'symbols': identified_symbols,
            'imagePrompt': analysis.imagePrompt
        })
        
    except Exception as e:
        print(f"Error analyzing dream: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'analysis': "Your dream suggests changes in your life that require careful consideration. The symbols point to a need for introspection during this time of transition."
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'success': True,
        'message': "Backend is running and reachable."
    })

if __name__ == '__main__':
    try:
        # Run the Flask app
        port = int(os.environ.get('PORT', 8000))
        print(f"\n🚀 Dream Analysis API Server running at http://localhost:{port}/")
        print(f"Try http://127.0.0.1:{port}/ or http://[your-ip-address]:{port}/ if localhost doesn't work\n")
        app.run(host='0.0.0.0', port=port, debug=True)
    except Exception as e:
        print(f"Error starting server: {e}") 