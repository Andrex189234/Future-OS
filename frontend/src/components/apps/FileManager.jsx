import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { mockFileSystem } from '../../mock/mockData';
import { useToast } from '../../hooks/use-toast';

const FileManager = ({ language, translations }) => {
  const [currentPath, setCurrentPath] = useState('/home/user');
  const [fileSystem, setFileSystem] = useState(mockFileSystem);
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [newItemName, setNewItemName] = useState('');
  const [showNewDialog, setShowNewDialog] = useState(null); // 'file' or 'folder'
  const { toast } = useToast();

  const getCurrentDirectory = () => {
    const parts = currentPath.split('/').filter(p => p);
    let current = fileSystem['/'];

    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  };

  const getDirectoryContents = () => {
    const current = getCurrentDirectory();
    if (!current || !current.children) return [];

    return Object.keys(current.children).map(name => ({
      name,
      ...current.children[name]
    }));
  };

  const navigateTo = (path) => {
    const parts = path.split('/').filter(p => p);
    let current = fileSystem['/'];

    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return false;
      }
    }
    setCurrentPath(path || '/');
    setSelectedItems([]);
    return true;
  };

  const goUp = () => {
    const parts = currentPath.split('/').filter(p => p);
    if (parts.length > 0) {
      parts.pop();
      const parentPath = parts.length > 0 ? '/' + parts.join('/') : '/';
      navigateTo(parentPath);
    }
  };

  const openItem = (item) => {
    if (item.type === 'folder') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      navigateTo(newPath);
    } else {
      toast({
        title: "File aperto",
        description: `Apertura di ${item.name} (simulazione)`,
      });
    }
  };

  const createNewItem = () => {
    if (!newItemName.trim()) return;

    const current = getCurrentDirectory();
    if (!current) return;

    if (current.children[newItemName]) {
      toast({
        title: "Errore",
        description: "Un elemento con questo nome esiste già",
        variant: "destructive"
      });
      return;
    }

    const newItem = {
      type: showNewDialog,
      name: newItemName,
      ...(showNewDialog === 'file' ? {
        content: '',
        size: 0,
        modified: new Date().toISOString()
      } : {
        children: {}
      })
    };

    // Simulazione: aggiorna il file system (in realtà dovrebbe essere salvato nel database)
    const updatedFileSystem = { ...fileSystem };
    const parts = currentPath.split('/').filter(p => p);
    let target = updatedFileSystem['/'];

    for (const part of parts) {
      target = target.children[part];
    }

    target.children[newItemName] = newItem;
    setFileSystem(updatedFileSystem);

    toast({
      title: `${showNewDialog === 'file' ? 'File' : 'Cartella'} creata`,
      description: `${newItemName} è stata creata con successo`,
    });

    setNewItemName('');
    setShowNewDialog(null);
  };

  const deleteSelected = () => {
    if (selectedItems.length === 0) return;

    const confirmDelete = window.confirm(`Eliminare ${selectedItems.length} elementi?`);
    if (!confirmDelete) return;

    toast({
      title: "Elementi eliminati",
      description: `${selectedItems.length} elementi eliminati (simulazione)`,
    });
    setSelectedItems([]);
  };

  const toggleSelection = (itemName) => {
    setSelectedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const getFileIcon = (item) => {
    if (item.type === 'folder') return '📁';
    
    const ext = item.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt': return '📄';
      case 'js': case 'jsx': case 'ts': case 'tsx': return '📜';
      case 'png': case 'jpg': case 'jpeg': case 'gif': return '🖼️';
      case 'mp3': case 'wav': return '🎵';
      case 'mp4': case 'avi': return '🎬';
      default: return '📄';
    }
  };

  const formatFileSize = (size) => {
    if (!size) return '-';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const contents = getDirectoryContents();

  return (
    <div className="h-full bg-gray-900/95 text-white flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-black/50 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={goUp}
            disabled={currentPath === '/'}
            className="text-white hover:bg-gray-700"
          >
            ⬅️ Indietro
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowNewDialog('folder')}
            className="text-white hover:bg-gray-700"
          >
            📁+ Cartella
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowNewDialog('file')}
            className="text-white hover:bg-gray-700"
          >
            📄+ File
          </Button>
          {selectedItems.length > 0 && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={deleteSelected}
              className="text-red-400 hover:bg-red-900/20"
            >
              🗑️ Elimina ({selectedItems.length})
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="text-white hover:bg-gray-700"
          >
            {viewMode === 'grid' ? '📋' : '⊞'}
          </Button>
        </div>
      </div>

      {/* Address bar */}
      <div className="p-2 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">📍</span>
          <span className="text-white font-mono text-sm">{currentPath}</span>
        </div>
      </div>

      {/* Create new item dialog */}
      {showNewDialog && (
        <div className="p-2 bg-blue-900/20 border-b border-blue-500/30">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">
              Crea nuovo {showNewDialog === 'file' ? 'file' : 'cartella'}:
            </span>
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Nome..."
              className="w-48 bg-gray-800 border-gray-600 text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') createNewItem();
                if (e.key === 'Escape') setShowNewDialog(null);
              }}
              autoFocus
            />
            <Button size="sm" onClick={createNewItem} className="bg-blue-600 hover:bg-blue-500">
              Crea
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowNewDialog(null)}
              className="text-gray-400 hover:bg-gray-700"
            >
              Annulla
            </Button>
          </div>
        </div>
      )}

      {/* File listing */}
      <div className="flex-1 p-4 overflow-y-auto">
        {contents.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-4xl mb-2">📂</div>
            <p>Cartella vuota</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-4">
            {contents.map((item) => (
              <Card
                key={item.name}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  selectedItems.includes(item.name)
                    ? 'bg-blue-600/30 border-blue-400'
                    : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
                }`}
                onClick={() => toggleSelection(item.name)}
                onDoubleClick={() => openItem(item)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{getFileIcon(item)}</div>
                  <p className="text-sm truncate text-white">{item.name}</p>
                  {item.type === 'file' && item.size && (
                    <p className="text-xs text-gray-400 mt-1">{formatFileSize(item.size)}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {contents.map((item) => (
              <div
                key={item.name}
                className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                  selectedItems.includes(item.name)
                    ? 'bg-blue-600/30'
                    : 'hover:bg-gray-700/50'
                }`}
                onClick={() => toggleSelection(item.name)}
                onDoubleClick={() => openItem(item)}
              >
                <span className="text-xl">{getFileIcon(item)}</span>
                <span className="flex-1 text-white">{item.name}</span>
                <span className="text-gray-400 text-sm w-16">
                  {item.type === 'file' ? formatFileSize(item.size) : '-'}
                </span>
                <span className="text-gray-400 text-sm w-32">
                  {item.modified ? new Date(item.modified).toLocaleDateString() : '-'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="h-8 bg-black/50 border-t border-gray-700 flex items-center justify-between px-4 text-xs text-gray-400">
        <span>{contents.length} elementi</span>
        {selectedItems.length > 0 && (
          <span>{selectedItems.length} selezionati</span>
        )}
      </div>
    </div>
  );
};

export default FileManager;