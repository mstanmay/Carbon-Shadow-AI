import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Volume2 } from "lucide-react";
import { useCarbonStore } from "../stores/carbonStore";

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

interface VoiceAssistantProps {
  isVisible: boolean;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ isVisible }) => {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const runSimulation = useCarbonStore((s) => s.runSimulation);

  // Initialize speech APIs
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.lang = "en-IN"; // Indian English voice

    // Try to use a high-quality voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v =>
      v.lang.includes("en-IN") || v.lang.includes("en-GB") || v.name.includes("Google")
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setState("speaking");
    utterance.onend = () => setState("idle");

    synthRef.current.speak(utterance);
  }, []);

  const processVoiceQuery = useCallback(async (query: string) => {
    setState("thinking");
    setResponse("");

    // Generate a contextual response
    const q = query.toLowerCase();
    let aiResponse = "";

    if (q.includes("travel") || q.includes("mysore") || q.includes("bangalore")) {
      aiResponse = "Train travel from Mysore to Bangalore reduces your carbon footprint by 82% compared to driving. The KSRTC Airavat bus service is another great option, saving 65% carbon emissions. Shall I run a detailed simulation?";
    } else if (q.includes("solar") || q.includes("panel")) {
      aiResponse = "Installing solar panels in Karnataka can save up to 1,500 kg of CO2 per year. With the PM Surya Ghar Yojana subsidy, you can get up to 40% off installation costs. Would you like me to calculate your specific savings?";
    } else if (q.includes("food") || q.includes("diet") || q.includes("vegetarian")) {
      aiResponse = "Switching to a plant-based diet can reduce your food carbon footprint by 73%. Local Indian vegetarian meals produce only 1.2 kg CO2 compared to 6.8 kg for imported meat dishes.";
    } else if (q.includes("electric") || q.includes("scooter") || q.includes("ev")) {
      aiResponse = "An electric scooter saves approximately 138 kg of CO2 per year compared to a petrol scooter. With India's FAME 2 subsidy, you can save up to 40,000 rupees on purchase. Shall I simulate the long-term impact?";
    } else {
      aiResponse = `I analyzed your query about "${query}". Let me run a carbon simulation to give you personalized sustainability recommendations. This will factor in Indian context data including local transit options and regional emission factors.`;
    }

    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1200));
    setResponse(aiResponse);

    // Run the simulation in the store
    runSimulation(query);

    // Speak the response
    speak(aiResponse);
  }, [runSimulation, speak]);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setResponse("Speech recognition is not supported in your browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {
      setState("listening");
      setTranscript("");
      setResponse("");
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          setTranscript(t);
        }
      }
      if (finalTranscript) {
        setTranscript(finalTranscript);
        processVoiceQuery(finalTranscript);
      }
    };

    recognition.onerror = () => {
      setState("idle");
      setResponse("Couldn't catch that. Please try again.");
    };

    recognition.onend = () => {
      if (state === "listening") {
        setState("idle");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsExpanded(true);
  }, [processVoiceQuery, state]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setState("idle");
  }, []);

  const toggleVoice = useCallback(() => {
    if (state === "idle") {
      startListening();
    } else {
      stopListening();
    }
  }, [state, startListening, stopListening]);

  const getOrbColors = () => {
    switch (state) {
      case "listening": return { bg: "from-blue-500 to-cyan-400", shadow: "shadow-[0_0_40px_rgba(59,130,246,0.4)]" };
      case "thinking": return { bg: "from-purple-500 to-pink-400", shadow: "shadow-[0_0_40px_rgba(168,85,247,0.4)]" };
      case "speaking": return { bg: "from-emerald-500 to-green-400", shadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]" };
      default: return { bg: "from-emerald-600 to-teal-500", shadow: "shadow-[0_0_25px_rgba(16,185,129,0.2)]" };
    }
  };

  const orbColors = getOrbColors();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-[320px] rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${state !== "idle" ? "animate-pulse" : ""}`}
                  style={{ background: state === "listening" ? "#3b82f6" : state === "thinking" ? "#a855f7" : state === "speaking" ? "#10b981" : "var(--text-dim)" }}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
                  Voice Assistant
                </span>
              </div>
              <button onClick={() => { stopListening(); setIsExpanded(false); }} className="p-1 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3 min-h-[120px]">
              {/* Waveform Animation */}
              {state === "listening" && (
                <div className="flex items-center justify-center gap-1 py-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full bg-blue-400"
                      animate={{ height: [8, 24 + Math.random() * 16, 8] }}
                      transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }}
                    />
                  ))}
                </div>
              )}

              {state === "thinking" && (
                <div className="flex items-center justify-center gap-2 py-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: "var(--accent-tertiary)" }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              )}

              {state === "speaking" && (
                <div className="flex items-center justify-center gap-1 py-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 rounded-full"
                      style={{ background: "var(--accent)" }}
                      animate={{ height: [6, 18 + Math.random() * 12, 6] }}
                      transition={{ duration: 0.4 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.04 }}
                    />
                  ))}
                </div>
              )}

              {/* Transcript */}
              {transcript && (
                <div className="rounded-xl px-3 py-2 text-xs" style={{ background: "var(--surface)", color: "var(--text-secondary)" }}>
                  <span className="text-[9px] uppercase tracking-wider font-bold block mb-1" style={{ color: "var(--text-dim)" }}>You said:</span>
                  "{transcript}"
                </div>
              )}

              {/* Response */}
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl px-3 py-2 text-xs leading-relaxed"
                  style={{ background: "var(--accent-glow)", border: "1px solid var(--accent-glow-strong)", color: "var(--text-secondary)" }}
                >
                  <span className="text-[9px] uppercase tracking-wider font-bold block mb-1" style={{ color: "var(--accent)" }}>
                    <Volume2 className="w-3 h-3 inline mr-1" />AI Response:
                  </span>
                  {response}
                </motion.div>
              )}

              {/* Idle state prompt */}
              {state === "idle" && !transcript && !response && (
                <div className="text-center py-4" style={{ color: "var(--text-dim)" }}>
                  <p className="text-xs">Tap the mic to ask about sustainability</p>
                  <p className="text-[10px] mt-1 italic">"I want to travel from Mysore to Bangalore"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Orb Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleVoice}
        className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${orbColors.bg} ${orbColors.shadow} flex items-center justify-center transition-shadow cursor-pointer`}
        aria-label="Voice Assistant"
      >
        {/* Pulse rings */}
        {state !== "idle" && (
          <>
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${orbColors.bg}`}
              animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${orbColors.bg}`}
              animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}

        {/* Icon */}
        <div className="relative z-10">
          {state === "listening" ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default VoiceAssistant;
