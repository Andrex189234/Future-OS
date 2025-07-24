import React from 'react';
import { Button } from './ui/button';

const Taskbar = ({ 
  apps, 
  openWindows, 
  onAppClick, 
  onWindowClick, 
  currentTime, 
  language, 
  translations 
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/40 backdrop-blur-xl border-t border-cyan-500/30 flex items-center justify-between px-4 z-50">
      {/* Start button */}
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          className="h-12 px-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-400/30 hover:to-blue-500/30 text-white border border-cyan-500/30 rounded-xl transition-all duration-300"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center text-sm">
              🚀
            </div>
            <span className="font-semibold">FutureOS</span>
          </div>
        </Button>
      </div>

      {/* App shortcuts */}
      <div className="flex items-center space-x-2">
        {apps.map((app) => (
          <Button
            key={app.id}
            variant="ghost"
            onClick={() => onAppClick(app)}
            className="h-12 w-12 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <span className="text-xl">{app.icon}</span>
          </Button>
        ))}
      </div>

      {/* Open windows */}
      <div className="flex items-center space-x-2">
        {openWindows.map((window) => (
          <Button
            key={window.windowId}
            variant="ghost"
            onClick={() => onWindowClick(window.windowId)}
            className={`h-10 px-3 text-white rounded-lg transition-all duration-300 ${
              window.minimized 
                ? 'bg-cyan-500/20 border border-cyan-500/50' 
                : 'bg-blue-500/30 border border-blue-400/50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm">{window.icon}</span>
              <span className="text-xs max-w-20 truncate">
                {translations[window.name.toLowerCase().replace(' ', '')] || window.name}
              </span>
            </div>
          </Button>
        ))}
      </div>

      {/* System tray */}
      <div className="flex items-center space-x-4">
        <div className="text-white text-sm font-mono bg-black/30 px-3 py-1 rounded-lg border border-cyan-500/30">
          {currentTime.toLocaleTimeString(language)}
        </div>
        <div className="text-white text-sm bg-black/30 px-3 py-1 rounded-lg border border-cyan-500/30">
          {currentTime.toLocaleDateString(language)}
        </div>
      </div>
    </div>
  );
};

export default Taskbar;