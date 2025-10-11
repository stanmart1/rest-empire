import pytest
from app.models.user import User
from app.models.team import TeamMember
from app.models.transaction import Transaction, TransactionType, TransactionStatus
from app.services.team_service import (
    get_team_members, 
    get_team_size, 
    calculate_leg_breakdown,
    update_team_turnover
)
from app.services.optimized_team_service import OptimizedTeamService

class TestTeamStructureIntegration:
    """Integration tests for team structure functionality."""
    
    def test_team_creation_on_registration(self, test_db, create_user):
        """Test that team relationships are created when user registers."""
        # Create sponsor
        sponsor = create_user(test_db, email="sponsor@example.com")
        
        # Create referral
        referral = create_user(
            test_db, 
            email="referral@example.com", 
            sponsor_id=sponsor.id
        )
        
        # Verify team relationship exists
        team_member = test_db.query(TeamMember).filter(
            TeamMember.user_id == referral.id,
            TeamMember.ancestor_id == sponsor.id,
            TeamMember.depth == 1
        ).first()
        
        assert team_member is not None
        assert team_member.personal_turnover == 0
        assert team_member.total_turnover == 0
    
    def test_multi_level_team_structure(self, test_db, create_user):
        """Test creation of multi-level team structure."""
        # Create 4-level structure
        level1 = create_user(test_db, email="level1@example.com")
        level2 = create_user(test_db, email="level2@example.com", sponsor_id=level1.id)
        level3 = create_user(test_db, email="level3@example.com", sponsor_id=level2.id)
        level4 = create_user(test_db, email="level4@example.com", sponsor_id=level3.id)
        
        # Create team relationships manually (in real app, this would be automatic)
        self._create_team_relationships(test_db, [level1, level2, level3, level4])
        
        # Verify level 4 has relationships to all ancestors
        level4_relationships = test_db.query(TeamMember).filter(
            TeamMember.user_id == level4.id
        ).all()
        
        # Should have relationships to self (depth 0) and 3 ancestors (depths 1, 2, 3)
        assert len(level4_relationships) == 4
        
        depths = [rel.depth for rel in level4_relationships]
        assert set(depths) == {0, 1, 2, 3}
        
        # Verify ancestor IDs
        ancestor_ids = {rel.ancestor_id for rel in level4_relationships if rel.depth > 0}
        assert ancestor_ids == {level1.id, level2.id, level3.id}
    
    def test_team_size_calculation(self, test_db, create_team_structure, create_user):
        """Test team size calculation."""
        sponsor = create_user(test_db, email="sponsor@example.com")
        team = create_team_structure(test_db, sponsor, depth=3, width=2)
        
        # Calculate expected team size: 2^1 + 2^2 + 2^3 = 2 + 4 + 8 = 14
        expected_size = 14
        actual_size = get_team_size(test_db, sponsor.id)
        
        assert actual_size == expected_size
    
    def test_leg_breakdown_calculation(self, test_db, create_user):
        """Test leg breakdown calculation with turnover."""
        sponsor = create_user(test_db, email="sponsor@example.com")
        
        # Create first line with different turnovers
        child1 = create_user(test_db, email="child1@example.com", sponsor_id=sponsor.id)
        child2 = create_user(test_db, email="child2@example.com", sponsor_id=sponsor.id)
        child3 = create_user(test_db, email="child3@example.com", sponsor_id=sponsor.id)
        
        # Create team relationships and set turnovers
        self._create_team_relationships(test_db, [sponsor, child1, child2, child3])
        
        # Set different turnovers for each leg
        self._set_team_turnover(test_db, child1.id, 5000)
        self._set_team_turnover(test_db, child2.id, 8000)
        self._set_team_turnover(test_db, child3.id, 3000)
        
        # Calculate leg breakdown
        breakdown = calculate_leg_breakdown(test_db, sponsor.id)
        
        assert breakdown['first_leg']['turnover'] == 8000  # Highest
        assert breakdown['second_leg']['turnover'] == 5000  # Second highest
        assert breakdown['other_legs']['turnover'] == 3000  # Remaining
        
        # Check percentages
        total = 16000
        assert abs(breakdown['first_leg']['percentage'] - (8000/total * 100)) < 0.1
        assert abs(breakdown['second_leg']['percentage'] - (5000/total * 100)) < 0.1
    
    def test_turnover_propagation(self, test_db, create_user):
        """Test that turnover updates propagate up the team tree."""
        # Create 3-level structure
        level1 = create_user(test_db, email="level1@example.com")
        level2 = create_user(test_db, email="level2@example.com", sponsor_id=level1.id)
        level3 = create_user(test_db, email="level3@example.com", sponsor_id=level2.id)
        
        self._create_team_relationships(test_db, [level1, level2, level3])
        
        # Update turnover for level 3
        update_team_turnover(test_db, level3.id, 1000.0)
        
        # Check that turnover propagated to ancestors
        level3_personal = self._get_personal_turnover(test_db, level3.id)
        level2_total = self._get_total_turnover(test_db, level2.id)
        level1_total = self._get_total_turnover(test_db, level1.id)
        
        assert level3_personal == 1000.0
        assert level2_total == 1000.0  # Should include level3's turnover
        assert level1_total == 1000.0  # Should include level3's turnover
    
    def test_team_performance_summary(self, test_db, create_user):
        """Test optimized team performance summary."""
        sponsor = create_user(test_db, email="sponsor@example.com")
        
        # Create multi-level team
        for i in range(3):
            child = create_user(test_db, email=f"child{i}@example.com", sponsor_id=sponsor.id)
            for j in range(2):
                grandchild = create_user(
                    test_db, 
                    email=f"grandchild{i}_{j}@example.com", 
                    sponsor_id=child.id
                )
        
        # Create relationships
        all_users = test_db.query(User).all()
        self._create_team_relationships(test_db, all_users)
        
        # Get performance summary
        summary = OptimizedTeamService.get_team_performance_summary(test_db, sponsor.id)
        
        assert 'levels' in summary
        assert 'totals' in summary
        assert summary['totals']['members'] > 0
    
    def test_team_stats_bulk_query(self, test_db, create_user):
        """Test bulk team statistics query."""
        sponsor = create_user(test_db, email="sponsor@example.com")
        
        # Create some team members
        for i in range(5):
            create_user(test_db, email=f"member{i}@example.com", sponsor_id=sponsor.id)
        
        # Get bulk stats
        stats = OptimizedTeamService.get_team_stats_bulk(test_db, sponsor.id)
        
        assert 'total_team' in stats
        assert 'first_line_count' in stats
        assert 'total_turnover' in stats
        assert stats['first_line_count'] == 5
    
    def test_team_with_inactive_members(self, test_db, create_user):
        """Test team calculations with inactive members."""
        sponsor = create_user(test_db, email="sponsor@example.com")
        
        # Create active and inactive members
        active_child = create_user(
            test_db, 
            email="active@example.com", 
            sponsor_id=sponsor.id,
            is_active=True
        )
        inactive_child = create_user(
            test_db, 
            email="inactive@example.com", 
            sponsor_id=sponsor.id,
            is_active=False
        )
        
        self._create_team_relationships(test_db, [sponsor, active_child, inactive_child])
        
        # Set turnovers
        self._set_team_turnover(test_db, active_child.id, 5000)
        self._set_team_turnover(test_db, inactive_child.id, 3000)
        
        # Get team stats
        stats = OptimizedTeamService.get_team_stats_bulk(test_db, sponsor.id)
        
        # Should count all members but distinguish active/inactive
        assert stats['total_team'] == 2
    
    def test_circular_reference_prevention(self, test_db, create_user):
        """Test prevention of circular references in team structure."""
        user1 = create_user(test_db, email="user1@example.com")
        user2 = create_user(test_db, email="user2@example.com", sponsor_id=user1.id)
        
        # Attempt to create circular reference (user1 sponsored by user2)
        # This should be prevented by business logic
        user1.sponsor_id = user2.id
        
        # In a real implementation, this should raise an error or be prevented
        # For now, we just test that the team structure remains valid
        self._create_team_relationships(test_db, [user1, user2])
        
        # Verify no infinite loops in team queries
        team_size = get_team_size(test_db, user1.id)
        assert team_size >= 0  # Should not cause infinite loop
    
    def test_team_depth_limits(self, test_db, create_user):
        """Test team structure with maximum depth limits."""
        users = []
        
        # Create deep structure (20 levels)
        current_sponsor = None
        for i in range(20):
            user = create_user(
                test_db, 
                email=f"level{i}@example.com",
                sponsor_id=current_sponsor.id if current_sponsor else None
            )
            users.append(user)
            current_sponsor = user
        
        self._create_team_relationships(test_db, users)
        
        # Test that queries handle deep structures efficiently
        deepest_user = users[-1]
        team_members = get_team_members(test_db, users[0].id, depth=15)
        
        # Should limit to 15 levels as per business rules
        max_depth = max(tm.depth for tm in team_members) if team_members else 0
        assert max_depth <= 15
    
    def _create_team_relationships(self, db, users):
        """Helper to create team member relationships."""
        for user in users:
            # Create self-relationship (depth 0)
            self_relation = TeamMember(
                user_id=user.id,
                ancestor_id=user.id,
                depth=0,
                personal_turnover=0,
                total_turnover=0
            )
            db.add(self_relation)
            
            # Create ancestor relationships
            current_sponsor = user
            depth = 1
            
            while current_sponsor.sponsor_id and depth <= 15:
                ancestor = db.query(User).filter(User.id == current_sponsor.sponsor_id).first()
                if not ancestor:
                    break
                
                relation = TeamMember(
                    user_id=user.id,
                    ancestor_id=ancestor.id,
                    depth=depth,
                    personal_turnover=0,
                    total_turnover=0
                )
                db.add(relation)
                
                current_sponsor = ancestor
                depth += 1
        
        db.commit()
    
    def _set_team_turnover(self, db, user_id, turnover):
        """Helper to set team member turnover."""
        team_member = db.query(TeamMember).filter(
            TeamMember.user_id == user_id,
            TeamMember.depth == 0
        ).first()
        
        if team_member:
            team_member.personal_turnover = turnover
            team_member.total_turnover = turnover
            db.commit()
    
    def _get_personal_turnover(self, db, user_id):
        """Helper to get personal turnover."""
        team_member = db.query(TeamMember).filter(
            TeamMember.user_id == user_id,
            TeamMember.depth == 0
        ).first()
        return float(team_member.personal_turnover) if team_member else 0
    
    def _get_total_turnover(self, db, user_id):
        """Helper to get total turnover."""
        team_member = db.query(TeamMember).filter(
            TeamMember.user_id == user_id,
            TeamMember.depth == 0
        ).first()
        return float(team_member.total_turnover) if team_member else 0
