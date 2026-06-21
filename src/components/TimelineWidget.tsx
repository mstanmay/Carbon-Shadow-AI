import React from "react";
import { motion } from "framer-motion";
import { useCarbonStore } from "../stores/carbonStore";
import { Leaf } from "lucide-react";

export const TimelineWidget: React.FC = () => {
  const activeSimulation = useCarbonStore((state) => state.activeSimulation);

  // If no simulation is loaded, show a beautiful starting placeholder
  const co2 = activeSimulation ? activeSimulation.baseline_co2 : 45.0;
  
  const timelineSteps = [
    { label: "Decision", val: 0, desc: "Commit event" },
    { label: "Immediate", val: co2, desc: `+${co2.toFixed(0)} kg CO2` },
    { label: "Monthly", val: co2 * 4, desc: `+${(co2 * 4).toFixed(0)} kg` },
    { label: "Yearly", val: co2 * 52, desc: `+${(co2 * 52).toFixed(0)} kg` },
    { label: "5-Year", val: co2 * 52 * 5, desc: `+${((co2 * 52 * 5) / 1000).toFixed(1)} tons` }
  ];

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 font-sans select-none text-left relative overflow-hidden shadow-xl"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Title bar */}
      <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: "var(--border)" }}>
        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: "var(--text-muted)" }}>Carbon Shadow Timeline</span>
        <span className="text-[9px] font-bold flex items-center gap-1" style={{ color: "var(--accent)" }}>
          <Leaf className="w-3 h-3" />
          <span>Active Path</span>
        </span>
      </div>

      {/* SVG Animated Timeline */}
      <div className="relative py-4">
        {/* Horizontal Line backdrop */}
        <div className="absolute top-[28px] left-[5%] right-[5%] h-0.5" style={{ background: "var(--border)" }} />
        
        {/* Animated flow line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "90%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute top-[28px] left-[5%] h-0.5"
          style={{ background: "linear-gradient(to right, var(--accent), var(--accent-secondary))" }}
        />

        {/* Nodes */}
        <div className="flex justify-between relative z-10 px-2">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 max-w-[80px] text-center">
              {/* Pulsing Dot */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.2, type: "spring" }}
                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  idx === 0 
                    ? "" 
                    : idx === 4 
                    ? "animate-pulse" 
                    : ""
                }`}
                style={{
                  background: idx === 0 ? "var(--accent)" : idx === 4 ? "var(--accent-secondary)" : "var(--bg-secondary)",
                  borderColor: idx === 0 ? "var(--accent-glow-strong)" : idx === 4 ? "var(--accent-secondary)" : "var(--border)",
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--bg-primary)" }} />
              </motion.div>

              {/* Node Labels */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-semibold" style={{ color: "var(--text-primary)" }}>{step.label}</span>
                <span className="text-[8px] font-bold tracking-tight truncate max-w-[70px] uppercase" style={{ color: "var(--text-dim)" }}>
                  {step.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineWidget;
