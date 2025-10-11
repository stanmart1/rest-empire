from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.book import Book, BookReview
from app.schemas.book import BookResponse, BookReviewCreate, BookReviewResponse

router = APIRouter()

@router.get("/", response_model=List[BookResponse])
def get_books(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all books"""
    books = db.query(Book).offset(skip).limit(limit).all()
    return books

@router.post("/{book_id}/reviews", response_model=BookReviewResponse)
def create_review(
    book_id: int,
    review_data: BookReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a book review"""
    # Check if book exists
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check if user already reviewed this book
    existing_review = db.query(BookReview).filter(
        BookReview.book_id == book_id,
        BookReview.user_id == current_user.id
    ).first()
    
    if existing_review:
        # Update existing review
        existing_review.rating = review_data.rating
        existing_review.comment = review_data.comment
        db.commit()
        db.refresh(existing_review)
        return existing_review
    
    # Create new review
    review = BookReview(
        book_id=book_id,
        user_id=current_user.id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.get("/{book_id}/reviews", response_model=List[BookReviewResponse])
def get_book_reviews(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get reviews for a book"""
    reviews = db.query(BookReview).filter(BookReview.book_id == book_id).all()
    return reviews
