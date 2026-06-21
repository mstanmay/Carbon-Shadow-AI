import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { useCarbonStore } from "../stores/carbonStore";
import { ShieldAlert, TrendingDown, Target, Zap } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export const AnalyticsView: React.FC = () => {
  const forecastData = useCarbonStore((state) => state.forecastData);
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 font-sans select-none text-left animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{t("mission_control")}</h2>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          High-impact environmental parameters and future carbon risk thresholds.
        </p>
      </div>

      {/* 4 Large Visual Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Panel 1: Biggest Emission Source */}
        <div className="rounded-2xl p-5 flex flex-col justify-between border-l-2 shadow-xl min-h-[140px]"
          style={{ background: "var(--surface)", borderLeftColor: "#ef4444", borderRight: "1px solid var(--border)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex justify-between items-center" style={{ color: "var(--text-dim)" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("biggest_emission")}</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex flex-col mt-4">
            <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Travel Commute</span>
            <span className="text-[10px] mt-1" style={{ color: "var(--text-dim)" }}>Responsible for 45% of total carbon footprint</span>
          </div>
        </div>

        {/* Panel 2: Most Effective Action */}
        <div className="rounded-2xl p-5 flex flex-col justify-between border-l-2 shadow-xl min-h-[140px]"
          style={{ background: "var(--surface)", borderLeftColor: "var(--accent)", borderRight: "1px solid var(--border)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex justify-between items-center" style={{ color: "var(--text-dim)" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("most_effective")}</span>
            <Target className="w-4 h-4" style={{ color: "var(--accent)" }} />
          </div>
          <div className="flex flex-col mt-4">
            <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Refurbished Gear</span>
            <span className="text-[10px] font-medium mt-1" style={{ color: "var(--accent)" }}>Saved 270 kg CO2 / purchase cycle</span>
          </div>
        </div>

        {/* Panel 3: Monthly Savings */}
        <div className="rounded-2xl p-5 flex flex-col justify-between border-l-2 shadow-xl min-h-[140px]"
          style={{ background: "var(--surface)", borderLeftColor: "var(--accent-secondary)", borderRight: "1px solid var(--border)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex justify-between items-center" style={{ color: "var(--text-dim)" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("monthly_savings")}</span>
            <TrendingDown className="w-4 h-4" style={{ color: "var(--accent-secondary)" }} />
          </div>
          <div className="flex flex-col mt-4">
            <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>138 kg CO2</span>
            <span className="text-[10px] font-medium mt-1" style={{ color: "var(--accent)" }}>+14% improvement vs baseline</span>
          </div>
        </div>

        {/* Panel 4: Future Carbon Risk */}
        <div className="rounded-2xl p-5 flex flex-col justify-between border-l-2 shadow-xl min-h-[140px]"
          style={{ background: "var(--surface)", borderLeftColor: "#a855f7", borderRight: "1px solid var(--border)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex justify-between items-center" style={{ color: "var(--text-dim)" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider">{t("future_risk")}</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex flex-col mt-4">
            <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Medium Risk</span>
            <span className="text-[10px] mt-1" style={{ color: "var(--text-dim)" }}>Approaching baseline forecast ceiling</span>
          </div>
        </div>
      </div>

      {/* Minimalistic Chart Grid */}
      <div className="rounded-2xl p-6 flex flex-col gap-4 shadow-xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider border-b pb-2"
          style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
          {t("risk_forecast")}
        </h3>
        <div className="h-[240px] w-full text-[9px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="glowActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="var(--border)" />
              <YAxis stroke="var(--border)" />
              <Tooltip 
                contentStyle={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
                itemStyle={{ color: "var(--accent)" }}
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="var(--accent)" 
                fillOpacity={1} 
                fill="url(#glowActual)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
