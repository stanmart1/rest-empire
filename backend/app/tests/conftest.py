import pytest
import asyncio
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.rank import Rank
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.bonus import Bonus, BonusType, BonusStatus
from app.models.team import TeamMember
from app.core.security import get_password_hash, create_access_token
from datetime import datetime, timedelta
import uuid

# Test database URL - use in-memory SQLite for fast tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
def test_db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(test_db):
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

# User Factory Functions
@pytest.fixture
def create_user():
    """Factory function to create test users."""
    def _create_user(
        db,
        email: str = None,
        password: str = "testpass123",
        full_name: str = "Test User",
        role: UserRole = UserRole.user,
        is_verified: bool = True,
        is_active: bool = True,
        sponsor_id: int = None,
        current_rank: str = "Amber"
    ):
        if email is None:
            email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role=role,
            is_verified=is_verified,
            is_active=is_active,
            sponsor_id=sponsor_id,
            referral_code=f"REF{uuid.uuid4().hex[:8].upper()}",
            current_rank=current_rank,
            registration_date=datetime.utcnow(),
            balance_ngn=0,
            balance_usdt=0,
            total_earnings=0
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    return _create_user

@pytest.fixture
def create_transaction():
    """Factory function to create test transactions."""
    def _create_transaction(
        db,
        user_id: int,
        transaction_type: TransactionType = TransactionType.purchase,
        amount: float = 100.0,
        currency: str = "EUR",
        status: TransactionStatus = TransactionStatus.completed,
        description: str = "Test transaction"
    ):
        transaction = Transaction(
            user_id=user_id,
            transaction_type=transaction_type,
            amount=amount,
            currency=currency,
            status=status,
            description=description,
            created_at=datetime.utcnow(),
            completed_at=datetime.utcnow() if status == TransactionStatus.completed else None
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction
    return _create_transaction

@pytest.fixture
def create_bonus():
    """Factory function to create test bonuses."""
    def _create_bonus(
        db,
        user_id: int,
        bonus_type: BonusType = BonusType.unilevel,
        amount: float = 10.0,
        currency: str = "EUR",
        status: BonusStatus = BonusStatus.paid,
        level: int = None,
        source_user_id: int = None
    ):
        bonus = Bonus(
            user_id=user_id,
            bonus_type=bonus_type,
            amount=amount,
            currency=currency,
            status=status,
            level=level,
            source_user_id=source_user_id,
            calculation_date=datetime.utcnow().date(),
            paid_date=datetime.utcnow().date() if status == BonusStatus.paid else None
        )
        db.add(bonus)
        db.commit()
        db.refresh(bonus)
        return bonus
    return _create_bonus

@pytest.fixture
def create_team_structure():
    """Factory function to create test team structures."""
    def _create_team_structure(db, sponsor_user, depth: int = 3, width: int = 2):
        """Create a team structure with specified depth and width."""
        users = [sponsor_user]
        
        for level in range(1, depth + 1):
            level_users = []
            for parent in users[-(width ** (level - 1)):]:  # Get parents from previous level
                for i in range(width):
                    child = User(
                        email=f"child_{level}_{parent.id}_{i}@example.com",
                        hashed_password=get_password_hash("testpass123"),
                        full_name=f"Child {level}-{i}",
                        sponsor_id=parent.id,
                        referral_code=f"REF{uuid.uuid4().hex[:8].upper()}",
                        current_rank="Amber",
                        is_verified=True,
                        is_active=True,
                        registration_date=datetime.utcnow()
                    )
                    db.add(child)
                    level_users.append(child)
            
            db.commit()
            for user in level_users:
                db.refresh(user)
            users.extend(level_users)
        
        # Create team member relationships
        for user in users[1:]:  # Skip sponsor
            _create_team_relationships(db, user)
        
        return users
    
    def _create_team_relationships(db, user):
        """Create team member relationships for a user."""
        current_user = user
        depth = 0
        
        while current_user:
            team_member = TeamMember(
                user_id=user.id,
                ancestor_id=current_user.id,
                depth=depth,
                personal_turnover=0,
                total_turnover=0
            )
            db.add(team_member)
            
            if current_user.sponsor_id:
                current_user = db.query(User).filter(User.id == current_user.sponsor_id).first()
                depth += 1
            else:
                break
        
        db.commit()
    
    return _create_team_structure

@pytest.fixture
def create_ranks(test_db):
    """Create standard rank structure."""
    ranks_data = [
        {"name": "Amber", "level": 0, "team_turnover_required": 0, "rank_bonus": 0},
        {"name": "Jade", "level": 1, "team_turnover_required": 5000, "rank_bonus": 0},
        {"name": "Pearl", "level": 2, "team_turnover_required": 10000, "rank_bonus": 0},
        {"name": "Sapphire", "level": 3, "team_turnover_required": 25000, "rank_bonus": 0},
        {"name": "Ruby", "level": 4, "team_turnover_required": 50000, "rank_bonus": 0},
        {"name": "Emerald", "level": 5, "team_turnover_required": 100000, "rank_bonus": 0},
        {"name": "Diamond", "level": 6, "team_turnover_required": 250000, "rank_bonus": 5000},
        {"name": "Blue Diamond", "level": 7, "team_turnover_required": 500000, "rank_bonus": 5000},
        {"name": "Green Diamond", "level": 8, "team_turnover_required": 1000000, "rank_bonus": 10000},
    ]
    
    for rank_data in ranks_data:
        rank = Rank(**rank_data)
        test_db.add(rank)
    
    test_db.commit()
    return ranks_data

# Authentication Fixtures
@pytest.fixture
def test_user(test_db, create_user):
    """Create a standard test user."""
    return create_user(test_db, email="testuser@example.com")

@pytest.fixture
def test_admin(test_db, create_user):
    """Create a test admin user."""
    return create_user(
        test_db, 
        email="admin@example.com", 
        role=UserRole.admin,
        full_name="Test Admin"
    )

@pytest.fixture
def auth_headers(test_user):
    """Create authentication headers for test user."""
    access_token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def admin_headers(test_admin):
    """Create authentication headers for admin user."""
    access_token = create_access_token(data={"sub": test_admin.email})
    return {"Authorization": f"Bearer {access_token}"}

# Test Data Fixtures
@pytest.fixture
def sample_team(test_db, create_user, create_team_structure):
    """Create a sample team structure for testing."""
    sponsor = create_user(test_db, email="sponsor@example.com")
    team = create_team_structure(test_db, sponsor, depth=3, width=2)
    return team

@pytest.fixture
def sample_transactions(test_db, test_user, create_transaction):
    """Create sample transactions for testing."""
    transactions = []
    for i in range(5):
        transaction = create_transaction(
            test_db,
            user_id=test_user.id,
            amount=100.0 * (i + 1),
            description=f"Test transaction {i + 1}"
        )
        transactions.append(transaction)
    return transactions

@pytest.fixture
def sample_bonuses(test_db, test_user, create_bonus):
    """Create sample bonuses for testing."""
    bonuses = []
    bonus_types = [BonusType.unilevel, BonusType.rank_bonus, BonusType.infinity]
    
    for i, bonus_type in enumerate(bonus_types):
        bonus = create_bonus(
            test_db,
            user_id=test_user.id,
            bonus_type=bonus_type,
            amount=50.0 * (i + 1)
        )
        bonuses.append(bonus)
    
    return bonuses

# Utility Functions
@pytest.fixture
def assert_response():
    """Helper function for asserting API responses."""
    def _assert_response(response, expected_status: int = 200, expected_keys: list = None):
        assert response.status_code == expected_status, f"Expected {expected_status}, got {response.status_code}: {response.text}"
        
        if expected_keys and response.status_code == 200:
            data = response.json()
            for key in expected_keys:
                assert key in data, f"Expected key '{key}' not found in response"
        
        return response.json() if response.status_code == 200 else None
    
    return _assert_response
