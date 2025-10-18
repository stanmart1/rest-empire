from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.book import Book
from app.schemas.book import BookResponse
from app.core.storage import save_file, get_file_url
import os
from datetime import datetime

router = APIRouter()

@router.get("/books", response_model=List[BookResponse])
def get_all_books(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all books (admin only)"""
    books = db.query(Book).all()
    return books

@router.post("/books", response_model=BookResponse)
async def create_book(
    title: str = Form(...),
    author: str = Form(...),
    description: str = Form(...),
    cover_image: Optional[UploadFile] = File(None),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new book (admin only)"""
    cover_image_path = None
    
    if cover_image:
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{cover_image.filename}"
        file_data = await cover_image.read()
        file_path = save_file(file_data, filename, "books")
        cover_image_path = get_file_url(file_path)
    
    book = Book(
        title=title,
        author=author,
        description=description,
        cover_image=cover_image_path
    )
    
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

@router.put("/books/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: int,
    title: str = Form(...),
    author: str = Form(...),
    description: str = Form(...),
    cover_image: Optional[UploadFile] = File(None),
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update a book (admin only)"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    book.title = title
    book.author = author
    book.description = description
    
    if cover_image:
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{cover_image.filename}"
        file_data = await cover_image.read()
        file_path = save_file(file_data, filename, "books")
        book.cover_image = get_file_url(file_path)
    
    db.commit()
    db.refresh(book)
    return book

@router.delete("/books/{book_id}")
def delete_book(
    book_id: int,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a book (admin only)"""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    db.delete(book)
    db.commit()
    return {"message": "Book deleted successfully"}
