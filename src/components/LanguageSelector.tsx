import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, Search } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages.find(l => l.code === language) || languages[0];
  const filteredLangs = languages.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.native.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all"
        style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
        aria-label="Language selector"
        id="language-selector-btn"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{currentLang.native}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-64 rounded-xl overflow-hidden shadow-xl z-50"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--text-dim)" }}>
                Select Language
              </span>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <Search className="w-3 h-3" style={{ color: "var(--text-dim)" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search languages..."
                  className="flex-1 bg-transparent text-[11px] outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            </div>

            {/* Language list */}
            <div className="p-2 max-h-[280px] overflow-y-auto flex flex-col gap-0.5">
              {filteredLangs.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setIsOpen(false); setSearch(""); }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all w-full"
                  style={{
                    background: language === lang.code ? "var(--accent-glow)" : "transparent",
                    border: language === lang.code ? "1px solid var(--accent-glow-strong)" : "1px solid transparent",
                  }}
                >
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
                      {lang.native}
                    </div>
                    <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>
                      {lang.name} • {lang.script}
                    </div>
                  </div>
                  {language === lang.code && <Check className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
