import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';

const Notepad = ({ language, translations }) => {
  const [content, setContent] = useState('');
  const [filename, setFilename] = useState('');
  const [isModified, setIsModified] = useState(false);
  const [savedFiles, setSavedFiles] = useState([
    { name: 'welcome.txt', content: 'Benvenuto in FutureOS!\n\nQuesto è un file di esempio.' },
    { name: 'notes.txt', content: 'Le mie note:\n\n- FutureOS è fantastico\n- Il notepad funziona perfettamente' }
  ]);
  const textareaRef = useRef(null);
  const { toast } = useToast();

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setIsModified(true);
  };

  const handleSave = () => {
    if (!filename.trim()) {
      toast({
        title: "Errore",
        description: "Specificare un nome per il file",
        variant: "destructive"
      });
      return;
    }

    const fileToSave = {
      name: filename.endsWith('.txt') ? filename : `${filename}.txt`,
      content: content,
      lastModified: new Date().toISOString()
    };

    setSavedFiles(prev => {
      const existingIndex = prev.findIndex(f => f.name === fileToSave.name);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = fileToSave;
        return updated;
      }
      return [...prev, fileToSave];
    });

    setIsModified(false);
    toast({
      title: "File salvato",
      description: `${fileToSave.name} è stato salvato con successo`,
    });
  };

  const handleOpen = (file) => {
    if (isModified) {
      const confirm = window.confirm('Il file corrente non è salvato. Continuare?');
      if (!confirm) return;
    }

    setContent(file.content);
    setFilename(file.name.replace('.txt', ''));
    setIsModified(false);
  };

  const handleNew = () => {
    if (isModified) {
      const confirm = window.confirm('Il file corrente non è salvato. Continuare?');
      if (!confirm) return;
    }

    setContent('');
    setFilename('');
    setIsModified(false);
  };

  const getWordCount = () => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  const getCharCount = () => {
    return content.length;
  };

  return (
    <div className="h-full bg-gray-900/95 text-white flex flex-col">
      {/* Menu bar */}
      <div className="flex items-center justify-between p-2 bg-black/50 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleNew}
            className="text-white hover:bg-gray-700"
          >
            📄 Nuovo
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleSave}
            className="text-white hover:bg-gray-700"
          >
            💾 Salva
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Nome file..."
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-40 bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar con file salvati */}
        <div className="w-48 bg-black/30 border-r border-gray-700 p-2">
          <h3 className="text-sm font-semibold mb-2 text-gray-300">File salvati</h3>
          <div className="space-y-1">
            {savedFiles.map((file, index) => (
              <button
                key={index}
                onClick={() => handleOpen(file)}
                className="w-full text-left p-2 rounded text-sm hover:bg-gray-700/50 transition-colors text-gray-300 hover:text-white truncate"
              >
                📄 {file.name}
              </button>
            ))}
          </div>
        </div>

        {/* Editor principale */}
        <div className="flex-1 flex flex-col">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            placeholder="Inizia a scrivere..."
            className="flex-1 resize-none bg-gray-900/50 border-none text-white text-base leading-relaxed p-4 focus:ring-0 focus:border-none"
            style={{ minHeight: 'calc(100% - 40px)' }}
          />
          
          {/* Status bar */}
          <div className="h-8 bg-black/50 border-t border-gray-700 flex items-center justify-between px-4 text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Caratteri: {getCharCount()}</span>
              <span>Parole: {getWordCount()}</span>
              {isModified && <span className="text-yellow-400">● Non salvato</span>}
            </div>
            <div>
              {filename && <span>File: {filename}.txt</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notepad;