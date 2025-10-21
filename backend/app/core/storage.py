import os
from pathlib import Path

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
STORAGE_PATH = "/app/storage" if ENVIRONMENT == "production" else "uploads"
UPLOAD_DIR = Path(STORAGE_PATH)
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)

def save_file(file_data: bytes, filename: str, subfolder: str = "") -> str:
    """Save file to uploads directory and return the file path"""
    if subfolder:
        folder = UPLOAD_DIR / subfolder
        folder.mkdir(exist_ok=True)
    else:
        folder = UPLOAD_DIR
    
    file_path = folder / filename
    with open(file_path, "wb") as f:
        f.write(file_data)
    
    return str(file_path)

def delete_file(file_path: str) -> bool:
    """Delete file from uploads directory"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False

def get_file_url(file_path: str) -> str:
    """Convert file path to URL"""
    # Remove the storage base path and return relative to /uploads mount point
    relative_path = str(Path(file_path).relative_to(UPLOAD_DIR))
    return f"/uploads/{relative_path.replace(os.sep, '/')}"
