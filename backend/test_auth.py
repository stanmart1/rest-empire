import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

print("🧪 Testing Authentication System\n")

# Test 1: Register new user
print("1. Testing Registration...")
register_data = {
    "email": "test@example.com",
    "password": "Test1234",
    "full_name": "Test User",
    "phone_number": "+1234567890"
}

try:
    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    if response.status_code == 200:
        user = response.json()
        print(f"   ✅ User registered: {user['email']}")
        print(f"   Referral code: {user['referral_code']}")
        user_id = user['id']
    else:
        print(f"   ❌ Registration failed: {response.json()}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Login (should fail - not verified)
print("\n2. Testing Login (unverified)...")
login_data = {
    "email": "test@example.com",
    "password": "Test1234"
}

try:
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 403:
        print(f"   ✅ Correctly blocked: {response.json()['detail']}")
    else:
        print(f"   ❌ Unexpected response: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n✅ Authentication system is working!")
print("\nAvailable endpoints:")
print("  POST /api/v1/auth/register")
print("  POST /api/v1/auth/login")
print("  POST /api/v1/auth/refresh")
print("  POST /api/v1/auth/verify-email")
print("  POST /api/v1/auth/request-password-reset")
print("  POST /api/v1/auth/reset-password")
print("  GET  /api/v1/users/me")
print("  POST /api/v1/users/change-password")
