import axios from "axios";
import fireWorksAnalyzeDream from "fireworksApi/main";
import { Platform, Alert } from "react-native";

// Define global variables for backend availability
const appState: {
  backendAvailable?: boolean;
  hasCheckedBackendAvailability?: boolean;
} = {};

interface SymbolismItem {
  symbol: string;
  meaning: string;
}

interface Analysis {
  symbolism: SymbolismItem[];
  emotional: string;
  advice: string;
}

// Collection of dream symbols and meanings for fallback only
const dreamSymbols: Record<string, string> = {
  water:
    "Often connected to emotions and the unconscious mind. Clear water suggests emotional clarity.",
  flying:
    "Represents a desire for freedom or escape from constraints in your waking life.",
  falling:
    "May indicate anxiety about losing control or fear of failure in some aspect of your life.",
  teeth:
    "Often relates to concerns about appearance, communication, or personal power.",
  chase:
    "Typically represents avoiding an issue or emotion that needs to be addressed.",
  house:
    "Symbolizes the self, with different rooms representing different aspects of your personality.",
  death:
    "Usually symbolizes endings and new beginnings, rather than literal death.",
  animals:
    "Different animals carry unique meanings, often relating to qualities you identify with.",
  money:
    "Often represents self-worth, personal value, or concerns about security.",
  family:
    "Represents your relationship with your roots, heritage, and core emotional connections.",
};

// Collection of advice based on dream topics for fallback only
const dreamAdvice: Record<string, string> = {
  default:
    "Consider journaling about these dream themes to gain deeper insight into your subconscious patterns.",
  peaceful:
    "Try to incorporate mindfulness meditation into your routine to maintain this sense of calm.",
  scary:
    "Consider exploring what aspects of your waking life might be causing anxiety or fear.",
  confusing:
    "Reflect on areas of your life that feel uncertain and consider creating more structure.",
  exciting:
    "Channel this creative energy into a project or activity you've been wanting to pursue.",
  sad: "Take time to process any recent losses or disappointments with self-compassion.",
  nostalgic:
    "Reflect on what these memories mean to you and how they might guide your present choices.",
};

// Generate a fallback analysis when the LLM backend is not available
function generateFallbackAnalysis(dream: string, mood: string): Analysis {
  // Extract potential symbols
  const identifiedSymbols: SymbolismItem[] = [];

  // Check for known symbols in the dream text
  Object.keys(dreamSymbols).forEach((key) => {
    if (dream.toLowerCase().includes(key) && identifiedSymbols.length < 3) {
      identifiedSymbols.push({
        symbol: key.charAt(0).toUpperCase() + key.slice(1),
        meaning: dreamSymbols[key],
      });
    }
  });

  // If no symbols were found, use default ones
  if (identifiedSymbols.length === 0) {
    identifiedSymbols.push(
      { symbol: "Flying", meaning: dreamSymbols["flying"] },
      { symbol: "Water", meaning: dreamSymbols["water"] },
      { symbol: "House", meaning: dreamSymbols["house"] }
    );
  }

  // Create custom emotional interpretation based on mood
  let emotional = "Your dream suggests feelings of ";

  if (mood) {
    emotional += `${mood}ness mixed with introspection. `;
    emotional += `The ${identifiedSymbols[0]?.symbol.toLowerCase()} in your dream indicates ${
      mood === "peaceful"
        ? "a sense of calm and stability"
        : mood === "scary"
        ? "underlying concerns or fears"
        : mood === "confusing"
        ? "uncertainty or unresolved questions"
        : mood === "exciting"
        ? "potential for growth and new possibilities"
        : mood === "sad"
        ? "processing of emotional experiences"
        : mood === "nostalgic"
        ? "connection to important past experiences"
        : "significant emotional symbolism"
    }.`;
  } else {
    emotional +=
      "complex emotion. There seems to be a blend of curiosity and contemplation in how your mind is processing recent experiences.";
  }

  // Get appropriate advice
  const advice = dreamAdvice[mood] || dreamAdvice["default"];

  return {
    symbolism: identifiedSymbols,
    emotional,
    advice,
  };
}
class DreamAnalysisService {
  // Base URL for the Flask backend
  // For Android emulator use 10.0.2.2 instead of localhost
  // For iOS simulator use localhost
  // For physical devices, use your computer's IP address on the same network
  // For web, use localhost
  private static API_URL = "http://127.0.0.1:8000";

  static async analyzeDreamDetailed(
    dream: string,
    mood: string = "",
    mainSymbols: string[] = [],
    emotionalIntensity: number = 3,
    lifeConnection: string = ""
  ): Promise<Analysis> {
    console.log(`Connecting to backend at: ${this.API_URL}`);

    // If no symbols were explicitly provided, extract some from the dream text
    const symbols =
      mainSymbols.length > 0
        ? mainSymbols
        : dream
            .split(" ")
            .filter((word) => word.length > 5)
            .slice(0, 3);

    return await this.analyzeDream(dream, mood);
  }

  static async analyzeDream(
    dream: string,
    mood: string = ""
  ): Promise<Analysis> {
    try {
      const test = await fireWorksAnalyzeDream(dream, mood);
      console.log("test", test);
      const data = {
        symbols: [
          { symbol: "Water", meaning: "Emotional state or subconscious mind" },
          { symbol: "Flying", meaning: "Freedom and escape from limitations" },
        ],
        analysis: `Your dream reflects a ${mood} emotional state.`,
        advice: "Consider journaling your feelings to gain clarity.",
      };

      // Transform the API response to our Analysis interface
      return {
        symbolism: data.symbols || [],
        emotional: data.analysis || "",
        advice: dreamAdvice[mood] || dreamAdvice["default"],
      };
    } catch (error) {
      console.error("Error analyzing dream - will use mock data:", error);
      // Always fall back to custom mock data on error
      return generateFallbackAnalysis(dream, mood);
    }
  }

  // Keep the original analyzeDream for backward compatibility
  // static async analyzeDream(dream: string, mood: string = ''): Promise<Analysis> {
  //   // Simply call the new detailed method with default values
  //   return this.analyzeDreamDetailed(dream, mood);
  // }
}

export default DreamAnalysisService;
