import React, { useState, useEffect } from "react";
import "./App.css";
import LanguageSetup from "./components/LanguageSetup";
import Desktop from "./components/Desktop";
import { mockTranslations, mockSystemSettings } from "./mock/mockData";
import { Toaster } from "./components/ui/toaster";

function App() {
  const [systemSettings, setSystemSettings] = useState(mockSystemSettings);
  const [translations, setTranslations] = useState(mockTranslations.it);

  const handleLanguageSelect = (selectedLanguage) => {
    const newSettings = {
      ...systemSettings,
      language: selectedLanguage,
      firstRun: false
    };
    setSystemSettings(newSettings);
    setTranslations(mockTranslations[selectedLanguage]);
  };

  // Se è il primo avvio, mostra la schermata di setup lingua
  if (systemSettings.firstRun) {
    return (
      <>
        <LanguageSetup onLanguageSelect={handleLanguageSelect} />
        <Toaster />
      </>
    );
  }

  // Altrimenti mostra il desktop
  return (
    <>
      <Desktop 
        language={systemSettings.language} 
        translations={translations}
      />
      <Toaster />
    </>
  );
}

export default App;
