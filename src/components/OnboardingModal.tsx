import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Search, Sparkles } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

import { useCarbonStore } from "../stores/carbonStore";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { language, setLanguage, languages } = useLanguage();
  const runSimulation = useCarbonStore((state) => state.runSimulation);
  const setTab = useCarbonStore((state) => state.setTab);

  const [step, setStep] = useState(1);
  const [commute, setCommute] = useState("car_gasoline");
  const [diet, setDiet] = useState("omnivore");
  const [query, setQuery] = useState("");
  const [searchLang, setSearchLang] = useState("");

  if (!isOpen) return null;

  const filteredLangs = languages.filter(
    (l) =>
      l.name.toLowerCase().includes(searchLang.toLowerCase()) ||
      l.native.toLowerCase().includes(searchLang.toLowerCase())
  );

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      localStorage.setItem("onboarding_completed", "true");
      if (query.trim()) {
        runSimulation(query.trim());
        setTab("dashboard");
      }
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboarding_completed", "true");
    onComplete();
  };

  const selectTemplate = (q: string) => {
    setQuery(q);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark blur backdrop overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-md transition-opacity" 
        style={{ background: "rgba(0, 0, 0, 0.65)" }}
        onClick={handleSkip}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative z-10 w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-hidden font-sans text-left flex flex-col gap-5 border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--text-primary)"
        }}
      >
        {/* Glow backdrop inside modal */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-40" style={{ background: "var(--accent)" }} />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-[80px] opacity-40" style={{ background: "var(--accent-secondary)" }} />

        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-3.5 z-10" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <h2 className="text-base font-bold uppercase tracking-wider">
              {step === 1 && "Select Language"}
              {step === 2 && "Configure Preferences"}
              {step === 3 && "Start First Simulation"}
            </h2>
          </div>
          <span className="text-[11px] font-bold tracking-widest text-dim uppercase" style={{ color: "var(--text-dim)" }}>
            Step {step} of 3
          </span>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-[300px] max-h-[450px] overflow-y-auto z-10 py-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 h-full"
              >
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Choose your preferred language for the interface and AI assistant conversation.
                </p>

                {/* Search Language */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                  <Search className="w-3.5 h-3.5" style={{ color: "var(--text-dim)" }} />
                  <input
                    type="text"
                    value={searchLang}
                    onChange={(e) => setSearchLang(e.target.value)}
                    placeholder="Search languages..."
                    className="flex-1 bg-transparent text-xs outline-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>

                {/* Language list */}
                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-1">
                  {filteredLangs.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all border outline-none cursor-pointer"
                      style={{
                        background: language === lang.code ? "var(--accent-glow)" : "var(--bg-secondary)",
                        borderColor: language === lang.code ? "var(--accent-glow-strong)" : "var(--border)"
                      }}
                    >
                      <div className="flex-1">
                        <div className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
                          {lang.native}
                        </div>
                        <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>
                          {lang.name}
                        </div>
                      </div>
                      {language === lang.code && <Check className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5 h-full"
              >
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Customize your default indicators. The AI Carbon Engine will use these to calculate personal baselines.
                </p>

                {/* Commute Mode Selection */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="modal-commute-select" className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Primary Commute Mode
                  </label>
                  <select
                    id="modal-commute-select"
                    value={commute}
                    onChange={(e) => setCommute(e.target.value)}
                    className="rounded-lg p-3 text-xs outline-none transition-all cursor-pointer"
                    style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                  >
                    <option value="car_gasoline">Gasoline Car (Solo)</option>
                    <option value="electric_vehicle">Electric Vehicle (EV)</option>
                    <option value="public_transit">Public Transit (Bus/Train/Metro)</option>
                    <option value="bicycle">Bicycling / Walking</option>
                    <option value="motorcycle">Motorcycle (Petrol)</option>
                    <option value="electric_scooter">Electric Scooter</option>
                  </select>
                </div>

                {/* Diet Type Selection */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="modal-diet-select" className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Dietary Profile
                  </label>
                  <select
                    id="modal-diet-select"
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    className="rounded-lg p-3 text-xs outline-none transition-all cursor-pointer"
                    style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                  >
                    <option value="omnivore">Omnivore (Standard diet)</option>
                    <option value="pescatarian">Pescatarian (Seafood + Veg)</option>
                    <option value="vegetarian">Vegetarian (Dairy included)</option>
                    <option value="vegan">Vegan (Strictly plant-based)</option>
                  </select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 h-full"
              >
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Test the Carbon Shadow AI agents. Ask a what-if question to forecast your emissions.
                </p>

                {/* Query Input */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="onboarding-query-input" className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Your First What-If Query
                  </label>
                  <input
                    id="onboarding-query-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., What if I buy an electric scooter?"
                    className="w-full rounded-lg p-3 text-xs outline-none"
                    style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                  />
                </div>

                {/* Recommendation templates */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
                    Try one of these templates:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => selectTemplate("What if I drive my car from Mysore to Bangalore?")}
                      className="text-[11px] px-3 py-2 rounded-lg text-left transition-colors border"
                      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      "What if I drive my car from Mysore to Bangalore?"
                    </button>
                    <button
                      onClick={() => selectTemplate("What if I buy a refurbished laptop instead of new?")}
                      className="text-[11px] px-3 py-2 rounded-lg text-left transition-colors border"
                      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      "What if I buy a refurbished laptop instead of new?"
                    </button>
                    <button
                      onClick={() => selectTemplate("What if I install rooftop solar panels?")}
                      className="text-[11px] px-3 py-2 rounded-lg text-left transition-colors border"
                      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
                    >
                      "What if I install rooftop solar panels?"
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex justify-between items-center border-t pt-3.5 z-10" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={handleSkip}
            className="text-[11px] uppercase tracking-wider font-semibold hover:underline bg-transparent border-none py-2 px-3"
            style={{ color: "var(--text-dim)" }}
          >
            Skip Onboarding
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-[11px] uppercase tracking-wider font-semibold px-4.5 py-2.5 rounded-lg border hover:opacity-85"
                style={{ background: "transparent", borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="text-[11px] uppercase tracking-wider font-bold py-2.5 px-5 rounded-lg active:scale-95 transition-all flex items-center gap-1 border-none cursor-pointer"
              style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
            >
              <span>{step === 3 ? "Simulate & Finish" : "Next"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
