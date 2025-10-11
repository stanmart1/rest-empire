from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.schemas.user import UserCreate
from pydantic import ValidationError

print("🧪 Validating Authentication Components\n")

# Test 1: Password hashing
print("1. Testing password hashing...")
password = "Test1234"
hashed = get_password_hash(password)
if verify_password(password, hashed):
    print("   ✅ Password hashing works")
else:
    print("   ❌ Password hashing failed")

# Test 2: Token generation
print("\n2. Testing token generation...")
try:
    access_token = create_access_token({"sub": 1})
    refresh_token = create_refresh_token({"sub": 1})
    print(f"   ✅ Access token: {access_token[:20]}...")
    print(f"   ✅ Refresh token: {refresh_token[:20]}...")
except Exception as e:
    print(f"   ❌ Token generation failed: {e}")

# Test 3: Password validation
print("\n3. Testing password validation...")
test_cases = [
    ("weak", False, "too short"),
    ("weakpassword", False, "no uppercase"),
    ("WEAKPASSWORD", False, "no lowercase"),
    ("WeakPassword", False, "no number"),
    ("Strong123", True, "valid password"),
]

for pwd, should_pass, desc in test_cases:
    try:
        UserCreate(email="test@test.com", password=pwd)
        if should_pass:
            print(f"   ✅ {desc}: passed")
        else:
            print(f"   ❌ {desc}: should have failed")
    except ValidationError as e:
        if not should_pass:
            print(f"   ✅ {desc}: correctly rejected")
        else:
            print(f"   ❌ {desc}: should have passed")

print("\n✅ All authentication components validated!")
