from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
user_settings_collection = db.user_settings
filesystem_collection = db.filesystem
terminal_history_collection = db.terminal_history
notepad_files_collection = db.notepad_files

async def init_default_data():
    """Inizializza i dati di default se non esistono"""
    
    # Controlla se esistono già impostazioni utente
    existing_settings = await user_settings_collection.find_one({"user_id": "default_user"})
    if not existing_settings:
        default_settings = {
            "user_id": "default_user",
            "language": "it",
            "theme": "dark",
            "first_run": True,
            "wallpaper": "https://images.unsplash.com/photo-1588007374946-c79543903e8a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxjeWJlcnB1bmslMjBiYWNrZ3JvdW5kfGVufDB8fHxibHVlfDE3NTMzNjA1ODl8MA&ixlib=rb-4.1.0&q=85",
            "notifications": True,
            "auto_save": True,
            "animations_enabled": True
        }
        await user_settings_collection.insert_one(default_settings)
    
    # Controlla se esiste già la struttura del file system
    existing_filesystem = await filesystem_collection.find_one({"path": "/", "user_id": "default_user"})
    if not existing_filesystem:
        # Crea la struttura di directory di default
        default_filesystem = [
            {
                "name": "root",
                "type": "folder",
                "path": "/",
                "parent_path": "",
                "user_id": "default_user"
            },
            {
                "name": "home",
                "type": "folder", 
                "path": "/home",
                "parent_path": "/",
                "user_id": "default_user"
            },
            {
                "name": "user",
                "type": "folder",
                "path": "/home/user",
                "parent_path": "/home",
                "user_id": "default_user"
            },
            {
                "name": "Documents",
                "type": "folder",
                "path": "/home/user/Documents",
                "parent_path": "/home/user",
                "user_id": "default_user"
            },
            {
                "name": "Downloads",
                "type": "folder",
                "path": "/home/user/Downloads", 
                "parent_path": "/home/user",
                "user_id": "default_user"
            },
            {
                "name": "Pictures",
                "type": "folder",
                "path": "/home/user/Pictures",
                "parent_path": "/home/user",
                "user_id": "default_user"
            },
            {
                "name": "bin",
                "type": "folder",
                "path": "/bin",
                "parent_path": "/",
                "user_id": "default_user"
            },
            {
                "name": "etc",
                "type": "folder",
                "path": "/etc",
                "parent_path": "/",
                "user_id": "default_user"
            }
        ]
        
        await filesystem_collection.insert_many(default_filesystem)
        
        # Aggiungi alcuni file di esempio
        default_files = [
            {
                "name": "welcome.txt",
                "type": "file",
                "path": "/home/user/Documents/welcome.txt",
                "parent_path": "/home/user/Documents",
                "content": "Benvenuto in FutureOS!\n\nQuesto è un file di esempio nel tuo sistema operativo futuristico.",
                "size": 124,
                "user_id": "default_user"
            },
            {
                "name": "notes.txt",
                "type": "file",
                "path": "/home/user/Documents/notes.txt",
                "parent_path": "/home/user/Documents",
                "content": "Le mie note:\n\n- FutureOS è fantastico\n- Il terminale funziona perfettamente\n- Il file manager è molto intuitivo",
                "size": 156,
                "user_id": "default_user"
            }
        ]
        
        await filesystem_collection.insert_many(default_files)
    
    # Aggiungi cronologia terminale di default
    existing_history = await terminal_history_collection.find_one({"user_id": "default_user"})
    if not existing_history:
        default_history = [
            {
                "command": "ls",
                "output": "Documents  Downloads  Pictures",
                "directory": "/home/user",
                "user_id": "default_user"
            },
            {
                "command": "pwd", 
                "output": "/home/user",
                "directory": "/home/user",
                "user_id": "default_user"
            }
        ]
        await terminal_history_collection.insert_many(default_history)