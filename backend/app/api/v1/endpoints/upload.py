from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.api import deps
from app.models.user import UserRole
from app.core.storage import save_file, delete_file, get_file_url
import uuid

router = APIRouter()

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    subfolder: str = Form("")
):
    
    file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
    unique_filename = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())
    
    file_data = await file.read()
    file_path = save_file(file_data, unique_filename, subfolder)
    file_url = get_file_url(file_path)
    
    return {"file_url": file_url, "file_path": file_path}

@router.delete("/")
async def delete_uploaded_file(
    file_path: str,
    current_user = Depends(deps.get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    success = delete_file(file_path)
    return {"success": success}
