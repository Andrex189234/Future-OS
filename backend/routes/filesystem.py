from fastapi import APIRouter, HTTPException
from typing import List
from ..models import FileSystemItem, FileSystemItemCreate, FileSystemItemUpdate
from ..database import filesystem_collection
from datetime import datetime

router = APIRouter(prefix="/filesystem", tags=["filesystem"])

@router.get("/", response_model=List[FileSystemItem])
async def get_filesystem_items(path: str = "/"):
    """Ottieni gli elementi del filesystem per un determinato path"""
    # Trova tutti gli elementi che hanno il path specificato come parent
    items = await filesystem_collection.find({
        "parent_path": path,
        "user_id": "default_user"
    }).to_list(1000)
    
    result = []
    for item in items:
        item["id"] = str(item.get("_id", ""))
        if "_id" in item:
            del item["_id"]
        result.append(FileSystemItem(**item))
    
    return result

@router.get("/item", response_model=FileSystemItem)
async def get_filesystem_item(path: str):
    """Ottieni un singolo elemento del filesystem"""
    item = await filesystem_collection.find_one({
        "path": path,
        "user_id": "default_user"
    })
    
    if not item:
        raise HTTPException(status_code=404, detail="Elemento non trovato")
    
    item["id"] = str(item.get("_id", ""))
    if "_id" in item:
        del item["_id"]
    
    return FileSystemItem(**item)

@router.post("/", response_model=FileSystemItem)
async def create_filesystem_item(item: FileSystemItemCreate):
    """Crea un nuovo elemento nel filesystem"""
    # Controlla se esiste già un elemento con lo stesso path
    existing_item = await filesystem_collection.find_one({
        "path": item.path,
        "user_id": "default_user"
    })
    
    if existing_item:
        raise HTTPException(status_code=400, detail="Un elemento con questo path esiste già")
    
    # Prepara i dati per l'inserimento
    item_data = item.dict()
    item_data["user_id"] = "default_user"
    item_data["created_at"] = datetime.utcnow()
    item_data["modified_at"] = datetime.utcnow()
    
    if item.type == "file" and item.content:
        item_data["size"] = len(item.content)
    
    # Inserisci nel database
    result = await filesystem_collection.insert_one(item_data)
    
    # Recupera l'elemento inserito
    created_item = await filesystem_collection.find_one({"_id": result.inserted_id})
    created_item["id"] = str(created_item.get("_id", ""))
    if "_id" in created_item:
        del created_item["_id"]
    
    return FileSystemItem(**created_item)

@router.put("/{item_path:path}", response_model=FileSystemItem)
async def update_filesystem_item(item_path: str, update: FileSystemItemUpdate):
    """Aggiorna un elemento del filesystem"""
    # Trova l'elemento esistente
    existing_item = await filesystem_collection.find_one({
        "path": f"/{item_path}",
        "user_id": "default_user"
    })
    
    if not existing_item:
        raise HTTPException(status_code=404, detail="Elemento non trovato")
    
    # Prepara i dati da aggiornare
    update_data = update.dict(exclude_unset=True)
    update_data["modified_at"] = datetime.utcnow()
    
    if "content" in update_data and existing_item["type"] == "file":
        update_data["size"] = len(update_data["content"])
    
    # Aggiorna nel database
    result = await filesystem_collection.update_one(
        {"path": f"/{item_path}", "user_id": "default_user"},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Errore nell'aggiornamento dell'elemento")
    
    # Recupera l'elemento aggiornato
    updated_item = await filesystem_collection.find_one({
        "path": f"/{item_path}",
        "user_id": "default_user"
    })
    updated_item["id"] = str(updated_item.get("_id", ""))
    if "_id" in updated_item:
        del updated_item["_id"]
    
    return FileSystemItem(**updated_item)

@router.delete("/{item_path:path}")
async def delete_filesystem_item(item_path: str):
    """Elimina un elemento del filesystem"""
    # Trova l'elemento
    existing_item = await filesystem_collection.find_one({
        "path": f"/{item_path}",
        "user_id": "default_user"
    })
    
    if not existing_item:
        raise HTTPException(status_code=404, detail="Elemento non trovato")
    
    # Se è una cartella, elimina anche tutti i suoi contenuti
    if existing_item["type"] == "folder":
        await filesystem_collection.delete_many({
            "parent_path": {"$regex": f"^/{item_path}"},
            "user_id": "default_user"
        })
    
    # Elimina l'elemento principale
    result = await filesystem_collection.delete_one({
        "path": f"/{item_path}",
        "user_id": "default_user"
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Errore nell'eliminazione dell'elemento")
    
    return {"message": "Elemento eliminato con successo"}

@router.get("/tree", response_model=dict)
async def get_filesystem_tree():
    """Ottieni l'intero albero del filesystem"""
    # Recupera tutti gli elementi del filesystem
    all_items = await filesystem_collection.find({
        "user_id": "default_user"
    }).to_list(1000)
    
    # Costruisci l'albero
    tree = {}
    
    def add_to_tree(item, tree_node):
        path_parts = item["path"].strip("/").split("/")
        current_node = tree_node
        
        for i, part in enumerate(path_parts):
            if not part:  # Root case
                if "/" not in current_node:
                    current_node["/"] = {
                        "type": item["type"],
                        "name": item["name"],
                        "children": {} if item["type"] == "folder" else None,
                        "content": item.get("content"),
                        "size": item.get("size"),
                        "modified": item.get("modified_at")
                    }
                current_node = current_node["/"]
                continue
                
            if "children" not in current_node:
                current_node["children"] = {}
            
            if part not in current_node["children"]:
                current_node["children"][part] = {
                    "type": item["type"],
                    "name": item["name"],
                    "children": {} if item["type"] == "folder" else None,
                    "content": item.get("content"),
                    "size": item.get("size"),
                    "modified": item.get("modified_at")
                }
            
            current_node = current_node["children"][part]
    
    for item in all_items:
        add_to_tree(item, tree)
    
    return tree