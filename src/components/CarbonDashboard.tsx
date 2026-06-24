import React, { useEffect, useState, useRef } from "react";
import { LogOut, Mic, MicOff, Wallet, User, Lock, Mail, AlertCircle } from "lucide-react";
import { useCarbonStore, type TabType } from "../stores/carbonStore";
import { useLanguage } from "../contexts/LanguageContext";
import { useWallet } from "../contexts/WalletContext";
import Logo from "./Logo";
import AIAssistant from "./AIAssistant";
import TimeMachine from "./TimeMachine";
import AnalyticsView from "./AnalyticsView";
import SettingsView from "./SettingsView";
import TimelineWidget from "./TimelineWidget";
import FutureTwinWidget from "./FutureTwinWidget";
import RegretEngineWidget from "./RegretEngineWidget";
import CopilotCard from "./CopilotCard";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import NotificationCenter from "./NotificationCenter";
import WalletConnectModal from "./WalletConnectModal";
import EcoRewards from "./EcoRewards";
import OnboardingModal from "./OnboardingModal";

interface CarbonDashboardProps {
  voiceEnabled: boolean;
  setVoiceEnabled: (v: boolean) => void;
}

export const CarbonDashboard: React.FC<CarbonDashboardProps> = ({ voiceEnabled, setVoiceEnabled }) => {
  const currentTab = useCarbonStore((state) => state.currentTab);
  const setTab = useCarbonStore((state) => state.setTab);
  const user = useCarbonStore((state) => state.user);
  const logout = useCarbonStore((state) => state.logout);
  const login = useCarbonStore((state) => state.login);
  const register = useCarbonStore((state) => state.register);
  
  const copilotAlerts = useCarbonStore((state) => state.copilotAlerts);
  const fetchDashboardStats = useCarbonStore((state) => state.fetchDashboardStats);
  const fetchCopilotAlerts = useCarbonStore((state) => state.fetchCopilotAlerts);

  const { t } = useLanguage();
  const { isConnected, address } = useWallet();
  
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Authentication Local States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const tabRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
      fetchCopilotAlerts();
      const onboardingCompleted = localStorage.getItem("onboarding_completed");
      if (!onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (isRegister) {
        const success = await register(email, password);
        if (success) {
          await login(email, password);
        } else {
          setAuthError("Registration failed. Please check password requirements.");
        }
      } else {
        const success = await login(email, password);
        if (!success) {
          setAuthError("Incorrect email or password.");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication request failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleTabKeyDown = (e: React.KeyboardEvent, tab: TabType | "rewards") => {
    const tabs: (TabType | "rewards")[] = ["dashboard", "timemachine", "analytics", "rewards", "settings"];
    const index = tabs.indexOf(tab);
    let newIndex = index;
    
    if (e.key === "ArrowRight") {
      newIndex = (index + 1) % tabs.length;
    } else if (e.key === "ArrowLeft") {
      newIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === "Home") {
      newIndex = 0;
    } else if (e.key === "End") {
      newIndex = tabs.length - 1;
    } else {
      return;
    }
    
    e.preventDefault();
    const nextTab = tabs[newIndex];
    setTab(nextTab as TabType);
    setTimeout(() => {
      tabRefs.current[nextTab]?.focus();
    }, 50);
  };

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return renderWorkspaceHome();
      case "timemachine":
        return <TimeMachine />;
      case "analytics":
        return <AnalyticsView />;
      case "settings":
        return <SettingsView />;
      case "rewards":
        return <EcoRewards />;
      default:
        return renderWorkspaceHome();
    }
  };

  const renderWorkspaceHome = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-up">
      {/* Left Column: Conversational AI chat terminal (7 columns) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <AIAssistant />
        
        {/* Proactive Copilot suggestions */}
        <div className="flex flex-col gap-3">
          <span className="text-[11px] uppercase font-bold tracking-widest border-b pb-2"
            style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
            {t("proactive_suggestions")}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {copilotAlerts.map((alert) => (
              <CopilotCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Visual carbon footprint widgets (5 columns) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <TimelineWidget />
        <FutureTwinWidget />
        <RegretEngineWidget />
      </div>
    </div>
  );

  const getTabClass = (_tab: TabType | "rewards") => {
    return "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent";
  };

  const getTabStyle = (tab: TabType | "rewards") => {
    if (currentTab === tab) {
      return {
        color: "var(--accent)",
        background: "var(--surface)",
        border: "1px solid var(--border)",
      };
    }
    return {
      color: "var(--text-dim)",
      background: "transparent",
      border: "1px solid transparent",
    };
  };

  const getViewTitle = () => {
    switch (currentTab) {
      case "dashboard": return t("decision_workspace");
      case "timemachine": return t("carbon_time_warp");
      case "analytics": return t("mission_control");
      case "rewards": return t("eco_rewards_title");
      case "settings": return t("profile_config");
      default: return t("decision_workspace");
    }
  };

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // ── RENDER LOGIN/REGISTER SCREEN ──────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen font-sans flex flex-col items-center justify-center select-none overflow-hidden relative"
        style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
        {/* Glow Effects */}
        <div className="glow-backdrop" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[140px] opacity-25" style={{ background: "var(--accent)" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[140px] opacity-25" style={{ background: "var(--accent-secondary)" }} />

        <div className="relative z-10 w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo className="w-8 h-8" style={{ color: "var(--accent)" }} />
            <h1 className="text-xl font-bold uppercase tracking-widest">{t("app_name")}</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {isRegister ? "Join the sustainability intelligence workspace." : "Sign in to access your sustainability portal."}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            {authError && (
              <div className="rounded-lg p-3 flex items-start gap-2 text-xs"
                style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171" }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5 text-xs text-left">
              <label htmlFor="auth-email-input" className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4" style={{ color: "var(--text-dim)" }} />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg pl-10 pr-4 py-3 outline-none transition-all"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5 text-xs text-left">
              <label htmlFor="auth-password-input" className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4" style={{ color: "var(--text-dim)" }} />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg pl-10 pr-4 py-3 outline-none transition-all"
                  style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                />
              </div>
              {isRegister && (
                <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                  Must contain at least 8 characters and one digit.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full font-bold uppercase tracking-wider py-3.5 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-none text-xs"
              style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
            >
              {authLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>{isRegister ? "Register Account" : "Access Workspace"}</span>
                </>
              )}
            </button>
          </form>

          <div className="flex justify-center items-center text-xs border-t pt-4" style={{ borderColor: "var(--border)" }}>
            <span style={{ color: "var(--text-dim)" }}>
              {isRegister ? "Already have an account?" : "New to the platform?"}
            </span>
            <button
              onClick={() => { setIsRegister(!isRegister); setAuthError(""); }}
              className="ml-1.5 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
              style={{ color: "var(--accent)" }}
            >
              {isRegister ? "Log In" : "Register Now"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RENDER AUTHENTICATED DASHBOARD ────────────────────────
  return (
    <div className="min-h-screen font-sans flex flex-col select-none overflow-x-hidden"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <a href="#main-dashboard-content" className="skip-link">
        {t("skip_navigation") || "Skip to dashboard content"}
      </a>

      {/* Glow Backdrop */}
      <div className="glow-backdrop" />

      {/* Top Workspace Navigation Bar */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3 border-b shrink-0 backdrop-blur-md"
        style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg-primary) 80%, transparent)" }}>
        
        {/* Left: Logo */}
        <button className="flex items-center gap-2 cursor-pointer shrink-0 border-none bg-transparent" onClick={() => setTab("landing")} aria-label="Go to landing page">
          <Logo className="w-5 h-5" style={{ color: "var(--accent)" }} />
          <span className="text-sm font-semibold tracking-tight hidden sm:inline" style={{ color: "var(--text-secondary)" }}>
            {t("app_name")}
          </span>
        </button>

        {/* Center: Workspace Tabs */}
        <div 
          className="flex items-center gap-1.5 overflow-x-auto px-2" 
          role="tablist" 
          aria-label="Workspace Navigation"
        >
          <button 
            ref={(el) => { tabRefs.current["dashboard"] = el; }}
            role="tab"
            aria-selected={currentTab === "dashboard"}
            aria-controls="dashboard-tabpanel"
            id="tab-dashboard"
            tabIndex={currentTab === "dashboard" ? 0 : -1}
            className={getTabClass("dashboard")} 
            style={getTabStyle("dashboard")} 
            onClick={() => setTab("dashboard")}
            onKeyDown={(e) => handleTabKeyDown(e, "dashboard")}
          >
            {t("nav_workspace")}
          </button>
          
          <button 
            ref={(el) => { tabRefs.current["timemachine"] = el; }}
            role="tab"
            aria-selected={currentTab === "timemachine"}
            aria-controls="timemachine-tabpanel"
            id="tab-timemachine"
            tabIndex={currentTab === "timemachine" ? 0 : -1}
            className={getTabClass("timemachine")} 
            style={getTabStyle("timemachine")} 
            onClick={() => setTab("timemachine")}
            onKeyDown={(e) => handleTabKeyDown(e, "timemachine")}
          >
            <span className="hidden sm:inline">{t("nav_time_machine")}</span>
            <span className="sm:hidden">Time</span>
          </button>

          <button 
            ref={(el) => { tabRefs.current["analytics"] = el; }}
            role="tab"
            aria-selected={currentTab === "analytics"}
            aria-controls="analytics-tabpanel"
            id="tab-analytics"
            tabIndex={currentTab === "analytics" ? 0 : -1}
            className={getTabClass("analytics")} 
            style={getTabStyle("analytics")} 
            onClick={() => setTab("analytics")}
            onKeyDown={(e) => handleTabKeyDown(e, "analytics")}
          >
            <span className="hidden sm:inline">{t("nav_control_panel")}</span>
            <span className="sm:hidden">Control</span>
          </button>

          <button 
            ref={(el) => { tabRefs.current["rewards"] = el; }}
            role="tab"
            aria-selected={currentTab === "rewards"}
            aria-controls="rewards-tabpanel"
            id="tab-rewards"
            tabIndex={currentTab === "rewards" ? 0 : -1}
            className={getTabClass("rewards")} 
            style={getTabStyle("rewards" as TabType)} 
            onClick={() => setTab("rewards" as TabType)}
            onKeyDown={(e) => handleTabKeyDown(e, "rewards")}
          >
            <span className="hidden sm:inline">{t("nav_rewards")}</span>
            <span className="sm:hidden">Rewards</span>
          </button>

          <button 
            ref={(el) => { tabRefs.current["settings"] = el; }}
            role="tab"
            aria-selected={currentTab === "settings"}
            aria-controls="settings-tabpanel"
            id="tab-settings"
            tabIndex={currentTab === "settings" ? 0 : -1}
            className={getTabClass("settings")} 
            style={getTabStyle("settings")} 
            onClick={() => setTab("settings")}
            onKeyDown={(e) => handleTabKeyDown(e, "settings")}
          >
            <span className="hidden sm:inline">{t("nav_settings")}</span>
            <span className="sm:hidden">⚙️</span>
          </button>
        </div>

        {/* Right: Controls Bar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Theme Selector */}
          <ThemeSelector />

          {/* Voice Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all border-none cursor-pointer"
            style={{
              background: voiceEnabled ? "var(--accent-glow)" : "var(--surface)",
              color: voiceEnabled ? "var(--accent)" : "var(--text-dim)",
              border: `1px solid ${voiceEnabled ? "var(--accent-glow-strong)" : "var(--border)"}`,
            }}
            aria-label="Toggle voice assistant"
            id="voice-toggle-btn"
          >
            {voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>

          {/* Wallet Connect */}
          <button
            onClick={() => setWalletModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all border-none cursor-pointer"
            style={{
              background: isConnected ? "var(--accent-glow)" : "var(--surface)",
              color: isConnected ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${isConnected ? "var(--accent-glow-strong)" : "var(--border)"}`,
            }}
            aria-label="Connect wallet"
            id="wallet-connect-btn"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isConnected ? truncateAddress(address!) : t("connect_wallet")}
            </span>
          </button>

          {/* Notification Center */}
          <NotificationCenter />

          {/* User Profile */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <User className="w-3.5 h-3.5" style={{ color: "var(--text-dim)" }} />
            <span className="text-[11px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
              {user?.email?.split("@")[0] || "judge"}
            </span>
          </div>

          {/* Logout */}
          <button 
            onClick={logout}
            className="p-1.5 transition-colors rounded-lg bg-transparent border-none cursor-pointer"
            style={{ color: "var(--text-dim)" }}
            aria-label={t("logout")}
            id="logout-btn"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame Body */}
      <main id="main-dashboard-content" className="flex-1 relative z-10 p-4 sm:p-8 lg:p-10 flex flex-col gap-6 overflow-y-auto max-w-7xl mx-auto w-full" role="main">
        {/* View title banner */}
        <div className="flex justify-between items-center border-b pb-3 shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col text-left gap-1">
            <h1 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
              {getViewTitle()}
            </h1>
          </div>
          <div className="text-[11px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full"
            style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent-glow-strong)" }}>
            {t("status_ready")}
          </div>
        </div>

        {/* View body */}
        <div 
          id={`${currentTab}-tabpanel`}
          role="tabpanel"
          aria-labelledby={`tab-${currentTab}`}
          className="flex-1 min-h-0"
        >
          {renderContent()}
        </div>
      </main>

      {/* Onboarding Flow Wizard Modal */}
      <OnboardingModal isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />

      {/* Wallet Connect Modal */}
      <WalletConnectModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </div>
  );
};

export default CarbonDashboard;
