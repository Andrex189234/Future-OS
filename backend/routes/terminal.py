from fastapi import APIRouter, HTTPException
from typing import List
from backend.models import TerminalHistoryEntry, TerminalHistoryCreate
from backend.database import terminal_history_collection, filesystem_collection
from datetime import datetime

router = APIRouter(prefix="/terminal", tags=["terminal"])

@router.get("/history", response_model=List[TerminalHistoryEntry])
async def get_terminal_history():
    """Ottieni la cronologia del terminale"""
    history = await terminal_history_collection.find({
        "user_id": "default_user"
    }).sort("timestamp", 1).to_list(1000)
    
    result = []
    for entry in history:
        entry["id"] = str(entry.get("_id", ""))
        if "_id" in entry:
            del entry["_id"]
        result.append(TerminalHistoryEntry(**entry))
    
    return result

@router.post("/history", response_model=TerminalHistoryEntry)
async def add_terminal_history(entry: TerminalHistoryCreate):
    """Aggiungi una nuova voce alla cronologia del terminale"""
    entry_data = entry.dict()
    entry_data["user_id"] = "default_user"
    entry_data["timestamp"] = datetime.utcnow()
    
    result = await terminal_history_collection.insert_one(entry_data)
    
    # Recupera l'entry inserita
    created_entry = await terminal_history_collection.find_one({"_id": result.inserted_id})
    created_entry["id"] = str(created_entry.get("_id", ""))
    if "_id" in created_entry:
        del created_entry["_id"]
    
    return TerminalHistoryEntry(**created_entry)

@router.delete("/history")
async def clear_terminal_history():
    """Pulisci la cronologia del terminale"""
    result = await terminal_history_collection.delete_many({"user_id": "default_user"})
    return {"message": f"Cronologia pulita: {result.deleted_count} voci eliminate"}

@router.post("/execute")
async def execute_command(command: str, current_directory: str = "/home/user"):
    """Esegui un comando del terminale e restituisci l'output"""
    parts = command.strip().split(' ')
    cmd = parts[0]
    args = parts[1:] if len(parts) > 1 else []
    
    output = ""
    new_directory = current_directory
    
    try:
        if cmd == "ls":
            # Lista contenuti directory corrente
            items = await filesystem_collection.find({
                "parent_path": current_directory,
                "user_id": "default_user"
            }).to_list(1000)
            
            if items:
                names = [item["name"] for item in items]
                output = "  ".join(names)
            else:
                output = "Directory vuota"
                
        elif cmd == "pwd":
            output = current_directory
            
        elif cmd == "cd":
            if not args:
                new_directory = "/home/user"
                output = ""
            else:
                target_path = args[0]
                if target_path == "..":
                    # Vai alla directory parent
                    if current_directory != "/":
                        parts = current_directory.rstrip("/").split("/")
                        if len(parts) > 1:
                            parts.pop()
                            new_directory = "/".join(parts) if len(parts) > 1 else "/"
                        else:
                            new_directory = "/"
                    output = ""
                elif target_path.startswith("/"):
                    # Path assoluto
                    item = await filesystem_collection.find_one({
                        "path": target_path,
                        "type": "folder",
                        "user_id": "default_user"
                    })
                    if item:
                        new_directory = target_path
                        output = ""
                    else:
                        output = f"cd: {target_path}: Directory non trovata"
                else:
                    # Path relativo
                    full_path = f"{current_directory.rstrip('/')}/{target_path}"
                    item = await filesystem_collection.find_one({
                        "path": full_path,
                        "type": "folder",
                        "user_id": "default_user"
                    })
                    if item:
                        new_directory = full_path
                        output = ""
                    else:
                        output = f"cd: {target_path}: Directory non trovata"
                        
        elif cmd == "cat":
            if not args:
                output = "cat: specificare un file"
            else:
                filename = args[0]
                file_path = f"{current_directory.rstrip('/')}/{filename}"
                
                file_item = await filesystem_collection.find_one({
                    "path": file_path,
                    "type": "file",
                    "user_id": "default_user"
                })
                
                if file_item:
                    output = file_item.get("content", "")
                else:
                    output = f"cat: {filename}: File non trovato"
                    
        elif cmd == "mkdir":
            if not args:
                output = "mkdir: specificare il nome della directory"
            else:
                dir_name = args[0]
                new_path = f"{current_directory.rstrip('/')}/{dir_name}"
                
                # Controlla se esiste già
                existing = await filesystem_collection.find_one({
                    "path": new_path,
                    "user_id": "default_user"
                })
                
                if existing:
                    output = f"mkdir: {dir_name}: File o directory esistente"
                else:
                    # Crea la directory
                    new_dir = {
                        "name": dir_name,
                        "type": "folder",
                        "path": new_path,
                        "parent_path": current_directory,
                        "user_id": "default_user",
                        "created_at": datetime.utcnow(),
                        "modified_at": datetime.utcnow()
                    }
                    await filesystem_collection.insert_one(new_dir)
                    output = f"Directory '{dir_name}' creata"
                    
        elif cmd == "touch":
            if not args:
                output = "touch: specificare il nome del file"
            else:
                file_name = args[0]
                new_path = f"{current_directory.rstrip('/')}/{file_name}"
                
                # Controlla se esiste già
                existing = await filesystem_collection.find_one({
                    "path": new_path,
                    "user_id": "default_user"
                })
                
                if existing:
                    # Aggiorna timestamp se è un file
                    if existing["type"] == "file":
                        await filesystem_collection.update_one(
                            {"path": new_path, "user_id": "default_user"},
                            {"$set": {"modified_at": datetime.utcnow()}}
                        )
                        output = f"Timestamp di '{file_name}' aggiornato"
                    else:
                        output = f"touch: {file_name}: È una directory"
                else:
                    # Crea il file
                    new_file = {
                        "name": file_name,
                        "type": "file",
                        "path": new_path,
                        "parent_path": current_directory,
                        "content": "",
                        "size": 0,
                        "user_id": "default_user",
                        "created_at": datetime.utcnow(),
                        "modified_at": datetime.utcnow()
                    }
                    await filesystem_collection.insert_one(new_file)
                    output = f"File '{file_name}' creato"
                    
        elif cmd == "rm":
            if not args:
                output = "rm: specificare un file o directory"
            else:
                item_name = args[0]
                item_path = f"{current_directory.rstrip('/')}/{item_name}"
                
                item = await filesystem_collection.find_one({
                    "path": item_path,
                    "user_id": "default_user"
                })
                
                if not item:
                    output = f"rm: {item_name}: File o directory non trovata"
                else:
                    # Elimina l'elemento
                    if item["type"] == "folder":
                        # Elimina ricorsivamente tutti i contenuti
                        await filesystem_collection.delete_many({
                            "path": {"$regex": f"^{item_path}"},
                            "user_id": "default_user"
                        })
                    else:
                        await filesystem_collection.delete_one({
                            "path": item_path,
                            "user_id": "default_user"
                        })
                    output = f"'{item_name}' eliminato"
                    
        elif cmd == "clear":
            # Il clear viene gestito dal frontend
            output = ""
            
        elif cmd == "help":
            output = """Comandi disponibili:
ls          - Lista file e directory
pwd         - Mostra directory corrente
cd [path]   - Cambia directory
cat [file]  - Mostra contenuto file
clear       - Pulisce il terminale
mkdir [dir] - Crea directory
touch [file]- Crea file vuoto
rm [item]   - Elimina file o directory
help        - Mostra questo messaggio
whoami      - Mostra utente corrente
date        - Mostra data e ora
uname       - Mostra informazioni sistema"""
            
        elif cmd == "whoami":
            output = "user"
            
        elif cmd == "date":
            output = datetime.now().strftime("%a %b %d %H:%M:%S %Y")
            
        elif cmd == "uname":
            if args and args[0] == "-a":
                output = "FutureOS 1.0.0 5.4.0-future x86_64"
            else:
                output = "FutureOS"
                
        else:
            output = f"{cmd}: comando non trovato. Usa 'help' per vedere i comandi disponibili."
    
    except Exception as e:
        output = f"Errore nell'esecuzione del comando: {str(e)}"
    
    # Salva nella cronologia
    history_entry = {
        "command": command,
        "output": output,
        "directory": current_directory,
        "user_id": "default_user",
        "timestamp": datetime.utcnow()
    }
    await terminal_history_collection.insert_one(history_entry)
    
    return {
        "command": command,
        "output": output,
        "directory": current_directory,
        "new_directory": new_directory
    }