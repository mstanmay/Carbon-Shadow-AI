import React, { useState } from "react";
import { User, Shield, CheckCircle2 } from "lucide-react";
import { useCarbonStore } from "../stores/carbonStore";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";

export const SettingsView: React.FC = () => {
  const user = useCarbonStore((state) => state.user);
  const { theme, setTheme, themes } = useTheme();
  const { t, language, setLanguage, languages } = useLanguage();
  
  // Local state for profile configs
  const [commute, setCommute] = useState("car_gasoline");
  const [diet, setDiet] = useState("omnivore");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const auditLogs = [
    { action: "USER_LOGIN_SUCCESS", timestamp: "2026-06-16 22:05:16", ip: "127.0.0.1" },
    { action: "SIMULATION_EXECUTED", timestamp: "2026-06-16 22:12:44", ip: "127.0.0.1" },
    { action: "DECISION_COMMITTED", timestamp: "2026-06-16 22:15:30", ip: "127.0.0.1" },
    { action: "TIME_WARP_SIMULATION", timestamp: "2026-06-16 22:30:12", ip: "127.0.0.1" }
  ];

  return (
    <div className="flex flex-col gap-6 font-sans select-none text-left animate-fade-up">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{t("profile_preferences")}</h2>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {t("profile_desc")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Preference Form */}
        <div className="rounded-2xl p-5 flex flex-col gap-4 shadow-xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider border-b pb-2.5 flex items-center gap-1.5"
            style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
            <User className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <span>{t("sustainability_prefs")}</span>
          </h3>

          <form onSubmit={handleSave} className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Commute Mode */}
              <div className="flex flex-col gap-1.5">
                <label className="font-medium" style={{ color: "var(--text-muted)" }}>{t("commute_mode")}</label>
                <select
                  value={commute}
                  onChange={(e) => setCommute(e.target.value)}
                  className="rounded-lg p-2.5 outline-none transition-all"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                >
                  <option value="car_gasoline">Gasoline Car (Default)</option>
                  <option value="electric_vehicle">Electric Vehicle (EV)</option>
                  <option value="public_transit">Public Transit (Bus/Train)</option>
                  <option value="bicycle">Bicycling/Walking</option>
                </select>
              </div>

              {/* Diet Profile */}
              <div className="flex flex-col gap-1.5">
                <label className="font-medium" style={{ color: "var(--text-muted)" }}>{t("diet_profile")}</label>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="rounded-lg p-2.5 outline-none transition-all"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                >
                  <option value="omnivore">Omnivore (Standard)</option>
                  <option value="pescatarian">Pescatarian</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan (Plant-Based)</option>
                </select>
              </div>

              {/* App Theme */}
              <div className="flex flex-col gap-1.5">
                <label className="font-medium" style={{ color: "var(--text-muted)" }}>{t("app_theme")}</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="rounded-lg p-2.5 outline-none transition-all"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                >
                  {themes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* App Language */}
              <div className="flex flex-col gap-1.5">
                <label className="font-medium" style={{ color: "var(--text-muted)" }}>{t("language")}</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="rounded-lg p-2.5 outline-none transition-all"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code}>{l.nativeName} ({l.name})</option>
                  ))}
                </select>
              </div>

              {/* User Email */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="font-medium" style={{ color: "var(--text-muted)" }}>{t("account_email")}</label>
                <input
                  type="email"
                  value={user?.email || "demo@carbonshadow.ai"}
                  disabled
                  className="rounded-lg p-2.5 outline-none cursor-not-allowed opacity-70"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-dim)", border: "1px solid var(--border)" }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="font-semibold py-2.5 px-6 rounded-lg active:scale-95 transition-all self-end flex items-center gap-1.5 cursor-pointer mt-2"
              style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t("preferences_saved")}</span>
                </>
              ) : (
                <span>{t("save_changes")}</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Security logs */}
        <div className="rounded-2xl p-5 flex flex-col gap-4 shadow-xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider border-b pb-2.5 flex items-center gap-1.5"
            style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
            <Shield className="w-4 h-4" style={{ color: "var(--accent-secondary)" }} />
            <span>{t("security_audit")}</span>
          </h3>

          <div className="flex flex-col gap-3">
            <div className="text-[10px]" style={{ color: "var(--text-dim)" }}>
              {t("recent_logs")}
            </div>
            
            <div className="flex flex-col gap-2">
              {auditLogs.map((log, index) => (
                <div key={index} className="rounded-lg p-2.5 flex flex-col gap-1"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="font-bold" style={{ color: "var(--text-primary)" }}>{log.action}</span>
                    <span style={{ color: "var(--text-dim)" }}>{log.ip}</span>
                  </div>
                  <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
