import React from "react";
import { Sparkles, ArrowRight, Plane, Zap, ShoppingBag } from "lucide-react";
import { useCarbonStore, type CopilotAlert } from "../stores/carbonStore";

interface CopilotCardProps {
  alert: CopilotAlert;
}

export const CopilotCard: React.FC<CopilotCardProps> = ({ alert }) => {
  const runSimulation = useCarbonStore((state) => state.runSimulation);
  const setTab = useCarbonStore((state) => state.setTab);

  const handleAction = () => {
    setTab("assistant");
    runSimulation(alert.default_query);
  };

  const getIcon = () => {
    switch (alert.type) {
      case "travel":
        return <Plane className="w-4 h-4" style={{ color: "var(--accent)" }} />;
      case "energy":
        return <Zap className="w-4 h-4" style={{ color: "var(--accent-secondary)" }} />;
      case "shopping":
        return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4" style={{ color: "var(--accent)" }} />;
    }
  };

  return (
    <div className="rounded-xl p-4 flex flex-col justify-between gap-3 shadow-md border-l-2 transition-all"
      style={{ background: "var(--surface)", borderLeftColor: "var(--accent)", borderRight: "1px solid var(--border)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-lg" style={{ background: "var(--bg-secondary)" }}>
          {getIcon()}
        </div>
        <div className="flex flex-col gap-0.5">
          <h4 className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{alert.title}</h4>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{alert.message}</p>
        </div>
      </div>

      <button
        onClick={handleAction}
        className="flex items-center gap-1 text-[10px] font-medium transition-colors self-end"
        style={{ color: "var(--accent)" }}
      >
        <span>{alert.action_label}</span>
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};

export default CopilotCard;
