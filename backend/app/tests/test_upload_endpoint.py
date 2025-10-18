import pytest
from fastapi.testclient import TestClient
from io import BytesIO
from app.main import app

client = TestClient(app)

def test_upload_file():
    """Test file upload endpoint"""
    file_content = b"test file content"
    files = {"file": ("test.txt", BytesIO(file_content), "text/plain")}
    
    response = client.post("/api/v1/upload/", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert "file_url" in data
    assert "file_path" in data
    assert data["file_url"].startswith("/")

def test_upload_file_with_subfolder():
    """Test file upload with subfolder"""
    file_content = b"test file content"
    files = {"file": ("test.txt", BytesIO(file_content), "text/plain")}
    data = {"subfolder": "test_folder"}
    
    response = client.post("/api/v1/upload/", files=files, data=data)
    
    assert response.status_code == 200
    result = response.json()
    assert "test_folder" in result["file_path"]
