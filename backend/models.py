from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

# User Settings Model
class UserSettings(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default_user"  # Per semplicità usiamo un utente default
    language: str = "it"
    theme: str = "dark"
    first_run: bool = True
    wallpaper: str
    notifications: bool = True
    auto_save: bool = True
    animations_enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserSettingsUpdate(BaseModel):
    language: Optional[str] = None
    theme: Optional[str] = None
    first_run: Optional[bool] = None
    wallpaper: Optional[str] = None
    notifications: Optional[bool] = None
    auto_save: Optional[bool] = None
    animations_enabled: Optional[bool] = None

# File System Models
class FileSystemItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # "file" or "folder"
    path: str
    parent_path: str
    content: Optional[str] = None  # Solo per i file
    size: Optional[int] = None  # Solo per i file
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str = "default_user"

class FileSystemItemCreate(BaseModel):
    name: str
    type: str
    path: str
    parent_path: str
    content: Optional[str] = None

class FileSystemItemUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None

# Terminal History Model
class TerminalHistoryEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    command: str
    output: str
    directory: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: str = "default_user"

class TerminalHistoryCreate(BaseModel):
    command: str
    output: str
    directory: str

# Notepad Files Model
class NotepadFile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    content: str
    path: str
    size: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    modified_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str = "default_user"

class NotepadFileCreate(BaseModel):
    name: str
    content: str
    path: str

class NotepadFileUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None

# System Info Model
class SystemInfo(BaseModel):
    os_name: str = "FutureOS"
    version: str = "1.0.0"
    kernel_version: str = "5.4.0-future"
    architecture: str = "x86_64"
    memory_ram: str = "8 GB"
    disk_space: str = "256 GB SSD"
    uptime: str
    current_user: str = "user"