import React from "react";
import { motion } from "framer-motion";
import { useCarbonStore } from "../stores/carbonStore";
import { Users } from "lucide-react";

export const RegretEngineWidget: React.FC = () => {
  const activeSimulation = useCarbonStore((state) => state.activeSimulation);

  // Math variables
  const saving = activeSimulation && activeSimulation.recommendations.length > 0 
    ? activeSimulation.recommendations[0].savings_potential 
    : 40.5;

  const totalSavedTons = (saving * 100000) / 1000;
  const treesNeeded = Math.floor((saving * 100000) / 20);
  const homesPowered = Math.floor(totalSavedTons * 0.12);

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 font-sans select-none text-left relative overflow-hidden shadow-xl"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Title bar */}
      <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: "var(--border)" }}>
        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: "var(--text-muted)" }}>Carbon Regret Engine™</span>
        <div className="flex items-center gap-1 text-[9px] font-bold text-purple-400">
          <Users className="w-3.5 h-3.5" />
          <span>If 100,000 people make this choice</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* CO2 Generated/Saved */}
        <div className="rounded-xl p-3 flex flex-col gap-1 transition-all"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>CO2 AVOIDED</span>
          <span className="text-lg font-bold text-purple-400">
            {totalSavedTons.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>tons</span>
          </span>
          <div className="w-full h-1 rounded-full overflow-hidden mt-1.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: "75%" }} 
              className="h-full bg-purple-500"
            />
          </div>
        </div>

        {/* Trees required */}
        <div className="rounded-xl p-3 flex flex-col gap-1 transition-all"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>TREES PLANTED OFFSET</span>
          <span className="text-lg font-bold" style={{ color: "var(--accent)" }}>
            {treesNeeded.toLocaleString()} <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>units</span>
          </span>
          <div className="w-full h-1 rounded-full overflow-hidden mt-1.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: "85%" }} 
              className="h-full"
              style={{ background: "var(--accent)" }}
            />
          </div>
        </div>

        {/* Energy usage equivalent */}
        <div className="rounded-xl p-3 flex flex-col gap-1 transition-all"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>ANNUAL ENERGY SPLIT</span>
          <span className="text-lg font-bold" style={{ color: "var(--accent-secondary)" }}>
            {homesPowered.toLocaleString()} <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>homes</span>
          </span>
          <div className="w-full h-1 rounded-full overflow-hidden mt-1.5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: "60%" }} 
              className="h-full"
              style={{ background: "var(--accent-secondary)" }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegretEngineWidget;
