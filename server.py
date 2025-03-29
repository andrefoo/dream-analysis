from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import random
from typing import List, Dict, Any

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Predefined dream analysis responses
DREAM_ANALYSES = [
    "Your dream suggests a period of transition in your life. The symbols present indicate you're processing recent changes and seeking clarity. Consider reflecting on decisions you've been contemplating recently.",
    "This dream reveals inner conflicts between your desire for security and yearning for new experiences. The emotional intensity suggests this is an important area for personal growth.",
    "The symbols in your dream point to unresolved feelings that seek expression. Consider journaling about these emotions to gain greater insight and peace of mind.",
    "Your dream reflects a creative breakthrough on the horizon. The imagery suggests your subconscious is processing innovative ideas that haven't yet surfaced in your conscious mind.",
    "This dream indicates you're processing feelings of uncertainty about a recent decision. The emotional undertones suggest a need to trust your intuition more fully."
]

# Predefined symbolism interpretations
DREAM_SYMBOLS = {
    "water": "Often connected to emotions and the unconscious mind. Clear water suggests emotional clarity.",
    "flying": "Represents a desire for freedom or escape from constraints in your waking life.",
    "falling": "May indicate anxiety about losing control or fear of failure in some aspect of your life.",
    "teeth": "Often relates to concerns about appearance, communication, or personal power.",
    "chase": "Typically represents avoiding an issue or emotion that needs to be addressed.",
    "house": "Symbolizes the self, with different rooms representing different aspects of your personality.",
    "death": "Usually symbolizes endings and new beginnings, rather than literal death.",
    "animals": "Different animals carry unique meanings, often relating to qualities you identify with.",
    "money": "Often represents self-worth, personal value, or concerns about security.",
    "family": "Represents your relationship with your roots, heritage, and core emotional connections."
}

@app.route('/api/analyze-dream', methods=['POST'])
def analyze_dream():
    # Get request data
    data = request.json
    
    try:
        # Extract dream details from request
        dream_text = data.get('narrative', '')
        mood = data.get('primaryEmotion', '')
        symbols = data.get('mainSymbols', [])
        
        # Find relevant symbols from the dream text
        identified_symbols = []
        for key in DREAM_SYMBOLS:
            if key in dream_text.lower() and len(identified_symbols) < 3:
                identified_symbols.append({
                    "symbol": key.capitalize(),
                    "meaning": DREAM_SYMBOLS[key]
                })
        
        # If no symbols were found, use up to 3 random ones
        if not identified_symbols:
            random_keys = random.sample(list(DREAM_SYMBOLS.keys()), min(3, len(DREAM_SYMBOLS)))
            for key in random_keys:
                identified_symbols.append({
                    "symbol": key.capitalize(),
                    "meaning": DREAM_SYMBOLS[key]
                })
        
        # Choose a random analysis
        analysis = random.choice(DREAM_ANALYSES)
        
        # Personalize the analysis based on mood
        if mood:
            mood_additions = {
                "peaceful": " The peaceful elements suggest you're finding harmony amidst change.",
                "scary": " The frightening aspects reflect your concerns about these changes.",
                "confusing": " The confusing elements indicate you're still processing these developments.",
                "exciting": " The exciting nature of your dream suggests optimism about what's coming.",
                "sad": " The sadness in your dream may be processing necessary endings before new beginnings.",
                "nostalgic": " The nostalgic quality suggests connecting present changes with past experiences."
            }
            if mood in mood_additions:
                analysis += mood_additions[mood]
        
        # Return the customized analysis
        return jsonify({
            'success': True,
            'analysis': analysis,
            'symbols': identified_symbols,
            'imagePrompt': f"Abstract dreamscape representing {mood} feelings with {', '.join(symbols) if symbols else 'flowing elements'}"
        })
        
    except Exception as e:
        print(f"Error analyzing dream: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'analysis': "Your dream suggests changes in your life that require careful consideration. The symbols point to a need for introspection during this time of transition."
        }), 500

if __name__ == '__main__':
    # Run the Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 