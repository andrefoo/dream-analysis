import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Moon, Send, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const DreamAnalysisApp = () => {
  // State management
  const [view, setView] = useState("intro"); // intro, input, analysis
  const [dream, setDream] = useState("");
  const [mood, setMood] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

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
  const analyzeDream = () => {
    setView("analysis");
    setIsTyping(true);

    // Simulate loading time
    setTimeout(() => {
      setAnalysis(sampleAnalysis);
      setIsTyping(false);
    }, 1500);
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
        return "bg-gradient-to-br from-blue-400 to-purple-500";
      case "scary":
        return "bg-gradient-to-br from-red-900 to-gray-900";
      case "confusing":
        return "bg-gradient-to-br from-yellow-400 to-purple-600";
      case "exciting":
        return "bg-gradient-to-br from-pink-500 to-orange-400";
      case "sad":
        return "bg-gradient-to-br from-blue-800 to-gray-900";
      case "nostalgic":
        return "bg-gradient-to-br from-amber-500 to-pink-300";
      default:
        return "bg-gradient-to-br from-indigo-500 to-purple-600";
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-all duration-1000 ${getMoodGradient()}`}
    >
      {/* Floating particles/stars effect */}
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
              y: [null, Math.random() * -100, null],
              opacity: [0.4, 0.8, 0.4]
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
      <div className="z-10 w-full max-w-xl px-4">
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
                <Sparkles className="w-16 h-16 text-white mb-4" />
                <h2 className="text-white text-xl font-semibold mb-3">
                  Discover the meaning behind your dreams
                </h2>
                <p className="text-white text-opacity-80 mb-6">
                  Our AI-powered analysis provides personalized insights into
                  your subconscious mind.
                </p>
                <motion.button
                  className="bg-white text-purple-600 font-medium py-3 px-6 rounded-full flex items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView("input")}
                >
                  Begin Your Journey
                  <ArrowRight className="ml-2 w-4 h-4" />
                </motion.button>
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
                <h2 className="text-white text-lg font-semibold mb-4">
                  Tell me about your dream...
                </h2>
                <textarea
                  className="w-full p-4 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-60 border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-30 resize-none transition"
                  rows={5}
                  placeholder="I was flying over a crystal clear lake, then suddenly started falling..."
                  value={dream}
                  onChange={(e) => setDream(e.target.value)}
                />

                {/* Mood selector */}
                <div className="mt-4">
                  <p className="text-white text-opacity-90 mb-2">
                    How did this dream make you feel?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((m) => (
                      <motion.button
                        key={m}
                        className={`py-2 px-4 rounded-full text-sm font-medium transition ${
                          mood === m
                            ? "bg-white text-purple-700"
                            : "bg-white bg-opacity-20 text-white hover:bg-opacity-30"
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
                        ? "bg-white text-purple-700"
                        : "bg-white bg-opacity-20 text-white cursor-not-allowed"
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
                  <div className="bg-white text-purple-700 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl py-3 px-4 max-w-xs">
                    <p className="text-sm font-medium">My dream:</p>
                    <p>{dream}</p>
                    <p className="text-xs text-right mt-1 text-purple-500">
                      Feeling: {mood}
                    </p>
                  </div>
                </div>

                {/* Loading animation or AI response */}
                <div className="flex mb-4">
                  <div className="bg-purple-600 text-white rounded-tr-2xl rounded-br-2xl rounded-bl-2xl py-3 px-4 max-w-xs">
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
                        <p className="text-sm font-medium">
                          Dream Interpretation:
                        </p>
                        <p>{displayedText}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Symbolism cards - Only show after typing animation completes */}
                {analysis && displayedText === analysis.emotional && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-white font-medium mt-6 mb-3">Symbolic Elements:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {analysis.symbolism.map((item, index) => (
                        <motion.div
                          key={index}
                          className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.2 }}
                        >
                          <h3 className="text-white font-medium">{item.symbol}</h3>
                          <p className="text-white text-opacity-80 text-sm">{item.meaning}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Advice section - Only show after typing animation completes */}
                {analysis && displayedText === analysis.emotional && (
                  <motion.div
                    className="mt-6 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                  >
                    <p className="text-white font-medium mb-2">Suggested Actions:</p>
                    <p className="text-white text-opacity-90">{analysis.advice}</p>
                  </motion.div>
                )}

                {/* Back button */}
                <div className="flex justify-center mt-6">
                  <motion.button
                    className="flex items-center py-2 px-5 rounded-full font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30"
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
