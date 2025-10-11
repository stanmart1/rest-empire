import pytest
from datetime import datetime, timedelta
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    decode_access_token
)

class TestSecurity:
    """Test suite for security functions."""
    
    def test_password_hashing(self):
        """Test password hashing and verification."""
        password = "SecurePassword123!"
        
        # Hash password
        hashed = get_password_hash(password)
        
        # Verify hash is different from original
        assert hashed != password
        assert len(hashed) > 50  # Bcrypt hashes are long
        
        # Verify password verification works
        assert verify_password(password, hashed) == True
        assert verify_password("wrong_password", hashed) == False
    
    def test_password_hash_uniqueness(self):
        """Test that same password produces different hashes."""
        password = "TestPassword123"
        
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Hashes should be different due to salt
        assert hash1 != hash2
        
        # But both should verify correctly
        assert verify_password(password, hash1) == True
        assert verify_password(password, hash2) == True
    
    def test_access_token_creation(self):
        """Test JWT access token creation."""
        data = {"sub": "test@example.com", "role": "user"}
        
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 100  # JWT tokens are long
        assert "." in token  # JWT format has dots
    
    def test_access_token_decoding(self):
        """Test JWT token decoding."""
        original_data = {
            "sub": "user@example.com",
            "role": "admin",
            "user_id": 123
        }
        
        token = create_access_token(original_data)
        decoded_data = decode_access_token(token)
        
        assert decoded_data["sub"] == original_data["sub"]
        assert decoded_data["role"] == original_data["role"]
        assert decoded_data["user_id"] == original_data["user_id"]
        assert "exp" in decoded_data
        assert "iat" in decoded_data
    
    def test_invalid_token_decoding(self):
        """Test decoding invalid tokens."""
        # Test completely invalid token
        with pytest.raises(Exception):
            decode_access_token("invalid_token")
        
        # Test malformed JWT
        with pytest.raises(Exception):
            decode_access_token("header.payload")
    
    def test_token_with_expiration(self):
        """Test JWT token with custom expiration."""
        data = {"sub": "test@example.com"}
        expires_delta = timedelta(minutes=15)
        
        token = create_access_token(data, expires_delta)
        decoded = decode_access_token(token)
        
        assert decoded["sub"] == "test@example.com"
        assert "exp" in decoded
