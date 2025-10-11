import pytest
import time
from sqlalchemy import text
from app.services.optimized_team_service import OptimizedTeamService
from app.services.optimized_bonus_engine import OptimizedBonusEngine
from app.models.user import User
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.models.bonus import Bonus, BonusType, BonusStatus

class TestDatabasePerformance:
    """Performance tests for database optimizations."""
    
    @pytest.fixture(autouse=True)
    def setup_performance_data(self, test_db, create_user, create_transaction, create_bonus):
        """Setup test data for performance testing."""
        self.users = []
        self.transactions = []
        self.bonuses = []
        
        # Create 100 users with team structure
        sponsor = create_user(test_db, email="sponsor@example.com")
        self.users.append(sponsor)
        
        # Create 3 levels with 10 users each
        current_level = [sponsor]
        for level in range(3):
            next_level = []
            for parent in current_level:
                for i in range(10):
                    user = create_user(
                        test_db, 
                        email=f"user_l{level}_p{parent.id}_i{i}@example.com",
                        sponsor_id=parent.id
                    )
                    self.users.append(user)
                    next_level.append(user)
                    
                    # Create transactions for each user
                    for j in range(5):
                        transaction = create_transaction(
                            test_db,
                            user_id=user.id,
                            amount=100.0 * (j + 1),
                            transaction_type=TransactionType.purchase,
                            status=TransactionStatus.completed
                        )
                        self.transactions.append(transaction)
                    
                    # Create bonuses for each user
                    for bonus_type in [BonusType.unilevel, BonusType.rank_bonus]:
                        bonus = create_bonus(
                            test_db,
                            user_id=user.id,
                            bonus_type=bonus_type,
                            amount=50.0,
                            status=BonusStatus.paid
                        )
                        self.bonuses.append(bonus)
            
            current_level = next_level
            if level >= 2:  # Limit depth
                break
    
    def test_user_lookup_performance(self, test_db):
        """Test user lookup query performance with indexes."""
        start_time = time.time()
        
        # Query active users with high earnings
        result = test_db.execute(text("""
            SELECT id, email, current_rank, total_earnings 
            FROM users 
            WHERE is_active = true 
            ORDER BY total_earnings DESC 
            LIMIT 20
        """)).fetchall()
        
        execution_time = time.time() - start_time
        
        assert len(result) > 0
        assert execution_time < 0.1  # Should be fast with index
    
    def test_team_hierarchy_performance(self, test_db):
        """Test team hierarchy query performance."""
        sponsor_id = self.users[0].id
        
        start_time = time.time()
        
        # Query team hierarchy
        result = test_db.execute(text("""
            SELECT tm.user_id, tm.depth, tm.personal_turnover, u.email
            FROM team_members tm
            JOIN users u ON tm.user_id = u.id
            WHERE tm.ancestor_id = :sponsor_id 
            AND tm.depth <= 5
            ORDER BY tm.depth, tm.personal_turnover DESC
        """), {"sponsor_id": sponsor_id}).fetchall()
        
        execution_time = time.time() - start_time
        
        assert len(result) > 0
        assert execution_time < 0.1  # Should be fast with composite index
    
    def test_bonus_calculation_performance(self, test_db):
        """Test bonus calculation query performance."""
        start_time = time.time()
        
        # Query bonus summary
        result = test_db.execute(text("""
            SELECT 
                b.user_id,
                b.bonus_type,
                COUNT(*) as bonus_count,
                SUM(b.amount) as total_amount
            FROM bonuses b
            WHERE b.status = 'paid' 
            AND b.calculation_date >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY b.user_id, b.bonus_type
            ORDER BY total_amount DESC
            LIMIT 50
        """)).fetchall()
        
        execution_time = time.time() - start_time
        
        assert execution_time < 0.1  # Should be fast with indexes
    
    def test_transaction_volume_performance(self, test_db):
        """Test transaction volume query performance."""
        start_time = time.time()
        
        # Query daily transaction volume
        result = test_db.execute(text("""
            SELECT 
                DATE_TRUNC('day', created_at) as day,
                COUNT(*) as transaction_count,
                SUM(amount) as daily_volume
            FROM transactions
            WHERE transaction_type = 'purchase' 
            AND status = 'completed'
            AND created_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE_TRUNC('day', created_at)
            ORDER BY day DESC
        """)).fetchall()
        
        execution_time = time.time() - start_time
        
        assert execution_time < 0.1  # Should be fast with filtered index
    
    def test_materialized_view_performance(self, test_db):
        """Test materialized view query performance."""
        start_time = time.time()
        
        # Query materialized view
        result = test_db.execute(text("""
            SELECT user_id, total_team_count, total_team_turnover
            FROM mv_team_stats
            WHERE total_team_count > 0
            ORDER BY total_team_turnover DESC
            LIMIT 20
        """)).fetchall()
        
        execution_time = time.time() - start_time
        
        assert execution_time < 0.05  # Should be very fast (pre-computed)
    
    def test_complex_join_performance(self, test_db):
        """Test complex join query performance."""
        start_time = time.time()
        
        # Complex join with multiple tables
        result = test_db.execute(text("""
            SELECT 
                u.id,
                u.email,
                u.current_rank,
                ts.total_team_count,
                ts.total_team_turnover,
                ue.unilevel_earnings,
                ue.rank_bonus_earnings
            FROM users u
            LEFT JOIN mv_team_stats ts ON u.id = ts.user_id
            LEFT JOIN mv_user_earnings ue ON u.id = ue.user_id
            WHERE u.is_active = true
            ORDER BY ts.total_team_turnover DESC NULLS LAST
            LIMIT 25
        """)).fetchall()
        
        execution_time = time.time() - start_time
        
        assert execution_time < 0.1  # Should be fast with materialized views
    
    def test_optimized_service_performance(self, test_db):
        """Test optimized service method performance."""
        sponsor_id = self.users[0].id
        
        # Test optimized team stats
        start_time = time.time()
        stats = OptimizedTeamService.get_team_stats_bulk(test_db, sponsor_id)
        team_stats_time = time.time() - start_time
        
        assert team_stats_time < 0.05
        assert 'total_team' in stats
        
        # Test optimized leg breakdown
        start_time = time.time()
        breakdown = OptimizedTeamService.calculate_leg_breakdown_optimized(test_db, sponsor_id)
        leg_breakdown_time = time.time() - start_time
        
        assert leg_breakdown_time < 0.1
        assert 'all_legs' in breakdown
        
        # Test optimized performance summary
        start_time = time.time()
        summary = OptimizedTeamService.get_team_performance_summary(test_db, sponsor_id)
        summary_time = time.time() - start_time
        
        assert summary_time < 0.1
        assert 'levels' in summary
    
    def test_batch_bonus_processing_performance(self, test_db):
        """Test batch bonus processing performance."""
        transaction_ids = [t.id for t in self.transactions[:50]]  # Process 50 transactions
        
        start_time = time.time()
        bonuses = OptimizedBonusEngine.calculate_unilevel_bonuses_batch(
            test_db, 
            transaction_ids
        )
        execution_time = time.time() - start_time
        
        # Batch processing should be efficient
        assert execution_time < 1.0  # Should process 50 transactions in under 1 second
    
    def test_user_bonus_summary_performance(self, test_db):
        """Test user bonus summary performance."""
        user_id = self.users[1].id  # Use a user with bonuses
        
        start_time = time.time()
        summary = OptimizedBonusEngine.get_user_bonus_summary(test_db, user_id, days=30)
        execution_time = time.time() - start_time
        
        assert execution_time < 0.05
        assert 'total_bonuses' in summary
        assert 'by_type' in summary
    
    def test_concurrent_query_performance(self, test_db):
        """Test performance under concurrent-like load."""
        import threading
        import queue
        
        results = queue.Queue()
        
        def run_query(user_id):
            start_time = time.time()
            try:
                stats = OptimizedTeamService.get_team_stats_bulk(test_db, user_id)
                execution_time = time.time() - start_time
                results.put(('success', execution_time))
            except Exception as e:
                execution_time = time.time() - start_time
                results.put(('error', execution_time, str(e)))
        
        # Run 10 concurrent queries
        threads = []
        for i in range(min(10, len(self.users))):
            thread = threading.Thread(target=run_query, args=(self.users[i].id,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads
        for thread in threads:
            thread.join()
        
        # Check results
        total_time = 0
        success_count = 0
        
        while not results.empty():
            result = results.get()
            if result[0] == 'success':
                success_count += 1
                total_time += result[1]
        
        assert success_count > 0
        avg_time = total_time / success_count if success_count > 0 else 0
        assert avg_time < 0.2  # Average query time should be reasonable
    
    def test_large_dataset_pagination_performance(self, test_db):
        """Test pagination performance with large datasets."""
        # Test pagination at different offsets
        page_sizes = [10, 25, 50]
        offsets = [0, 100, 500]
        
        for page_size in page_sizes:
            for offset in offsets:
                start_time = time.time()
                
                result = test_db.execute(text("""
                    SELECT u.id, u.email, u.current_rank, u.total_earnings
                    FROM users u
                    WHERE u.is_active = true
                    ORDER BY u.total_earnings DESC
                    LIMIT :limit OFFSET :offset
                """), {"limit": page_size, "offset": offset}).fetchall()
                
                execution_time = time.time() - start_time
                
                # Pagination should remain fast even with large offsets
                assert execution_time < 0.1
    
    def test_index_usage_verification(self, test_db):
        """Verify that indexes are being used in query plans."""
        # Test query plan for user lookup
        plan = test_db.execute(text("""
            EXPLAIN (ANALYZE, BUFFERS) 
            SELECT id, email, current_rank 
            FROM users 
            WHERE is_active = true 
            ORDER BY total_earnings DESC 
            LIMIT 10
        """)).fetchall()
        
        plan_text = ' '.join([row[0] for row in plan])
        
        # Should use index scan, not sequential scan
        assert 'Index Scan' in plan_text or 'Bitmap Index Scan' in plan_text
        assert 'Seq Scan' not in plan_text or 'Index' in plan_text
    
    def test_memory_usage_efficiency(self, test_db):
        """Test that queries don't consume excessive memory."""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Run memory-intensive query
        result = test_db.execute(text("""
            SELECT u.id, u.email, ts.total_team_count, ue.total_bonuses
            FROM users u
            LEFT JOIN mv_team_stats ts ON u.id = ts.user_id
            LEFT JOIN mv_user_earnings ue ON u.id = ue.user_id
            ORDER BY u.id
        """)).fetchall()
        
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # Memory increase should be reasonable (less than 50MB for test data)
        assert memory_increase < 50 * 1024 * 1024  # 50MB
        assert len(result) > 0
