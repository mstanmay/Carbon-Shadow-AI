import React, { createContext, useContext, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "../i18n";

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
  languages: typeof SUPPORTED_LANGUAGES;
  isRTL: boolean;
  currentLanguageInfo: typeof SUPPORTED_LANGUAGES[number];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();

  const language = (i18n.language?.split("-")[0] || "en") as LanguageCode;

  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];
  const isRTL = "rtl" in currentLanguageInfo && currentLanguageInfo.rtl === true;

  const setLanguage = useCallback((lang: LanguageCode) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("carbon-shadow-language", lang);
  }, [i18n]);

  // Set document direction for RTL languages (Urdu)
  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [isRTL, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES, isRTL, currentLanguageInfo }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
