import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ThemeType = 
  | "dark-sustainability" 
  | "light-sustainability" 
  | "forest" 
  | "solar" 
  | "ocean";

export interface ThemeInfo {
  id: ThemeType;
  name: string;
  description: string;
  colors: { primary: string; accent: string; secondary: string };
}

export const THEMES: ThemeInfo[] = [
  {
    id: "dark-sustainability",
    name: "Dark Sustainability",
    description: "Deep black with emerald green accents",
    colors: { primary: "#030205", accent: "#10b981", secondary: "#3b82f6" },
  },
  {
    id: "light-sustainability",
    name: "Light Sustainability",
    description: "Clean white with mint green highlights",
    colors: { primary: "#f8faf9", accent: "#059669", secondary: "#2563eb" },
  },
  {
    id: "forest",
    name: "Forest",
    description: "Natural greens with earth tones",
    colors: { primary: "#0b1a0f", accent: "#22c55e", secondary: "#a3e635" },
  },
  {
    id: "solar",
    name: "Solar",
    description: "Warm amber, orange, and gold",
    colors: { primary: "#1a0f00", accent: "#f59e0b", secondary: "#f97316" },
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Deep blue with cyan and turquoise",
    colors: { primary: "#020617", accent: "#06b6d4", secondary: "#3b82f6" },
  },
];

interface ThemeContextValue {
  theme: ThemeType;
  themeInfo: ThemeInfo;
  themes: ThemeInfo[];
  setTheme: (theme: ThemeType) => void;
  isLightTheme: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "carbon-shadow-theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES.some((t) => t.id === saved)) {
        return saved as ThemeType;
      }
    } catch {}
    return "dark-sustainability";
  });

  const setTheme = useCallback((newTheme: ThemeType) => {
    // Add transition class briefly for smooth switching
    document.documentElement.classList.add("theme-transition");
    setThemeState(newTheme);
    
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 500);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const themeInfo = THEMES.find((t) => t.id === theme) || THEMES[0];
  const isLightTheme = theme === "light-sustainability";

  return (
    <ThemeContext.Provider value={{ theme, themeInfo, themes: THEMES, setTheme, isLightTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
