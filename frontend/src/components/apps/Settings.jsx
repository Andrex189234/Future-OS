import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { mockTranslations } from '../../mock/mockData';
import { useToast } from '../../hooks/use-toast';

const Settings = ({ language, translations }) => {
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const { toast } = useToast();

  const languages = [
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const themes = [
    { id: 'dark', name: 'Scuro', icon: '🌙' },
    { id: 'light', name: 'Chiaro', icon: '☀️' },
    { id: 'auto', name: 'Automatico', icon: '🌗' }
  ];

  const handleSaveSettings = () => {
    // Simulazione salvataggio impostazioni
    toast({
      title: "Impostazioni salvate",
      description: "Le tue preferenze sono state salvate con successo",
    });
  };

  const handleResetSettings = () => {
    const confirm = window.confirm('Ripristinare le impostazioni predefinite?');
    if (confirm) {
      setCurrentLanguage('it');
      setTheme('dark');
      setNotifications(true);
      setAutoSave(true);
      setAnimationsEnabled(true);
      
      toast({
        title: "Impostazioni ripristinate",
        description: "Le impostazioni sono state ripristinate ai valori predefiniti",
      });
    }
  };

  return (
    <div className="h-full bg-gray-900/95 text-white overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center text-2xl">
            ⚙️
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            Impostazioni FutureOS
          </h1>
          <p className="text-gray-400 mt-2">Personalizza la tua esperienza</p>
        </div>

        {/* Language Settings */}
        <Card className="bg-black/30 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <span>🌐</span>
              <span>Lingua e Localizzazione</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lingua dell'interfaccia
              </label>
              <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {languages.map((lang) => (
                    <SelectItem 
                      key={lang.code} 
                      value={lang.code}
                      className="text-white hover:bg-gray-700"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-black/30 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <span>🎨</span>
              <span>Aspetto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tema
              </label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {themes.map((themeOption) => (
                    <SelectItem 
                      key={themeOption.id} 
                      value={themeOption.id}
                      className="text-white hover:bg-gray-700"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{themeOption.icon}</span>
                        <span>{themeOption.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Animazioni
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Abilita animazioni e transizioni
                </p>
              </div>
              <Switch
                checked={animationsEnabled}
                onCheckedChange={setAnimationsEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="bg-black/30 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <span>🔧</span>
              <span>Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Notifiche
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Mostra notifiche di sistema
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Salvataggio automatico
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Salva automaticamente i file modificati
                </p>
              </div>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="bg-black/30 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <span>ℹ️</span>
              <span>Informazioni Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Sistema Operativo:</span>
              <span className="text-white">FutureOS 1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Versione Kernel:</span>
              <span className="text-white">5.4.0-future</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Architettura:</span>
              <span className="text-white">x86_64</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Memoria RAM:</span>
              <span className="text-white">8 GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Spazio disco:</span>
              <span className="text-white">256 GB SSD</span>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex space-x-4">
          <Button 
            onClick={handleSaveSettings}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white"
          >
            💾 Salva Impostazioni
          </Button>
          <Button 
            onClick={handleResetSettings}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            🔄 Ripristina
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;