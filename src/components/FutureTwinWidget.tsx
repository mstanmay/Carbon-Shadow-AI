import React from "react";
import { motion } from "framer-motion";
import { useCarbonStore } from "../stores/carbonStore";
import { ShieldCheck, ShieldAlert, Zap } from "lucide-react";

export const FutureTwinWidget: React.FC = () => {
  const activeSimulation = useCarbonStore((state) => state.activeSimulation);

  // Fallback defaults
  const co2 = activeSimulation ? activeSimulation.baseline_co2 : 45.0;
  
  const futures = [
    {
      title: "Future A",
      label: "Current Habit",
      co2: co2 * 52,
      saved: 0,
      impact: "High Risk profile. Continuing this path triggers high cumulative carbon shadow regret.",
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      color: "border-[#ef4444] hover:border-[#ef4444]"
    },
    {
      title: "Future B",
      label: "Balanced Option",
      co2: co2 * 0.4 * 52,
      saved: Math.floor(co2 * 12),
      impact: "Moderate profile. Standard convenience maintained with reasonable footprint savings.",
      icon: <Zap className="w-5 h-5 text-blue-400 animate-pulse" />,
      color: "border-[#3b82f6] hover:border-[#3b82f6]"
    },
    {
      title: "Future C",
      label: "Eco Optimized",
      co2: co2 * 0.1 * 52,
      saved: Math.floor(co2 * 28),
      impact: "Carbon Neutral Champion. Adopt optimal choices to maximize environmental returns.",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      color: "border-[var(--accent)] hover:border-[var(--accent)]"
    }
  ];

  return (
    <div className="flex flex-col gap-3 font-sans select-none text-left">
      <h3 className="text-[10px] uppercase font-bold tracking-widest border-b pb-2"
        style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
        Future Self Simulator™
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {futures.map((fut, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 150 }}
            className="rounded-xl p-4 flex flex-col justify-between gap-3 border shadow-lg transition-all"
            style={{ 
              background: "var(--surface)", 
              borderTopColor: "var(--border)",
              borderRightColor: "var(--border)",
              borderBottomColor: "var(--border)",
              borderLeftWidth: "2px",
              ...fut.color.includes('var') ? { borderLeftColor: 'var(--accent)' } : { borderLeftColor: fut.color.split('[')[1].split(']')[0] } 
            }}
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>{fut.title}</span>
                {fut.icon}
              </div>
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{fut.label}</span>
              <p className="text-[10px] leading-relaxed min-h-[50px]" style={{ color: "var(--text-dim)" }}>{fut.impact}</p>
            </div>

            <div className="flex flex-col gap-1 border-t pt-2" style={{ borderColor: "var(--border)" }}>
              <div className="flex justify-between text-[9px]" style={{ color: "var(--text-dim)" }}>
                <span>Footprint</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{fut.co2.toFixed(0)} kg CO2</span>
              </div>
              <div className="flex justify-between text-[9px]" style={{ color: "var(--text-dim)" }}>
                <span>Est. Savings</span>
                <span className="font-medium" style={{ color: "var(--accent)" }}>${fut.saved} USD</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FutureTwinWidget;
