import React, { useState, useEffect } from "react";
import { ArrowUp, Sparkles, ArrowRight, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import { useCarbonStore } from "../stores/carbonStore";
import { useLanguage } from "../contexts/LanguageContext";
import { useWallet } from "../contexts/WalletContext";
import LanguageSelector from "./LanguageSelector";
import ThemeSelector from "./ThemeSelector";
import WalletConnectModal from "./WalletConnectModal";

const PLACEHOLDERS = [
  "What if I drive from Mysore to Bangalore?",
  "What if I buy a refurbished laptop?",
  "What if I switch to solar energy?",
  "What if I order vegetarian meals for a month?",
  "What if I work remotely twice a week?",
];

export const Hero: React.FC = () => {
  const [query, setQuery] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  
  const runSimulation = useCarbonStore((state) => state.runSimulation);
  const setTab = useCarbonStore((state) => state.setTab);
  const { t } = useLanguage();
  const { isConnected, address } = useWallet();

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuery = query.trim() || PLACEHOLDERS[placeholderIdx];
    setTab("dashboard");
    runSimulation(finalQuery);
  };

  const handleCTAClick = () => {
    setTab("dashboard");
  };

  const truncateAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

  return (
    <div className="relative min-h-[100svh] flex flex-col font-sans overflow-hidden select-none"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Glow Backdrop */}
      <div className="glow-backdrop" />

      {/* Floating ambient particles */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <motion.div
          animate={{ x: [0, 30, -30, 0], y: [0, -40, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full blur-[1px]"
          style={{ background: "var(--accent)" }}
        />
        <motion.div
          animate={{ x: [0, -20, 20, 0], y: [0, 30, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full blur-[1.5px]"
          style={{ background: "var(--accent-secondary)" }}
        />
      </div>

      {/* Header Navigation */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-4 border-b"
        style={{ borderColor: "var(--border)" }} role="banner">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab("landing")}>
          <Logo className="w-5 h-5" style={{ color: "var(--accent)" }} />
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-secondary)" }}>
            {t("app_name")}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[11px] font-medium tracking-wider uppercase"
          style={{ color: "var(--text-muted)" }} role="navigation">
          <span className="cursor-pointer transition-colors hover:opacity-100 opacity-60" onClick={() => setTab("timemachine")}>{t("nav_time_machine")}</span>
          <span className="cursor-pointer transition-colors hover:opacity-100 opacity-60" onClick={() => setTab("dashboard")}>{t("nav_features")}</span>
          <span className="cursor-pointer transition-colors hover:opacity-100 opacity-60" onClick={() => setTab("analytics")}>{t("nav_analytics")}</span>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeSelector />
          
          {/* Wallet Connect */}
          <button
            onClick={() => setWalletModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all"
            style={{
              background: isConnected ? "var(--accent-glow)" : "var(--surface)",
              color: isConnected ? "var(--accent)" : "var(--text-muted)",
              border: `1px solid ${isConnected ? "var(--accent-glow-strong)" : "var(--border)"}`,
            }}
            id="hero-wallet-btn"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isConnected ? truncateAddr(address!) : t("connect_wallet")}
            </span>
          </button>

          <button
            onClick={handleCTAClick}
            className="text-[11px] uppercase tracking-wider font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer active:scale-95"
            style={{
              background: "var(--text-primary)",
              color: "var(--bg-primary)",
            }}
          >
            {t("try_free")}
          </button>
        </div>
      </header>

      {/* Hero Content Panel */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto py-12" role="main">
        
        {/* Sparkle Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--accent)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{t("venture_badge")}</span>
        </motion.div>

        {/* Center Headline */}
        <h1 className="font-normal leading-[1.08] tracking-tight text-[44px] min-[400px]:text-[52px] sm:text-7xl lg:text-[80px] flex flex-col max-w-3xl"
          style={{ color: "var(--text-primary)" }}>
          <span>{t("tagline").split(" ").slice(0, -2).join(" ")}</span>
          <span className="mt-1.5" style={{
            background: `linear-gradient(to right, var(--accent), var(--accent-secondary))`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            {t("tagline").split(" ").slice(-2).join(" ")}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg font-medium"
          style={{ color: "var(--text-muted)" }}>
          {t("subtitle")}
        </p>

        {/* Interactive glowing Search Bar */}
        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-xl px-2 relative">
          <div className="relative flex items-center rounded-xl pl-4 pr-1.5 py-1.5 transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}>
            {/* Animate Placeholder text */}
            <div className="absolute left-4 pointer-events-none text-xs sm:text-sm" style={{ color: "var(--text-dim)" }}>
              <AnimatePresence mode="wait">
                {!query && (
                  <motion.span
                    key={placeholderIdx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {PLACEHOLDERS[placeholderIdx]}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs sm:text-sm outline-none py-2.5 z-10"
              style={{ color: "var(--text-primary)" }}
              aria-label="Carbon simulation query"
              id="hero-search-input"
            />
            
            <button
              type="submit"
              className="w-9 h-9 rounded-lg transition-all flex items-center justify-center cursor-pointer z-10 active:scale-95"
              style={{ background: "var(--text-primary)", color: "var(--bg-primary)" }}
              aria-label="Run simulation"
              id="hero-search-submit"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Bottom promo tag */}
        <div className="mt-8 flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
          style={{ color: "var(--text-dim)" }}
          onClick={handleCTAClick}>
          <span>{t("enter_workspace")}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 py-5 border-t text-[10px] text-center uppercase tracking-widest font-bold"
        style={{ borderColor: "var(--border)", color: "var(--text-dim)" }} role="contentinfo">
        Carbon Shadow AI © 2026. All rights reserved.
      </footer>

      {/* Wallet Modal */}
      <WalletConnectModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </div>
  );
};

export default Hero;
