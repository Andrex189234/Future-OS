import React, { useState, useEffect } from 'react';
import WindowManager from './WindowManager';
import Taskbar from './Taskbar';
import { mockSystemSettings, mockApps } from '../mock/mockData';

const Desktop = ({ language, translations }) => {
  const [openWindows, setOpenWindows] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [wallpaper] = useState(mockSystemSettings.wallpaper);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const openApp = (app) => {
    const existingWindow = openWindows.find(w => w.id === app.id);
    if (existingWindow) {
      setOpenWindows(openWindows.map(w => 
        w.id === app.id ? { ...w, minimized: false, zIndex: Math.max(...openWindows.map(win => win.zIndex)) + 1 } : w
      ));
    } else {
      const newWindow = {
        ...app,
        windowId: `${app.id}-${Date.now()}`,
        minimized: false,
        maximized: false,
        x: Math.random() * 200 + 100,
        y: Math.random() * 100 + 100,
        width: 800,
        height: 600,
        zIndex: Math.max(...openWindows.map(w => w.zIndex || 0), 0) + 1
      };
      setOpenWindows([...openWindows, newWindow]);
    }
  };

  const closeWindow = (windowId) => {
    setOpenWindows(openWindows.filter(w => w.windowId !== windowId));
  };

  const minimizeWindow = (windowId) => {
    setOpenWindows(openWindows.map(w => 
      w.windowId === windowId ? { ...w, minimized: true } : w
    ));
  };

  const maximizeWindow = (windowId) => {
    setOpenWindows(openWindows.map(w => 
      w.windowId === windowId ? { 
        ...w, 
        maximized: !w.maximized,
        x: w.maximized ? w.originalX || w.x : 0,
        y: w.maximized ? w.originalY || w.y : 0,
        width: w.maximized ? w.originalWidth || w.width : window.innerWidth,
        height: w.maximized ? w.originalHeight || w.height : window.innerHeight - 60,
        originalX: w.maximized ? w.originalX : w.x,
        originalY: w.maximized ? w.originalY : w.y,
        originalWidth: w.maximized ? w.originalWidth : w.width,
        originalHeight: w.maximized ? w.originalHeight : w.height
      } : w
    ));
  };

  const updateWindowPosition = (windowId, x, y) => {
    setOpenWindows(openWindows.map(w => 
      w.windowId === windowId ? { ...w, x, y } : w
    ));
  };

  const updateWindowSize = (windowId, width, height) => {
    setOpenWindows(openWindows.map(w => 
      w.windowId === windowId ? { ...w, width, height } : w
    ));
  };

  const bringToFront = (windowId) => {
    const maxZ = Math.max(...openWindows.map(w => w.zIndex || 0));
    setOpenWindows(openWindows.map(w => 
      w.windowId === windowId ? { ...w, zIndex: maxZ + 1 } : w
    ));
  };

  // Desktop icons
  const desktopIcons = mockApps.slice(0, 4);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay per migliorare la leggibilità */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
      
      {/* Desktop icons */}
      <div className="absolute top-8 left-8 space-y-6 z-10">
        {desktopIcons.map((app) => (
          <div
            key={app.id}
            onDoubleClick={() => openApp(app)}
            className="flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform duration-200"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
              {app.icon}
            </div>
            <span className="text-white text-sm font-medium mt-2 drop-shadow-lg">
              {translations[app.name.toLowerCase().replace(' ', '')] || app.name}
            </span>
          </div>
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Window Manager */}
      <WindowManager
        windows={openWindows}
        onClose={closeWindow}
        onMinimize={minimizeWindow}
        onMaximize={maximizeWindow}
        onUpdatePosition={updateWindowPosition}
        onUpdateSize={updateWindowSize}
        onBringToFront={bringToFront}
        language={language}
        translations={translations}
      />

      {/* Taskbar */}
      <Taskbar
        apps={mockApps}
        openWindows={openWindows}
        onAppClick={openApp}
        onWindowClick={(windowId) => {
          const window = openWindows.find(w => w.windowId === windowId);
          if (window.minimized) {
            setOpenWindows(openWindows.map(w => 
              w.windowId === windowId ? { ...w, minimized: false } : w
            ));
          }
          bringToFront(windowId);
        }}
        currentTime={currentTime}
        language={language}
        translations={translations}
      />
    </div>
  );
};

export default Desktop;