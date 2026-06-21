import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Sparkles, TrendingDown, Award } from "lucide-react";

type AvatarState = "idle" | "listening" | "thinking" | "speaking" | "success" | "warning";

const TIPS = [
  "💡 Did you know? Train travel in India produces 82% less CO2 than driving.",
  "🌱 Switching to a local vegetarian meal saves 5.6 kg CO2 per serving.",
  "☀️ Karnataka solar subsidies can cover up to 40% of installation costs.",
  "🚲 Cycling 5km daily saves 1,200 kg CO2 per year.",
  "♻️ Buying refurbished electronics reduces e-waste by 70%.",
  "🚌 BMTC bus service saves 3x more carbon than personal vehicles.",
];

export const AIAvatar: React.FC = () => {
  const [state] = useState<AvatarState>("idle");
  const [currentTip, setCurrentTip] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Show tips periodically
    const tipInterval = setInterval(() => {
      setShowTip(true);
      setCurrentTip(prev => (prev + 1) % TIPS.length);
      setTimeout(() => setShowTip(false), 6000);
    }, 20000);

    // Show first tip after 5 seconds
    const firstTip = setTimeout(() => {
      setShowTip(true);
      setTimeout(() => setShowTip(false), 6000);
    }, 5000);

    return () => {
      clearInterval(tipInterval);
      clearTimeout(firstTip);
    };
  }, []);

  const getStateEmoji = () => {
    switch (state) {
      case "listening": return "👂";
      case "thinking": return "🤔";
      case "speaking": return "💬";
      case "success": return "✅";
      case "warning": return "⚠️";
      default: return null;
    }
  };

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 left-6 z-[85] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style={{ background: "var(--accent-glow-strong)", border: "1px solid var(--accent)" }}
        onClick={() => setIsMinimized(false)}
        whileHover={{ scale: 1.1 }}
        aria-label="Show AI Avatar"
      >
        <Leaf className="w-4 h-4" style={{ color: "var(--accent)" }} />
      </motion.button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-[85] flex flex-col items-start gap-2">
      {/* Tip Bubble */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="max-w-[260px] rounded-xl px-3 py-2.5 text-[11px] leading-relaxed shadow-lg"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {TIPS[currentTip]}
            {/* Speech bubble triangle */}
            <div
              className="absolute -bottom-1.5 left-6 w-3 h-3 rotate-45"
              style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="relative w-12 h-12 rounded-full cursor-pointer flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, var(--accent-glow-strong), var(--surface))",
          border: "2px solid var(--accent)",
          boxShadow: "0 0 20px var(--accent-glow)",
        }}
        onClick={() => setIsMinimized(true)}
      >
        {/* State indicator */}
        {getStateEmoji() ? (
          <span className="text-lg">{getStateEmoji()}</span>
        ) : (
          <Leaf className="w-5 h-5" style={{ color: "var(--accent)" }} />
        )}

        {/* Pulse animation for active states */}
        {state !== "idle" && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: "2px solid var(--accent)" }}
            animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Status badges */}
        <div className="absolute -top-1 -right-1 flex gap-0.5">
          {state === "success" && <Sparkles className="w-3 h-3" style={{ color: "var(--accent)" }} />}
          {state === "warning" && <TrendingDown className="w-3 h-3" style={{ color: "var(--warning)" }} />}
        </div>

        {/* Achievement indicator */}
        <div className="absolute -bottom-1 -right-1">
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px]"
            style={{ background: "var(--accent)", color: "var(--bg-primary)" }}>
            <Award className="w-2.5 h-2.5" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIAvatar;
