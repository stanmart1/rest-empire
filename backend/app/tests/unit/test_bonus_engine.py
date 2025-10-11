import pytest
from app.services.optimized_bonus_engine import OptimizedBonusEngine

class TestBonusEngine:
    """Test suite for bonus calculation engine."""
    
    def test_bonus_engine_import(self):
        """Test that bonus engine can be imported."""
        assert OptimizedBonusEngine is not None
    
    def test_bonus_summary_structure(self, test_db, create_user, create_bonus):
        """Test user bonus summary structure."""
        user = create_user(test_db)
        
        # Create a bonus
        bonus = create_bonus(test_db, user.id, amount=100.0)
        
        # Get summary
        summary = OptimizedBonusEngine.get_user_bonus_summary(test_db, user.id, days=30)
        
        # Check structure
        assert 'total_bonuses' in summary
        assert 'total_amount' in summary
        assert 'by_type' in summary
        assert 'by_currency' in summary
    
    def test_batch_processing_empty_list(self, test_db):
        """Test batch processing with empty transaction list."""
        bonuses = OptimizedBonusEngine.calculate_unilevel_bonuses_batch(test_db, [])
        assert bonuses == []
