import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check } from "lucide-react";
import { useTheme, THEMES } from "../contexts/ThemeContext";

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all"
        style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
        aria-label="Theme selector"
        id="theme-selector-btn"
      >
        <Palette className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Theme</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden shadow-xl z-50"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
                Select Theme
              </span>
            </div>
            <div className="p-2 flex flex-col gap-1">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setIsOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all w-full"
                  style={{
                    background: theme === t.id ? "var(--accent-glow)" : "transparent",
                    border: theme === t.id ? "1px solid var(--accent-glow-strong)" : "1px solid transparent",
                  }}
                >
                  <div className="flex gap-1">
                    {Object.values(t.colors).map((c, i) => (
                      <div key={i} className="w-3.5 h-3.5 rounded-full ring-1 ring-white/10" style={{ background: c }} />
                    ))}
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>{t.name}</div>
                    <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>{t.description}</div>
                  </div>
                  {theme === t.id && <Check className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
