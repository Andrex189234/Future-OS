from fastapi import APIRouter, HTTPException
from ..models import UserSettings, UserSettingsUpdate, SystemInfo
from ..database import user_settings_collection
from datetime import datetime
import time

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/", response_model=UserSettings)
async def get_user_settings():
    """Ottieni le impostazioni utente"""
    settings = await user_settings_collection.find_one({"user_id": "default_user"})
    if not settings:
        raise HTTPException(status_code=404, detail="Impostazioni utente non trovate")
    
    # Converti ObjectId in string per la risposta
    settings["id"] = str(settings.get("_id", ""))
    if "_id" in settings:
        del settings["_id"]
    
    return UserSettings(**settings)

@router.post("/", response_model=UserSettings)
async def update_user_settings(settings_update: UserSettingsUpdate):
    """Aggiorna le impostazioni utente"""
    existing_settings = await user_settings_collection.find_one({"user_id": "default_user"})
    
    if not existing_settings:
        raise HTTPException(status_code=404, detail="Impostazioni utente non trovate")
    
    # Prepara i dati da aggiornare
    update_data = settings_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    # Aggiorna nel database
    result = await user_settings_collection.update_one(
        {"user_id": "default_user"},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Errore nell'aggiornamento delle impostazioni")
    
    # Recupera le impostazioni aggiornate
    updated_settings = await user_settings_collection.find_one({"user_id": "default_user"})
    updated_settings["id"] = str(updated_settings.get("_id", ""))
    if "_id" in updated_settings:
        del updated_settings["_id"]
    
    return UserSettings(**updated_settings)

@router.get("/system-info", response_model=SystemInfo)
async def get_system_info():
    """Ottieni informazioni di sistema"""
    uptime_seconds = time.time() - 1234567890  # Tempo simulato
    uptime_hours = int(uptime_seconds // 3600)
    uptime_minutes = int((uptime_seconds % 3600) // 60)
    
    return SystemInfo(
        uptime=f"{uptime_hours}h {uptime_minutes}m"
    )

@router.post("/setup-complete")
async def complete_setup(language: str):
    """Completa il setup iniziale"""
    result = await user_settings_collection.update_one(
        {"user_id": "default_user"},
        {
            "$set": {
                "first_run": False,
                "language": language,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Errore nel completamento del setup")
    
    return {"message": "Setup completato con successo"}