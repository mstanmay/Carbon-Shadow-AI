import Hero from "./components/Hero";
import CarbonDashboard from "./components/CarbonDashboard";
import { useCarbonStore } from "./stores/carbonStore";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { WalletProvider } from "./contexts/WalletContext";
import VoiceAssistant from "./components/VoiceAssistant";
import AIAvatar from "./components/AIAvatar";
import { useState } from "react";

function AppContent() {
  const currentTab = useCarbonStore((state) => state.currentTab);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  return (
    <>
      {currentTab === "landing" ? <Hero /> : <CarbonDashboard voiceEnabled={voiceEnabled} setVoiceEnabled={setVoiceEnabled} />}
      
      {/* Floating global components */}
      <VoiceAssistant isVisible={voiceEnabled && currentTab !== "landing"} />
      {currentTab !== "landing" && <AIAvatar />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <WalletProvider>
          <AppContent />
        </WalletProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
