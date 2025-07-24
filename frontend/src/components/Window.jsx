import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const Window = ({
  window,
  children,
  onClose,
  onMinimize,
  onMaximize,
  onUpdatePosition,
  onUpdateSize,
  onBringToFront,
  language,
  translations
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        onUpdatePosition(Math.max(0, newX), Math.max(0, newY));
      }
      
      if (isResizing) {
        const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y));
        onUpdateSize(newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, onUpdatePosition, onUpdateSize]);

  const handleMouseDown = (e) => {
    onBringToFront();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - window.x,
      y: e.clientY - window.y
    });
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.width,
      height: window.height
    });
  };

  return (
    <Card
      ref={windowRef}
      className="absolute pointer-events-auto bg-black/80 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 rounded-xl overflow-hidden"
      style={{
        left: window.x,
        top: window.y,
        width: window.width,
        height: window.height,
        zIndex: window.zIndex || 1
      }}
      onClick={onBringToFront}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between h-10 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border-b border-cyan-500/30 px-4 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{window.icon}</span>
          <span className="text-white font-medium text-sm">
            {translations[window.name.toLowerCase().replace(' ', '')] || window.name}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="w-6 h-6 p-0 hover:bg-yellow-500/20 text-yellow-400 rounded"
          >
            ‒
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="w-6 h-6 p-0 hover:bg-green-500/20 text-green-400 rounded"
          >
            ⬜
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-6 h-6 p-0 hover:bg-red-500/20 text-red-400 rounded"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Window content */}
      <div className="flex-1 overflow-hidden" style={{ height: window.height - 40 }}>
        {children}
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize bg-cyan-500/20 hover:bg-cyan-500/40 transition-colors"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-cyan-400/60"></div>
      </div>
    </Card>
  );
};

export default Window;