import pytest
import os
from pathlib import Path
from app.core.storage import save_file, delete_file, get_file_url, UPLOAD_DIR

def test_save_file():
    """Test saving a file"""
    file_data = b"test content"
    filename = "test_file.txt"
    
    file_path = save_file(file_data, filename)
    
    assert os.path.exists(file_path)
    with open(file_path, "rb") as f:
        assert f.read() == file_data
    
    # Cleanup
    os.remove(file_path)

def test_save_file_with_subfolder():
    """Test saving a file in a subfolder"""
    file_data = b"test content"
    filename = "test_file.txt"
    subfolder = "test_subfolder"
    
    file_path = save_file(file_data, filename, subfolder)
    
    assert os.path.exists(file_path)
    assert subfolder in file_path
    
    # Cleanup
    os.remove(file_path)
    os.rmdir(UPLOAD_DIR / subfolder)

def test_delete_file():
    """Test deleting a file"""
    file_data = b"test content"
    filename = "test_delete.txt"
    
    file_path = save_file(file_data, filename)
    assert os.path.exists(file_path)
    
    result = delete_file(file_path)
    assert result is True
    assert not os.path.exists(file_path)

def test_delete_nonexistent_file():
    """Test deleting a file that doesn't exist"""
    result = delete_file("nonexistent_file.txt")
    assert result is False

def test_get_file_url():
    """Test getting file URL"""
    file_path = "uploads/test/file.txt"
    url = get_file_url(file_path)
    
    assert url.startswith("/")
    assert "uploads" in url
    assert "file.txt" in url
