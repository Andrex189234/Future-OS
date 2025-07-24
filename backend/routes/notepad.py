from fastapi import APIRouter, HTTPException
from typing import List
from models import NotepadFile, NotepadFileCreate, NotepadFileUpdate
from database import notepad_files_collection
from datetime import datetime

router = APIRouter(prefix="/notepad", tags=["notepad"])

@router.get("/files", response_model=List[NotepadFile])
async def get_notepad_files():
    """Ottieni tutti i file del notepad"""
    files = await notepad_files_collection.find({
        "user_id": "default_user"
    }).sort("modified_at", -1).to_list(1000)
    
    result = []
    for file in files:
        file["id"] = str(file.get("_id", ""))
        if "_id" in file:
            del file["_id"]
        result.append(NotepadFile(**file))
    
    return result

@router.get("/files/{file_name}", response_model=NotepadFile)
async def get_notepad_file(file_name: str):
    """Ottieni un file specifico del notepad"""
    file = await notepad_files_collection.find_one({
        "name": file_name,
        "user_id": "default_user"
    })
    
    if not file:
        raise HTTPException(status_code=404, detail="File non trovato")
    
    file["id"] = str(file.get("_id", ""))
    if "_id" in file:
        del file["_id"]
    
    return NotepadFile(**file)

@router.post("/files", response_model=NotepadFile)
async def create_notepad_file(file: NotepadFileCreate):
    """Crea un nuovo file nel notepad"""
    # Controlla se esiste già un file con lo stesso nome
    existing_file = await notepad_files_collection.find_one({
        "name": file.name,
        "user_id": "default_user"
    })
    
    if existing_file:
        raise HTTPException(status_code=400, detail="Un file con questo nome esiste già")
    
    # Prepara i dati per l'inserimento
    file_data = file.dict()
    file_data["user_id"] = "default_user"
    file_data["size"] = len(file.content)
    file_data["created_at"] = datetime.utcnow()
    file_data["modified_at"] = datetime.utcnow()
    
    # Inserisci nel database
    result = await notepad_files_collection.insert_one(file_data)
    
    # Recupera il file inserito
    created_file = await notepad_files_collection.find_one({"_id": result.inserted_id})
    created_file["id"] = str(created_file.get("_id", ""))
    if "_id" in created_file:
        del created_file["_id"]
    
    return NotepadFile(**created_file)

@router.put("/files/{file_name}", response_model=NotepadFile)
async def update_notepad_file(file_name: str, update: NotepadFileUpdate):
    """Aggiorna un file del notepad"""
    # Trova il file esistente
    existing_file = await notepad_files_collection.find_one({
        "name": file_name,
        "user_id": "default_user"
    })
    
    if not existing_file:
        raise HTTPException(status_code=404, detail="File non trovato")
    
    # Prepara i dati da aggiornare
    update_data = update.dict(exclude_unset=True)
    update_data["modified_at"] = datetime.utcnow()
    
    if "content" in update_data:
        update_data["size"] = len(update_data["content"])
    
    # Se il nome cambia, controlla che non esista già
    if "name" in update_data and update_data["name"] != file_name:
        existing_with_new_name = await notepad_files_collection.find_one({
            "name": update_data["name"],
            "user_id": "default_user"
        })
        if existing_with_new_name:
            raise HTTPException(status_code=400, detail="Un file con questo nome esiste già")
    
    # Aggiorna nel database
    result = await notepad_files_collection.update_one(
        {"name": file_name, "user_id": "default_user"},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Errore nell'aggiornamento del file")
    
    # Recupera il file aggiornato
    updated_file = await notepad_files_collection.find_one({
        "name": update_data.get("name", file_name),
        "user_id": "default_user"
    })
    updated_file["id"] = str(updated_file.get("_id", ""))
    if "_id" in updated_file:
        del updated_file["_id"]
    
    return NotepadFile(**updated_file)

@router.delete("/files/{file_name}")
async def delete_notepad_file(file_name: str):
    """Elimina un file del notepad"""
    # Trova il file
    existing_file = await notepad_files_collection.find_one({
        "name": file_name,
        "user_id": "default_user"
    })
    
    if not existing_file:
        raise HTTPException(status_code=404, detail="File non trovato")
    
    # Elimina il file
    result = await notepad_files_collection.delete_one({
        "name": file_name,
        "user_id": "default_user"
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Errore nell'eliminazione del file")
    
    return {"message": "File eliminato con successo"}

@router.post("/files/{file_name}/save")
async def save_notepad_file(file_name: str, content: str):
    """Salva o aggiorna il contenuto di un file del notepad"""
    # Controlla se il file esiste
    existing_file = await notepad_files_collection.find_one({
        "name": file_name,
        "user_id": "default_user"
    })
    
    if existing_file:
        # Aggiorna il file esistente
        update_data = {
            "content": content,
            "size": len(content),
            "modified_at": datetime.utcnow()
        }
        
        await notepad_files_collection.update_one(
            {"name": file_name, "user_id": "default_user"},
            {"$set": update_data}
        )
        
        # Recupera il file aggiornato
        updated_file = await notepad_files_collection.find_one({
            "name": file_name,
            "user_id": "default_user"
        })
        updated_file["id"] = str(updated_file.get("_id", ""))
        if "_id" in updated_file:
            del updated_file["_id"]
        
        return NotepadFile(**updated_file)
    else:
        # Crea un nuovo file
        file_data = {
            "name": file_name,
            "content": content,
            "path": f"/home/user/Documents/{file_name}",
            "size": len(content),
            "user_id": "default_user",
            "created_at": datetime.utcnow(),
            "modified_at": datetime.utcnow()
        }
        
        result = await notepad_files_collection.insert_one(file_data)
        
        # Recupera il file creato
        created_file = await notepad_files_collection.find_one({"_id": result.inserted_id})
        created_file["id"] = str(created_file.get("_id", ""))
        if "_id" in created_file:
            del created_file["_id"]
        
        return NotepadFile(**created_file)