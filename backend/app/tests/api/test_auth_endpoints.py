import pytest
from fastapi.testclient import TestClient
from app.models.user import User
from app.core.security import verify_password, decode_access_token

class TestAuthEndpoints:
    """Test suite for authentication endpoints."""
    
    def test_register_success(self, client, test_db, assert_response):
        """Test successful user registration."""
        registration_data = {
            "email": "newuser@example.com",
            "password": "SecurePass123!",
            "full_name": "New User",
            "referral_code": None
        }
        
        response = client.post("/api/v1/auth/register", json=registration_data)
        data = assert_response(response, 201, ["access_token", "user"])
        
        # Verify user was created
        user = test_db.query(User).filter(User.email == registration_data["email"]).first()
        assert user is not None
        assert user.full_name == registration_data["full_name"]
        assert user.is_verified == False  # Should require email verification
        assert user.referral_code is not None
        
        # Verify password was hashed
        assert verify_password(registration_data["password"], user.hashed_password)
        
        # Verify response data
        assert data["user"]["email"] == registration_data["email"]
        assert data["user"]["full_name"] == registration_data["full_name"]
        assert "access_token" in data
    
    def test_register_with_referral(self, client, test_db, test_user, assert_response):
        """Test registration with valid referral code."""
        registration_data = {
            "email": "referred@example.com",
            "password": "SecurePass123!",
            "full_name": "Referred User",
            "referral_code": test_user.referral_code
        }
        
        response = client.post("/api/v1/auth/register", json=registration_data)
        data = assert_response(response, 201)
        
        # Verify sponsor relationship
        user = test_db.query(User).filter(User.email == registration_data["email"]).first()
        assert user.sponsor_id == test_user.id
    
    def test_register_duplicate_email(self, client, test_user, assert_response):
        """Test registration with duplicate email."""
        registration_data = {
            "email": test_user.email,
            "password": "SecurePass123!",
            "full_name": "Duplicate User"
        }
        
        response = client.post("/api/v1/auth/register", json=registration_data)
        assert_response(response, 400)
    
    def test_register_invalid_referral(self, client, assert_response):
        """Test registration with invalid referral code."""
        registration_data = {
            "email": "invalid@example.com",
            "password": "SecurePass123!",
            "full_name": "Invalid Referral",
            "referral_code": "INVALID123"
        }
        
        response = client.post("/api/v1/auth/register", json=registration_data)
        assert_response(response, 400)
    
    def test_register_weak_password(self, client, assert_response):
        """Test registration with weak password."""
        registration_data = {
            "email": "weak@example.com",
            "password": "123",  # Too weak
            "full_name": "Weak Password"
        }
        
        response = client.post("/api/v1/auth/register", json=registration_data)
        assert_response(response, 422)  # Validation error
    
    def test_register_invalid_email(self, client, assert_response):
        """Test registration with invalid email format."""
        registration_data = {
            "email": "invalid-email",
            "password": "SecurePass123!",
            "full_name": "Invalid Email"
        }
        
        response = client.post("/api/v1/auth/register", json=registration_data)
        assert_response(response, 422)  # Validation error
    
    def test_login_success(self, client, test_user, assert_response):
        """Test successful login."""
        login_data = {
            "username": test_user.email,  # FastAPI OAuth2 uses 'username'
            "password": "testpass123"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        data = assert_response(response, 200, ["access_token", "token_type"])
        
        assert data["token_type"] == "bearer"
        
        # Verify token is valid
        token_data = decode_access_token(data["access_token"])
        assert token_data["sub"] == test_user.email
    
    def test_login_wrong_password(self, client, test_user, assert_response):
        """Test login with wrong password."""
        login_data = {
            "username": test_user.email,
            "password": "wrongpassword"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        assert_response(response, 401)
    
    def test_login_nonexistent_user(self, client, assert_response):
        """Test login with nonexistent user."""
        login_data = {
            "username": "nonexistent@example.com",
            "password": "anypassword"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        assert_response(response, 401)
    
    def test_login_unverified_user(self, client, create_user, test_db, assert_response):
        """Test login with unverified user."""
        unverified_user = create_user(
            test_db, 
            email="unverified@example.com", 
            is_verified=False
        )
        
        login_data = {
            "username": unverified_user.email,
            "password": "testpass123"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        assert_response(response, 401)  # Should reject unverified users
    
    def test_login_inactive_user(self, client, create_user, test_db, assert_response):
        """Test login with inactive user."""
        inactive_user = create_user(
            test_db, 
            email="inactive@example.com", 
            is_active=False
        )
        
        login_data = {
            "username": inactive_user.email,
            "password": "testpass123"
        }
        
        response = client.post("/api/v1/auth/login", data=login_data)
        assert_response(response, 401)  # Should reject inactive users
    
    def test_get_current_user(self, client, auth_headers, test_user, assert_response):
        """Test getting current user information."""
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        data = assert_response(response, 200, ["id", "email", "full_name"])
        
        assert data["email"] == test_user.email
        assert data["full_name"] == test_user.full_name
        assert data["current_rank"] == test_user.current_rank
    
    def test_get_current_user_unauthorized(self, client, assert_response):
        """Test getting current user without authentication."""
        response = client.get("/api/v1/auth/me")
        assert_response(response, 401)
    
    def test_get_current_user_invalid_token(self, client, assert_response):
        """Test getting current user with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        assert_response(response, 401)
    
    def test_forgot_password(self, client, test_user, assert_response):
        """Test forgot password request."""
        request_data = {"email": test_user.email}
        
        response = client.post("/api/v1/auth/forgot-password", json=request_data)
        assert_response(response, 200)
        
        # Verify reset token was set (in real implementation)
        # This would trigger an email with reset link
    
    def test_forgot_password_nonexistent_email(self, client, assert_response):
        """Test forgot password with nonexistent email."""
        request_data = {"email": "nonexistent@example.com"}
        
        response = client.post("/api/v1/auth/forgot-password", json=request_data)
        # Should return 200 even for nonexistent email (security)
        assert_response(response, 200)
    
    def test_reset_password(self, client, test_user, test_db, assert_response):
        """Test password reset with valid token."""
        # Set reset token (simulate forgot password)
        from app.core.security import create_access_token
        reset_token = create_access_token(
            data={"sub": test_user.email, "type": "password_reset"}
        )
        test_user.password_reset_token = reset_token
        test_db.commit()
        
        reset_data = {
            "token": reset_token,
            "new_password": "NewSecurePass123!"
        }
        
        response = client.post("/api/v1/auth/reset-password", json=reset_data)
        assert_response(response, 200)
        
        # Verify password was changed
        test_db.refresh(test_user)
        assert verify_password("NewSecurePass123!", test_user.hashed_password)
        assert test_user.password_reset_token is None
    
    def test_reset_password_invalid_token(self, client, assert_response):
        """Test password reset with invalid token."""
        reset_data = {
            "token": "invalid_token",
            "new_password": "NewSecurePass123!"
        }
        
        response = client.post("/api/v1/auth/reset-password", json=reset_data)
        assert_response(response, 400)
    
    def test_verify_email(self, client, create_user, test_db, assert_response):
        """Test email verification."""
        # Create unverified user
        user = create_user(test_db, email="verify@example.com", is_verified=False)
        
        # Set verification token
        from app.core.security import create_access_token
        verification_token = create_access_token(
            data={"sub": user.email, "type": "email_verification"}
        )
        user.verification_token = verification_token
        test_db.commit()
        
        # Verify email
        response = client.get(f"/api/v1/auth/verify-email?token={verification_token}")
        assert_response(response, 200)
        
        # Check user is now verified
        test_db.refresh(user)
        assert user.is_verified == True
        assert user.verification_token is None
    
    def test_verify_email_invalid_token(self, client, assert_response):
        """Test email verification with invalid token."""
        response = client.get("/api/v1/auth/verify-email?token=invalid_token")
        assert_response(response, 400)
    
    def test_refresh_token(self, client, test_user, assert_response):
        """Test token refresh functionality."""
        # Login to get refresh token
        login_data = {
            "username": test_user.email,
            "password": "testpass123"
        }
        
        login_response = client.post("/api/v1/auth/login", data=login_data)
        login_data = assert_response(login_response, 200)
        
        # Use refresh token to get new access token
        refresh_data = {"refresh_token": login_data.get("refresh_token")}
        
        if refresh_data["refresh_token"]:  # If refresh tokens are implemented
            response = client.post("/api/v1/auth/refresh", json=refresh_data)
            data = assert_response(response, 200, ["access_token"])
            
            # Verify new token is valid
            token_data = decode_access_token(data["access_token"])
            assert token_data["sub"] == test_user.email
    
    def test_logout(self, client, auth_headers, assert_response):
        """Test user logout."""
        response = client.post("/api/v1/auth/logout", headers=auth_headers)
        assert_response(response, 200)
        
        # In a real implementation, this would invalidate the token
        # or add it to a blacklist
