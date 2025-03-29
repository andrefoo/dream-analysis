import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Moon,
  Send,
  BookOpen,
  Brain,
  Heart,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import GeminiApi from "./geminiApi";

interface SymbolismItem {
  symbol: string;
  meaning: string;
}

interface Analysis {
  symbolism: SymbolismItem[];
  emotional: string;
  advice: string;
}

const DreamAnalysisApp = () => {
  // State management
  const [view, setView] = useState("intro"); // intro, input, analysis
  const [dream, setDream] = useState("");
  const [mood, setMood] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

  // Add new state for features carousel
  const [currentFeature, setCurrentFeature] = useState(0);
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description:
        "Advanced algorithms analyze your dream patterns and symbolism",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Personalized Insights",
      description:
        "Get tailored interpretations based on your emotions and context",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Dream Journal",
      description:
        "Track your dreams over time and identify recurring patterns",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Symbol Dictionary",
      description: "Explore common dream symbols and their meanings",
    },
  ];

  // Sample moods for the mood selector
  const moods = [
    "peaceful",
    "scary",
    "confusing",
    "exciting",
    "sad",
    "nostalgic",
  ];

  // Sample analysis response (in production, this would come from your LLM API)
  const sampleAnalysis = {
    symbolism: [
      {
        symbol: "Flying",
        meaning:
          "Represents a desire for freedom or escape from constraints in your waking life.",
      },
      {
        symbol: "Water",
        meaning:
          "Often connected to emotions and the unconscious mind. Clear water suggests emotional clarity.",
      },
      {
        symbol: "Falling",
        meaning:
          "May indicate anxiety about losing control or fear of failure in some aspect of your life.",
      },
    ],
    emotional:
      "Your dream suggests you're experiencing a period of transition. The mixture of flying and falling points to ambivalence about a current life change - excitement about new possibilities but anxiety about potential failure. The peaceful water scenes reflect a desire for emotional calm amidst this change.",
    advice:
      "Consider journaling about areas in your life where you feel both excited and anxious. Mindfulness meditation may help you embrace the uncertainty of transition periods. Try visualizing yourself successfully navigating this change before sleep each night.",
  };

  // Function to simulate API call for dream analysis
  const analyzeDream = async () => {
    setView("analysis");
    setIsTyping(true);
    const response = await GeminiApi.query(dream);
    sampleAnalysis.emotional = response;
    setAnalysis(sampleAnalysis);
    setIsTyping(false);
    console.log(response);
  };

  // Text animation effect for the analysis response
  useEffect(() => {
    if (analysis && !isTyping) {
      if (textIndex < analysis.emotional.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(analysis.emotional.substring(0, textIndex + 1));
          setTextIndex(textIndex + 1);
        }, 20);
        return () => clearTimeout(timeout);
      }
    }
  }, [analysis, textIndex, isTyping]);

  // Effect to reset text animation when returning to input view
  useEffect(() => {
    if (view === "input") {
      setTextIndex(0);
      setDisplayedText("");
    }
  }, [view]);

  // Background gradient based on selected mood
  const getMoodGradient = () => {
    switch (mood) {
      case "peaceful":
        return "bg-dream-black bg-gradient-to-br from-dream-blue/20 to-dream-purple/20";
      case "scary":
        return "bg-dream-black bg-gradient-to-br from-dream-dark-purple/20 to-dream-pink-red/20";
      case "confusing":
        return "bg-dream-black bg-gradient-to-br from-dream-purple/20 to-dream-dark-pink/20";
      case "exciting":
        return "bg-dream-black bg-gradient-to-br from-dream-orange/20 to-dream-pink/20";
      case "sad":
        return "bg-dream-black bg-gradient-to-br from-dream-dark-purple/20 to-dream-dark-pink/20";
      case "nostalgic":
        return "bg-dream-black bg-gradient-to-br from-dream-pink/20 to-dream-purple/20";
      default:
        return "bg-dream-black bg-gradient-to-br from-dream-purple/20 to-dream-blue/20";
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center transition-all duration-1000 ${getMoodGradient()}`}
    >
      {/* Animated background graphics */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Animated moons */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`moon-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Moon className="w-6 h-6 text-white" />
          </motion.div>
        ))}

        {/* Animated stars */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Star className="w-4 h-4 text-white" />
          </motion.div>
        ))}

        {/* Floating circles - increased number and size variation */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 500 + 200,
              height: Math.random() * 500 + 200,
              background: `radial-gradient(circle, ${
                i % 2 === 0 ? "#9678d1" : "#889adc"
              }15, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * 200 - 100, 0],
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 15 + Math.random() * 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating lines - increased number and length */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`line-${i}`}
            className="absolute h-[1px]"
            style={{
              width: Math.random() * 400 + 200,
              background: `linear-gradient(90deg, transparent, ${
                i % 2 === 0 ? "#e688af" : "#ec7058"
              }20, transparent)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              x: [0, Math.random() * 300 - 150, 0],
              y: [0, Math.random() * 300 - 150, 0],
              rotate: [0, 180, 360],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{
              duration: 20 + Math.random() * 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Glowing dots - increased number and spread */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? "#e688af" : i % 3 === 1 ? "#ec7058" : "#9678d1"
              }30, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, Math.random() * -200, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.8, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Animated mesh pattern - increased size and opacity */}
        <div className="absolute inset-0 opacity-15">
          <svg width="100%" height="100%">
            <pattern
              id="mesh-pattern"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="url(#mesh-gradient)"
                strokeWidth="0.5"
              />
              <defs>
                <linearGradient
                  id="mesh-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#9678d1" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#889adc" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </pattern>
            <rect width="100%" height="100%" fill="url(#mesh-pattern)" />
          </svg>
        </div>

        {/* Additional floating shapes */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              background: `radial-gradient(circle, ${
                i % 2 === 0 ? "#b03e70" : "#871d78"
              }10, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              clipPath:
                i % 2 === 0
                  ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
                  : "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            }}
            animate={{
              x: [0, Math.random() * 150 - 75, 0],
              y: [0, Math.random() * 150 - 75, 0],
              rotate: [0, 180, 360],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 12 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Existing floating particles/stars effect */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-70"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, Math.random() * -100, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3 + Math.random() * 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* App content */}
      <div className="z-10 w-full max-w-xl px-4 relative">
        {/* App logo and header */}
        <motion.div
          className="flex items-center justify-center mb-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="flex items-center bg-white bg-opacity-10 p-3 rounded-full backdrop-blur-sm">
            <Moon className="w-8 h-8 text-white mr-3" />
            <h1 className="text-white text-2xl font-bold">DreamSight</h1>
          </div>
        </motion.div>

        {/* Main content container */}
        <motion.div
          className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Intro view */}
          <AnimatePresence mode="wait">
            {view === "intro" && (
              <motion.div
                key="intro"
                className="p-8 flex flex-col items-center text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 1 }}
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-dream-orange to-dream-pink-red rounded-full blur opacity-75 animate-pulse"></div>
                    <div className="relative bg-dream-black bg-opacity-30 p-4 rounded-full backdrop-blur-sm">
                      <Moon className="w-16 h-16 text-dream-pink" />
                    </div>
                  </div>
                </motion.div>

                <motion.h1
                  className="text-white text-4xl font-bold mt-6 mb-2 font-title"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  DreamSight
                </motion.h1>

                <motion.p
                  className="text-white text-xl text-opacity-80 mb-8 font-sans"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Discover the meaning behind your dreams
                </motion.p>

                {/* Features Carousel */}
                <motion.div
                  className="w-full max-w-md mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                      <motion.button
                        className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setCurrentFeature(
                            (prev) =>
                              (prev - 1 + features.length) % features.length
                          )
                        }
                      >
                        <ChevronLeft className="w-6 h-6 text-white" />
                      </motion.button>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                      <motion.button
                        className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setCurrentFeature(
                            (prev) => (prev + 1) % features.length
                          )
                        }
                      >
                        <ChevronRight className="w-6 h-6 text-white" />
                      </motion.button>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentFeature}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="bg-dream-black bg-opacity-30 backdrop-blur-sm rounded-xl p-6"
                      >
                        <div className="flex justify-center mb-4 text-dream-pink">
                          {features[currentFeature].icon}
                        </div>
                        <h3 className="text-white text-lg font-semibold mb-2">
                          {features[currentFeature].title}
                        </h3>
                        <p className="text-white text-opacity-80">
                          {features[currentFeature].description}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    className="bg-dream-orange text-white font-medium py-3 px-6 rounded-full flex items-center hover:bg-dream-pink-red transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setView("input")}
                  >
                    Begin Your Journey
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </motion.button>
                  <motion.button
                    className="bg-dream-dark-purple text-white font-medium py-3 px-6 rounded-full flex items-center hover:bg-dream-dark-pink transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      window.open(
                        "https://en.wikipedia.org/wiki/Dream_interpretation",
                        "_blank"
                      )
                    }
                  >
                    Learn More
                    <Zap className="ml-2 w-4 h-4" />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Dream input view */}
            {view === "input" && (
              <motion.div
                key="input"
                className="p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-white text-lg font-semibold mb-4 font-title">
                  Tell me about your dream...
                </h2>
                <textarea
                  className="w-full p-4 rounded-lg bg-dream-black bg-opacity-30 text-white placeholder-white placeholder-opacity-60 border border-dream-pink border-opacity-20 focus:outline-none focus:ring-2 focus:ring-dream-pink focus:ring-opacity-30 resize-none transition"
                  rows={5}
                  placeholder="I was flying over a crystal clear lake, then suddenly started falling..."
                  value={dream}
                  onChange={(e) => setDream(e.target.value)}
                />

                {/* Mood selector */}
                <div className="mt-4">
                  <p className="text-white text-opacity-90 mb-2 font-sans">
                    How did this dream make you feel?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((m) => (
                      <motion.button
                        key={m}
                        className={`py-2 px-4 rounded-full text-sm font-medium transition ${
                          mood === m
                            ? "bg-dream-orange text-white hover:bg-dream-pink-red"
                            : "bg-dream-black bg-opacity-30 text-white hover:bg-opacity-50"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setMood(m)}
                      >
                        {m}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-end mt-6">
                  <motion.button
                    className={`flex items-center py-3 px-6 rounded-full font-medium ${
                      dream && mood
                        ? "bg-dream-orange text-white hover:bg-dream-pink-red"
                        : "bg-dream-black bg-opacity-30 text-white cursor-not-allowed"
                    }`}
                    whileHover={dream && mood ? { scale: 1.05 } : {}}
                    whileTap={dream && mood ? { scale: 0.95 } : {}}
                    onClick={dream && mood ? analyzeDream : undefined}
                    disabled={!dream || !mood}
                  >
                    <span>Analyze</span>
                    <Send className="ml-2 w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Analysis view */}
            {view === "analysis" && (
              <motion.div
                key="analysis"
                className="p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Chatbot style message - User's dream */}
                <div className="flex justify-end mb-4">
                  <div className="bg-dream-orange text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl py-3 px-4 max-w-xs">
                    <p className="text-sm font-medium font-title">My dream:</p>
                    <p>{dream}</p>
                    <p className="text-xs text-right mt-1 text-white text-opacity-80">
                      Feeling: {mood}
                    </p>
                  </div>
                </div>

                {/* Loading animation or AI response */}
                <div className="flex mb-4">
                  <div className="bg-dream-dark-purple text-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl py-3 px-4 max-w-xs">
                    {isTyping ? (
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2 h-2 rounded-full bg-white animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-white animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-white animate-bounce"
                          style={{ animationDelay: "600ms" }}
                        ></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium font-title">
                          Dream Interpretation:
                        </p>
                        <p>{displayedText}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Symbolism cards */}
                {analysis && displayedText === analysis.emotional && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-white font-medium mt-6 mb-3 font-title">
                      Symbolic Elements:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {analysis.symbolism.map((item, index) => (
                        <motion.div
                          key={index}
                          className="bg-dream-black bg-opacity-30 backdrop-blur-sm rounded-lg p-3"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.2 }}
                        >
                          <h3 className="text-dream-pink font-medium font-title">
                            {item.symbol}
                          </h3>
                          <p className="text-white text-opacity-80 text-sm font-sans">
                            {item.meaning}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Advice section */}
                {analysis && displayedText === analysis.emotional && (
                  <motion.div
                    className="mt-6 bg-dream-black bg-opacity-30 backdrop-blur-sm rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                  >
                    <p className="text-dream-pink font-medium mb-2 font-title">
                      Suggested Actions:
                    </p>
                    <p className="text-white text-opacity-90 font-sans">
                      {analysis.advice}
                    </p>
                  </motion.div>
                )}

                {/* Back button */}
                <div className="flex justify-center mt-6">
                  <motion.button
                    className="flex items-center py-2 px-5 rounded-full font-medium bg-dream-black bg-opacity-30 text-white hover:bg-opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setView("input")}
                  >
                    <span>New Dream</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer info */}
        <motion.p
          className="text-white text-opacity-60 text-center text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          DreamSight uses AI to analyze dream patterns. Not a substitute for
          professional advice.
        </motion.p>
      </div>
    </div>
  );
};

export default DreamAnalysisApp;
