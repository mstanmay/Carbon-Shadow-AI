import React, { useEffect, useState } from "react";
import { LogOut, Mic, MicOff, Wallet, User } from "lucide-react";
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
  
  const copilotAlerts = useCarbonStore((state) => state.copilotAlerts);
  const fetchDashboardStats = useCarbonStore((state) => state.fetchDashboardStats);
  const fetchCopilotAlerts = useCarbonStore((state) => state.fetchCopilotAlerts);

  const { t } = useLanguage();
  const { isConnected, address } = useWallet();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      login("judge@hackathon.com", "password123");
    } else {
      fetchDashboardStats();
      fetchCopilotAlerts();
    }
  }, [user]);

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
          <span className="text-[10px] uppercase font-bold tracking-widest border-b pb-2"
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

  const getTabClass = (tab: TabType | "rewards") => {
    const base = "px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ";
    if (currentTab === tab) {
      return base;
    }
    return base;
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

  return (
    <div className="min-h-screen font-sans flex flex-col select-none overflow-x-hidden"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Glow Backdrop */}
      <div className="glow-backdrop" />

      {/* Top Workspace Navigation Bar */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-3 border-b shrink-0 backdrop-blur-md"
        style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg-primary) 80%, transparent)" }}>
        
        {/* Left: Logo */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => setTab("landing")}>
          <Logo className="w-5 h-5" style={{ color: "var(--accent)" }} />
          <span className="text-sm font-semibold tracking-tight hidden sm:inline" style={{ color: "var(--text-secondary)" }}>
            {t("app_name")}
          </span>
        </div>

        {/* Center: Workspace Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto px-2" role="navigation" aria-label="Main navigation">
          <div className={getTabClass("dashboard")} style={getTabStyle("dashboard")} onClick={() => setTab("dashboard")}>
            {t("nav_workspace")}
          </div>
          <div className={getTabClass("timemachine")} style={getTabStyle("timemachine")} onClick={() => setTab("timemachine")}>
            <span className="hidden sm:inline">{t("nav_time_machine")}</span>
            <span className="sm:hidden">Time</span>
          </div>
          <div className={getTabClass("analytics")} style={getTabStyle("analytics")} onClick={() => setTab("analytics")}>
            <span className="hidden sm:inline">{t("nav_control_panel")}</span>
            <span className="sm:hidden">Control</span>
          </div>
          <div className={getTabClass("rewards")} style={getTabStyle("rewards" as TabType)} onClick={() => setTab("rewards" as TabType)}>
            <span className="hidden sm:inline">{t("nav_rewards")}</span>
            <span className="sm:hidden">Rewards</span>
          </div>
          <div className={getTabClass("settings")} style={getTabStyle("settings")} onClick={() => setTab("settings")}>
            <span className="hidden sm:inline">{t("nav_settings")}</span>
            <span className="sm:hidden">⚙️</span>
          </div>
        </nav>

        {/* Right: Controls Bar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Selector */}
          <LanguageSelector />
          
          {/* Theme Selector */}
          <ThemeSelector />

          {/* Voice Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all"
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
            <span className="text-[10px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
              {user?.email?.split("@")[0] || "judge"}
            </span>
          </div>

          {/* Logout */}
          <button 
            onClick={logout}
            className="p-1.5 transition-colors rounded-lg"
            style={{ color: "var(--text-dim)" }}
            aria-label={t("logout")}
            id="logout-btn"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame Body */}
      <main className="flex-1 relative z-10 p-4 sm:p-8 lg:p-10 flex flex-col gap-6 overflow-y-auto max-w-7xl mx-auto w-full" role="main">
        {/* View title banner */}
        <div className="flex justify-between items-center border-b pb-3 shrink-0" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col text-left gap-1">
            <h1 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--text-primary)" }}>
              {getViewTitle()}
            </h1>
          </div>
          <div className="text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full"
            style={{ background: "var(--accent-glow)", color: "var(--accent)", border: "1px solid var(--accent-glow-strong)" }}>
            {t("status_ready")}
          </div>
        </div>

        {/* View body */}
        <div className="flex-1 min-h-0">
          {renderContent()}
        </div>
      </main>

      {/* Wallet Connect Modal */}
      <WalletConnectModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </div>
  );
};

export default CarbonDashboard;
