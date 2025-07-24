import React, { useState, useRef, useEffect } from 'react';
import { mockFileSystem, mockTerminalHistory } from '../../mock/mockData';

const Terminal = ({ language, translations }) => {
  const [history, setHistory] = useState([...mockTerminalHistory]);
  const [currentDirectory, setCurrentDirectory] = useState('/home/user');
  const [input, setInput] = useState('');
  const [fileSystem] = useState(mockFileSystem);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const navigateToPath = (path) => {
    const parts = path.split('/').filter(p => p);
    let current = fileSystem['/'];
    let fullPath = '';

    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
        fullPath += '/' + part;
      } else {
        return null;
      }
    }
    return fullPath || '/';
  };

  const getCurrentDirectoryContents = () => {
    const parts = currentDirectory.split('/').filter(p => p);
    let current = fileSystem['/'];

    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return [];
      }
    }

    return current.children ? Object.keys(current.children) : [];
  };

  const executeCommand = (command) => {
    const parts = command.trim().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    let output = '';

    switch (cmd) {
      case 'ls':
        const contents = getCurrentDirectoryContents();
        output = contents.length > 0 ? contents.join('  ') : 'Directory vuota';
        break;

      case 'pwd':
        output = currentDirectory;
        break;

      case 'cd':
        if (args.length === 0) {
          setCurrentDirectory('/home/user');
          output = '';
        } else {
          const targetPath = args[0];
          if (targetPath === '..') {
            const parts = currentDirectory.split('/').filter(p => p);
            if (parts.length > 0) {
              parts.pop();
              const newPath = parts.length > 0 ? '/' + parts.join('/') : '/';
              setCurrentDirectory(newPath);
            }
            output = '';
          } else if (targetPath.startsWith('/')) {
            const newPath = navigateToPath(targetPath);
            if (newPath) {
              setCurrentDirectory(newPath);
              output = '';
            } else {
              output = `cd: ${targetPath}: Directory non trovata`;
            }
          } else {
            const contents = getCurrentDirectoryContents();
            if (contents.includes(targetPath)) {
              const newPath = currentDirectory === '/' ? `/${targetPath}` : `${currentDirectory}/${targetPath}`;
              setCurrentDirectory(newPath);
              output = '';
            } else {
              output = `cd: ${targetPath}: Directory non trovata`;
            }
          }
        }
        break;

      case 'cat':
        if (args.length === 0) {
          output = 'cat: specificare un file';
        } else {
          const filename = args[0];
          const contents = getCurrentDirectoryContents();
          if (contents.includes(filename)) {
            const parts = currentDirectory.split('/').filter(p => p);
            let current = fileSystem['/'];
            for (const part of parts) {
              current = current.children[part];
            }
            const file = current.children[filename];
            if (file && file.type === 'file') {
              output = file.content;
            } else {
              output = `cat: ${filename}: È una directory`;
            }
          } else {
            output = `cat: ${filename}: File non trovato`;
          }
        }
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'help':
        output = `Comandi disponibili:
ls          - Lista file e directory
pwd         - Mostra directory corrente
cd [path]   - Cambia directory
cat [file]  - Mostra contenuto file
clear       - Pulisce il terminale
mkdir [dir] - Crea directory
touch [file]- Crea file vuoto
help        - Mostra questo messaggio`;
        break;

      case 'mkdir':
        if (args.length === 0) {
          output = 'mkdir: specificare il nome della directory';
        } else {
          output = `Directory '${args[0]}' creata (simulazione)`;
        }
        break;

      case 'touch':
        if (args.length === 0) {
          output = 'touch: specificare il nome del file';
        } else {
          output = `File '${args[0]}' creato (simulazione)`;
        }
        break;

      case 'whoami':
        output = 'user';
        break;

      case 'date':
        output = new Date().toString();
        break;

      case 'uname':
        output = 'FutureOS 1.0.0';
        break;

      default:
        output = `${cmd}: comando non trovato. Usa 'help' per vedere i comandi disponibili.`;
    }

    const newEntry = {
      command: command,
      output: output,
      timestamp: new Date().toISOString(),
      directory: currentDirectory
    };

    setHistory(prev => [...prev, newEntry]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput('');
    }
  };

  const getPrompt = () => {
    return `user@futureos:${currentDirectory}$`;
  };

  return (
    <div className="h-full bg-black/90 text-green-400 font-mono text-sm flex flex-col">
      {/* Terminal header */}
      <div className="flex items-center justify-between p-2 bg-black/50 border-b border-green-500/30">
        <span className="text-green-400 font-semibold">FutureOS Terminal</span>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>

      {/* Terminal content */}
      <div 
        ref={terminalRef}
        className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-500/30"
      >
        <div className="text-green-300 mb-4">
          Benvenuto in FutureOS Terminal v1.0.0<br/>
          Digita 'help' per vedere i comandi disponibili.
        </div>
        
        {history.map((entry, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">{getPrompt()}</span>
              <span className="text-white">{entry.command}</span>
            </div>
            {entry.output && (
              <div className="text-green-300 whitespace-pre-wrap pl-4 mt-1">
                {entry.output}
              </div>
            )}
          </div>
        ))}

        {/* Current input line */}
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-green-500 mr-2">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none caret-green-400"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
};

export default Terminal;