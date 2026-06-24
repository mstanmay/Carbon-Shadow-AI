import React, { useState, useRef, useEffect } from "react";
import { Send, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useCarbonStore } from "../stores/carbonStore";

export const AIAssistant: React.FC = () => {
  const [query, setQuery] = useState("");
  const chatHistory = useCarbonStore((state) => state.chatHistory);
  const activeSimulation = useCarbonStore((state) => state.activeSimulation);
  const runSimulation = useCarbonStore((state) => state.runSimulation);
  const makeDecision = useCarbonStore((state) => state.makeDecision);
  const isLoading = useCarbonStore((state) => state.isLoading);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading, activeSimulation]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    runSimulation(query.trim());
    setQuery("");
  };

  const getOptionBadgeColor = (name: string) => {
    if (name.includes("Eco")) return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
    if (name.includes("Balanced")) return "bg-blue-500/10 text-blue-400 border border-blue-500/25";
    return "bg-purple-500/10 text-purple-400 border border-purple-500/25";
  };

  return (
    <div className="flex flex-col h-[650px] border rounded-2xl overflow-hidden relative shadow-lg"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      {/* Workspace Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between shrink-0"
        style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>AI Processing Terminal</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest" style={{ color: "var(--text-dim)" }}>
          <Activity className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
          <span>Multi-Agent Mode</span>
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {chatHistory.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === "user" ? "self-end items-end" : "self-start items-start"
            }`}
          >
            <span className="text-[9px] mb-1 tracking-wider uppercase" style={{ color: "var(--text-dim)" }}>
              {msg.sender === "user" ? "User Context" : msg.agentName || "Supervisor"} • {msg.timestamp}
            </span>

            <div
              className={`rounded-xl px-4 py-3 text-xs leading-relaxed`}
              style={{
                background: msg.sender === "user" ? "var(--accent-glow)" : msg.sender === "system" ? "transparent" : "var(--bg-secondary)",
                color: msg.sender === "user" ? "var(--text-primary)" : msg.sender === "system" ? "var(--text-dim)" : "var(--text-primary)",
                border: msg.sender === "user" ? "1px solid var(--accent-glow-strong)" : "1px solid var(--border)",
                fontStyle: msg.sender === "system" ? "italic" : "normal"
              }}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {/* Loading / Agent thinking states */}
        {isLoading && (
          <div className="flex flex-col max-w-[80%] self-start items-start gap-1">
            <span className="text-[9px] uppercase" style={{ color: "var(--text-dim)" }}>Agents Processing</span>
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--accent)" }} />
              <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: "var(--accent)" }} />
              <span className="italic" style={{ color: "var(--text-dim)" }}>Graph executing nodes...</span>
            </div>
          </div>
        )}

        {/* Progressive Simulation Display (ChatGPT thinking effect) */}
        {activeSimulation && !isLoading && (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.5 }
              }
            }}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-4 mt-2"
          >
            {/* 1. Intent Extraction */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="rounded-xl p-4 transition-all"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
            >
              <div className="text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "var(--text-dim)" }}>Intent Analysis</div>
              <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                Query mapped to category <span className="font-bold" style={{ color: "var(--accent-secondary)" }}>{activeSimulation.category}</span>. Extraction logs confirm travel/purchase target metrics correctly.
              </p>
            </motion.div>

            {/* 2. Carbon Simulation */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="rounded-xl p-4 transition-all"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
            >
              <div className="text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "var(--text-dim)" }}>Carbon Simulation</div>
              <p className="text-xs" style={{ color: "var(--text-primary)" }}>
                Baseline footprint computed: <span className="text-red-400 font-bold">{activeSimulation.baseline_co2.toFixed(1)} kg CO2</span>.
              </p>
            </motion.div>

            {/* 3. Decision Intelligence Recommendations */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="flex flex-col gap-3"
            >
              <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--text-dim)" }}>Decision Intelligence Recommendations</div>
              <div className="grid grid-cols-1 gap-3">
                {activeSimulation.recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-md hover:shadow-lg"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex flex-col gap-1.5 max-w-xl">
                      <span className={`text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full self-start ${getOptionBadgeColor(rec.option_name)}`}>
                        {rec.option_name}
                      </span>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
                        {rec.reasoning}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-right justify-between sm:justify-end shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0" style={{ borderColor: "var(--border)" }}>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase" style={{ color: "var(--text-dim)" }}>Impact</span>
                        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{rec.co2_value.toFixed(1)} kg</span>
                      </div>
                      <button
                        onClick={() => makeDecision(rec.option_name, rec.savings_potential)}
                        className="font-bold text-[10px] px-3.5 py-2 rounded-lg transition-all active:scale-95 cursor-pointer"
                        style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
                      >
                        Select
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Tray */}
      <form onSubmit={handleSend} className="border-t p-4 flex gap-2 shrink-0" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="E.g., What if I drive from Mysore to Bangalore?"
          disabled={isLoading}
          className="flex-1 rounded-xl px-4 py-3 text-xs outline-none transition-all"
          style={{ background: "var(--surface)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 active:scale-95 cursor-pointer shrink-0"
          style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
