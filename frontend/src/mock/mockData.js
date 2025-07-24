// Mock data per il sistema operativo simulato

export const mockTranslations = {
  en: {
    welcome: 'Welcome to FutureOS',
    selectLanguage: 'Select your language',
    continue: 'Continue',
    desktop: 'Desktop',
    terminal: 'Terminal',
    notepad: 'Notepad',
    fileManager: 'File Manager',
    settings: 'Settings',
    time: new Date().toLocaleTimeString(),
    newFile: 'New File',
    newFolder: 'New Folder',
    save: 'Save',
    open: 'Open',
    delete: 'Delete',
    copy: 'Copy',
    paste: 'Paste',
    close: 'Close',
    minimize: 'Minimize',
    maximize: 'Maximize'
  },
  it: {
    welcome: 'Benvenuto in FutureOS',
    selectLanguage: 'Seleziona la tua lingua',
    continue: 'Continua',
    desktop: 'Desktop',
    terminal: 'Terminale',
    notepad: 'Blocco note',
    fileManager: 'Gestione file',
    settings: 'Impostazioni',
    time: new Date().toLocaleTimeString(),
    newFile: 'Nuovo file',
    newFolder: 'Nuova cartella',
    save: 'Salva',
    open: 'Apri',
    delete: 'Elimina',
    copy: 'Copia',
    paste: 'Incolla',
    close: 'Chiudi',
    minimize: 'Riduci a icona',
    maximize: 'Ingrandisci'
  },
  es: {
    welcome: 'Bienvenido a FutureOS',
    selectLanguage: 'Selecciona tu idioma',
    continue: 'Continuar',
    desktop: 'Escritorio',
    terminal: 'Terminal',
    notepad: 'Bloc de notas',
    fileManager: 'Administrador de archivos',
    settings: 'Configuración',
    time: new Date().toLocaleTimeString(),
    newFile: 'Nuevo archivo',
    newFolder: 'Nueva carpeta',
    save: 'Guardar',
    open: 'Abrir',
    delete: 'Eliminar',
    copy: 'Copiar',
    paste: 'Pegar',
    close: 'Cerrar',
    minimize: 'Minimizar',
    maximize: 'Maximizar'
  }
};

export const mockFileSystem = {
  '/': {
    type: 'folder',
    name: 'root',
    children: {
      'home': {
        type: 'folder',
        name: 'home',
        children: {
          'user': {
            type: 'folder',
            name: 'user', 
            children: {
              'Documents': {
                type: 'folder',
                name: 'Documents',
                children: {
                  'welcome.txt': {
                    type: 'file',
                    name: 'welcome.txt',
                    content: 'Benvenuto in FutureOS!\n\nQuesto è un file di esempio nel tuo sistema operativo futuristico.',
                    size: 124,
                    modified: new Date().toISOString()
                  },
                  'notes.txt': {
                    type: 'file',
                    name: 'notes.txt', 
                    content: 'Le mie note:\n\n- FutureOS è fantastico\n- Il terminale funziona perfettamente\n- Il file manager è molto intuitivo',
                    size: 156,
                    modified: new Date().toISOString()
                  }
                }
              },
              'Downloads': {
                type: 'folder',
                name: 'Downloads',
                children: {}
              },
              'Pictures': {
                type: 'folder',
                name: 'Pictures',
                children: {}
              }
            }
          }
        }
      },
      'bin': {
        type: 'folder',
        name: 'bin',
        children: {}
      },
      'etc': {
        type: 'folder',
        name: 'etc',
        children: {}
      }
    }
  }
};

export const mockTerminalHistory = [
  { command: 'ls', output: 'Documents  Downloads  Pictures', timestamp: new Date().toISOString() },
  { command: 'pwd', output: '/home/user', timestamp: new Date().toISOString() }
];

export const mockSystemSettings = {
  firstRun: true,
  language: 'it',
  theme: 'dark',
  wallpaper: 'https://images.unsplash.com/photo-1588007374946-c79543903e8a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxjeWJlcnB1bmslMjBiYWNrZ3JvdW5kfGVufDB8fHxibHVlfDE3NTMzNjA1ODl8MA&ixlib=rb-4.1.0&q=85'
};

export const mockApps = [
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    component: 'Terminal'
  },
  {
    id: 'notepad',
    name: 'Notepad',
    icon: '📝',
    component: 'Notepad'
  },
  {
    id: 'filemanager',
    name: 'File Manager',
    icon: '📁',
    component: 'FileManager'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    component: 'Settings'
  }
];