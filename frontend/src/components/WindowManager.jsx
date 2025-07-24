import React from 'react';
import Window from './Window';
import Terminal from './apps/Terminal';
import Notepad from './apps/Notepad';
import FileManager from './apps/FileManager';
import Settings from './apps/Settings';

const WindowManager = ({
  windows,
  onClose,
  onMinimize,
  onMaximize,
  onUpdatePosition,
  onUpdateSize,
  onBringToFront,
  language,
  translations
}) => {
  const getAppComponent = (componentName) => {
    switch (componentName) {
      case 'Terminal':
        return Terminal;
      case 'Notepad':
        return Notepad;
      case 'FileManager':
        return FileManager;
      case 'Settings':
        return Settings;
      default:
        return () => <div>App not found</div>;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {windows.map((window) => {
        if (window.minimized) return null;
        
        const AppComponent = getAppComponent(window.component);
        
        return (
          <Window
            key={window.windowId}
            window={window}
            onClose={() => onClose(window.windowId)}
            onMinimize={() => onMinimize(window.windowId)}
            onMaximize={() => onMaximize(window.windowId)}
            onUpdatePosition={(x, y) => onUpdatePosition(window.windowId, x, y)}
            onUpdateSize={(width, height) => onUpdateSize(window.windowId, width, height)}
            onBringToFront={() => onBringToFront(window.windowId)}
            language={language}
            translations={translations}
          >
            <AppComponent
              language={language}
              translations={translations}
            />
          </Window>
        );
      })}
    </div>
  );
};

export default WindowManager;