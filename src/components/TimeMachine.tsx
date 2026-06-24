import React, { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { useCarbonStore } from "../stores/carbonStore";
import { useLanguage } from "../contexts/LanguageContext";

export const TimeMachine: React.FC = () => {
  const [query, setQuery] = useState("");
  const runTimeMachine = useCarbonStore((state) => state.runTimeMachine);
  const timeMachineData = useCarbonStore((state) => state.timeMachineData);
  const isLoading = useCarbonStore((state) => state.isLoading);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    runTimeMachine(query.trim());
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    runTimeMachine(text);
  };

  return (
    <div className="flex flex-col gap-6 font-sans select-none animate-fade-up">
      {/* Intro Description */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{t("time_machine_title")}</h2>
        <p className="text-xs leading-relaxed max-w-xl" style={{ color: "var(--text-muted)" }}>
          {t("time_machine_desc")}
        </p>
      </div>

      {/* Simulator Search bar */}
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
        <div className="flex-1 flex items-center gap-2.5 rounded-xl pl-4 pr-1.5 py-1.5 transition-all"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Search className="w-4 h-4" style={{ color: "var(--text-dim)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="flex-1 bg-transparent text-xs outline-none py-1.5"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="font-semibold text-xs px-5 py-2.5 rounded-xl active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center"
          style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
        >
          {isLoading ? t("simulating") : t("run_time_warp")}
        </button>
      </form>

      {/* Suggestions shortcuts */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        <span className="self-center" style={{ color: "var(--text-dim)" }}>{t("try_simulating")}</span>
        {["What if I buy an electric scooter?", "What if I install solar panels?", "What if I switch to public transport?"].map(sug => (
          <button
            key={sug}
            onClick={() => handleSuggestionClick(sug)}
            className="px-2.5 py-1 rounded-full transition-all"
            style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            "{sug}"
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="rounded-2xl p-10 flex flex-col items-center justify-center gap-3 shadow-xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)" }} />
          <span className="text-xs italic" style={{ color: "var(--text-dim)" }}>{t("simulating")}</span>
        </div>
      )}

      {/* Results timeline display */}
      {timeMachineData && !isLoading && (
        <div className="flex flex-col gap-6 animate-fade-up">
          {/* Projections Dashboard Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl p-4 flex flex-col justify-between border-l-2 shadow-xl"
              style={{ background: "var(--surface)", borderLeftColor: "var(--accent)", borderRight: "1px solid var(--border)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>{t("projected_savings")}</span>
              <span className="text-2xl font-bold mt-2" style={{ color: "var(--accent)" }}>
                -{timeMachineData.overall_savings.toFixed(1)} kg <span className="text-xs" style={{ color: "var(--text-muted)" }}>CO2/yr</span>
              </span>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-dim)" }}>Offsetting typical electricity share</p>
            </div>

            <div className="rounded-xl p-4 flex flex-col justify-between border-l-2 shadow-xl"
              style={{ background: "var(--surface)", borderLeftColor: "#a855f7", borderRight: "1px solid var(--border)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>{t("annual_regret")}</span>
              <span className="text-2xl font-bold mt-2 text-purple-400">
                {timeMachineData.overall_regret.toFixed(1)} kg <span className="text-xs" style={{ color: "var(--text-muted)" }}>CO2/yr</span>
              </span>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-dim)" }}>If decision is repeated 100 times</p>
            </div>

            <div className="rounded-xl p-4 flex flex-col justify-between border-l-2 shadow-xl"
              style={{ background: "var(--surface)", borderLeftColor: "var(--accent-secondary)", borderRight: "1px solid var(--border)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>{t("carbon_score_impact")}</span>
              <span className="text-2xl font-bold mt-2" style={{ color: "var(--accent-secondary)" }}>
                +{timeMachineData.score_delta} <span className="text-xs" style={{ color: "var(--text-muted)" }}>points</span>
              </span>
              <p className="text-[10px] mt-1" style={{ color: "var(--text-dim)" }}>Improves profile risk category</p>
            </div>
          </div>

          {/* Visual Timeline Section */}
          <div className="rounded-2xl p-6 flex flex-col gap-6 shadow-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider border-b pb-2.5"
              style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
              1-Year Simulation Path: "{timeMachineData.query}"
            </h3>

            {/* Steps Flowchart */}
            <div className="relative pl-6 flex flex-col gap-6" style={{ borderLeft: "1px solid var(--border)" }}>
              {timeMachineData.timeline.map((step, idx) => (
                <div key={idx} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Timeline dot */}
                  <div className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full ring-4"
                    style={{ background: "var(--accent)", border: "1px solid var(--accent-glow-strong)" }} />

                  {/* Left content description */}
                  <div className="flex flex-col gap-1 max-w-md">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{step.label}</span>
                    <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: "var(--accent)" }}>
                      <Sparkles className="w-3 h-3" />
                      <span>{step.impact}</span>
                    </span>
                    <div className="text-[10px] leading-relaxed mt-1" style={{ color: "var(--text-dim)" }}>
                      Emissions: Current Path <span className="text-red-400 font-medium">{step.current_path_value} kg</span> vs Alternative Path <span style={{ color: "var(--accent)" }} className="font-medium">{step.alternative_path_value} kg</span>
                    </div>
                  </div>

                  {/* Right metrics metrics */}
                  <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-medium uppercase" style={{ color: "var(--text-dim)" }}>SAVED</span>
                      <span className="text-xs font-bold" style={{ color: "var(--accent)" }}>-{step.savings.toFixed(1)} kg</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-medium uppercase" style={{ color: "var(--text-dim)" }}>100X REGRET</span>
                      <span className="text-xs font-bold text-purple-400">{(step.regret * 10).toFixed(0)} kg</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-medium uppercase" style={{ color: "var(--text-dim)" }}>{t("carbon_score_impact")}</span>
                      <span className="text-xs font-bold" style={{ color: "var(--accent-secondary)" }}>+{step.score_change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeMachine;
