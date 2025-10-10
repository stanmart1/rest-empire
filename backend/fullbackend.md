# FastAPI Backend Implementation Guide
## Rest Empire MLM Platform - Complete Guide

**Version:** 1.0  
**Target Framework:** FastAPI 0.104+  
**Database:** PostgreSQL with SQLAlchemy  
**Timeline:** 8 Weeks  
**Purpose:** Step-by-step guide for AI coding assistants

---

## Table of Contents

1. [Initial Setup & Project Structure](#1-initial-setup--project-structure)
2. [Database Models & Schema](#2-database-models--schema)
3. [Authentication System](#3-authentication-system)
4. [User Management](#4-user-management)
5. [Team Tree Structure](#5-team-tree-structure)
6. [Rank System](#6-rank-system)
7. [Bonus Calculation Engine](#7-bonus-calculation-engine)
8. [Transaction Management](#8-transaction-management)
9. [Payment Integration](#9-payment-integration)
10. [Notification System](#10-notification-system)
11. [Admin Panel API](#11-admin-panel-api)
12. [API Documentation](#12-api-documentation)
13. [Testing Strategy](#13-testing-strategy)
14. [Security Implementation](#14-security-implementation)
15. [Background Tasks Implementation](#15-background-tasks-implementation)
16. [Development Workflow](#16-development-workflow)
17. [Final Implementation Checklist](#17-final-implementation-checklist)
18. [Documentation Deliverables](#18-documentation-deliverables)
19. [Handover Package](#19-handover-package)
20. [Best Practices Summary](#20-best-practices-summary)

---

## 1. Initial Setup & Project Structure

### 1.1 Directory Structure Creation

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry point
│   ├── config.py                  # Configuration management
│   ├── database.py                # Database connection setup
│   │
│   ├── models/                    # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── team.py
│   │   ├── rank.py
│   │   ├── transaction.py
│   │   ├── bonus.py
│   │   ├── payout.py
│   │   └── support.py
│   │
│   ├── schemas/                   # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── team.py
│   │   ├── rank.py
│   │   ├── transaction.py
│   │   ├── bonus.py
│   │   └── auth.py
│   │
│   ├── api/                       # API endpoints
│   │   ├── __init__.py
│   │   ├── deps.py               # Shared dependencies
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       ├── users.py
│   │       ├── team.py
│   │       ├── ranks.py
│   │       ├── bonuses.py
│   │       ├── transactions.py
│   │       ├── payouts.py
│   │       ├── admin.py
│   │       └── support.py
│   │
│   ├── core/                      # Business logic
│   │   ├── __init__.py
│   │   ├── security.py           # Auth, JWT, password hashing
│   │   ├── permissions.py        # Role-based access control
│   │   ├── bonus_engine.py       # Bonus calculation logic
│   │   ├── rank_calculator.py    # Rank advancement logic
│   │   ├── team_builder.py       # Team tree algorithms
│   │   └── compression.py        # Dynamic compression logic
│   │
│   ├── services/                  # External services
│   │   ├── __init__.py
│   │   ├── email.py              # Email sending service
│   │   ├── payment_stripe.py     # Stripe integration
│   │   ├── payment_crypto.py     # Cryptocurrency payments
│   │   └── notification.py       # Notification service
│   │
│   ├── tasks/                     # Background tasks
│   │   ├── __init__.py
│   │   ├── bonus_calculation.py
│   │   ├── payout_processing.py
│   │   └── monthly_tasks.py
│   │
│   └── utils/                     # Utility functions
│       ├── __init__.py
│       ├── validators.py
│       ├── helpers.py
│       └── constants.py
│
├── tests/                         # Test directory
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_bonus.py
│   └── test_team.py
│
├── alembic/                       # Database migrations
│   ├── versions/
│   └── env.py
│
├── requirements.txt
├── .env.example
└── README.md
```

### 1.2 Dependencies Setup

**Core Framework:**
- FastAPI (latest stable)
- Uvicorn with standard extras
- Python-multipart

**Database:**
- SQLAlchemy
- Alembic
- Psycopg2-binary
- Asyncpg

**Authentication:**
- Python-jose with cryptography
- Passlib with bcrypt
- Python-multipart

**Validation:**
- Pydantic with settings
- Email-validator

**Background Tasks:**
- Celery
- Redis

**Payment Processing:**
- Stripe SDK
- Web3.py

**Email:**
- FastAPI-mail

**Testing:**
- Pytest with async support
- Pytest-asyncio
- HTTPX

**Additional:**
- Python-dotenv
- Requests

### 1.3 Environment Configuration

**Database:**
- DATABASE_URL
- DATABASE_POOL_SIZE
- DATABASE_MAX_OVERFLOW

**Security:**
- SECRET_KEY
- ALGORITHM (HS256)
- ACCESS_TOKEN_EXPIRE_MINUTES
- REFRESH_TOKEN_EXPIRE_DAYS

**Email:**
- MAIL_USERNAME
- MAIL_PASSWORD
- MAIL_FROM
- MAIL_PORT
- MAIL_SERVER
- MAIL_TLS

**Payment Gateways:**
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- CRYPTO_WALLET_ADDRESS
- CRYPTO_API_KEY

**Redis:**
- REDIS_URL
- CELERY_BROKER_URL
- CELERY_RESULT_BACKEND

**Application:**
- APP_NAME
- DEBUG_MODE
- CORS_ORIGINS
- API_V1_PREFIX

### 1.4 Initial Application Setup

**Main Application (main.py):**
- Initialize FastAPI app
- Configure CORS middleware
- Add exception handlers
- Include API routers
- Add startup/shutdown handlers
- Configure OpenAPI documentation

**Database Connection (database.py):**
- Create SQLAlchemy engine
- Set up SessionLocal
- Create Base class
- Implement get_db dependency
- Add connection health check

**Configuration (config.py):**
- Use Pydantic Settings
- Load from environment
- Provide defaults
- Validate on startup
- Support different environments

---

## 2. Database Models & Schema

### 2.1 User Model

**Core Fields:**
- id (Primary key, auto-increment)
- email (Unique, indexed, not null)
- hashed_password (Not null)
- full_name (Optional)
- phone_number (Optional)
- is_verified (Boolean, default False)
- verification_token (String, nullable)
- is_active (Boolean, default True)
- is_inactive (Boolean, default False)

**MLM Structure:**
- sponsor_id (Foreign key to users.id)
- referral_code (Unique, indexed)
- registration_date (Datetime)

**Rank Information:**
- current_rank (String, default "Amber")
- rank_achieved_date (Datetime)
- highest_rank_achieved (String)

**Financial:**
- balance_eur (Decimal)
- balance_dbsp (Decimal)
- total_earnings (Decimal)

**Security:**
- last_login (Datetime)
- password_reset_token (String, nullable)
- password_reset_expires (Datetime, nullable)

**Activity Tracking:**
- last_activity_date (Datetime)
- activity_status (String: active/inactive/suspended)

**Timestamps:**
- created_at (Datetime)
- updated_at (Datetime)

**Relationships:**
- sponsor (Self-referential to parent)
- downline (Back-reference to recruits)
- transactions (One-to-many)
- bonuses (One-to-many)
- payouts (One-to-many)
- support_tickets (One-to-many)

**Indexes:**
- email (unique)
- referral_code (unique)
- sponsor_id
- current_rank
- is_active

### 2.2 Transaction Model

**Fields:**
- id (Primary key)
- user_id (Foreign key, not null)
- transaction_type (Enum: purchase, bonus, payout, fee, refund)
- amount (Decimal, not null)
- currency (String: EUR, USDT, DBSP)
- status (Enum: pending, completed, failed, cancelled)
- description (Text)
- metadata (JSON)

**Payment Information:**
- payment_method (String)
- payment_reference (String)
- payment_gateway_response (JSON)

**Related Transaction:**
- related_transaction_id (Foreign key)

**Timestamps:**
- created_at
- updated_at
- completed_at

**Relationships:**
- user (Many-to-one)
- bonus (One-to-one if bonus transaction)

**Indexes:**
- user_id
- transaction_type
- status
- created_at

### 2.3 Bonus Model

**Fields:**
- id (Primary key)
- user_id (Foreign key)
- bonus_type (Enum: rank_bonus, unilevel, infinity, direct)
- amount (Decimal)
- currency (String)
- calculation_date (Date)
- paid_date (Date, nullable)
- status (Enum: pending, paid, cancelled)

**Bonus-Specific Data:**
- level (Integer for unilevel depth)
- source_user_id (Foreign key)
- source_transaction_id (Foreign key)
- rank_achieved (String for rank bonuses)

**Calculation Details:**
- percentage (Decimal)
- base_amount (Decimal)
- calculation_metadata (JSON)

**Timestamps:**
- created_at
- updated_at

**Relationships:**
- user (Many-to-one)
- source_user (Many-to-one)
- source_transaction (Many-to-one)
- payout_transaction (One-to-one)

**Indexes:**
- user_id
- bonus_type
- status
- calculation_date

### 2.4 Rank Model

**Fields:**
- id (Primary key)
- name (String, unique)
- level (Integer: 1-14)
- team_turnover_required (Decimal)
- first_leg_requirement (Decimal, 50%)
- second_leg_requirement (Decimal, 30%)
- other_legs_requirement (Decimal, 20%)
- bonus_amount (Decimal)
- infinity_bonus_percentage (Decimal, nullable)

**Display Information:**
- display_name (String)
- icon_url (String)
- color_hex (String)
- description (Text)

**Status:**
- is_active (Boolean)

**Timestamps:**
- created_at
- updated_at

**Indexes:**
- name (unique)
- level (unique)

### 2.5 TeamMember Model

**Fields:**
- id (Primary key)
- user_id (Foreign key)
- ancestor_id (Foreign key)
- depth (Integer)
- path (String/Array)

**Turnover Tracking:**
- total_turnover (Decimal)
- personal_turnover (Decimal)
- last_turnover_update (Datetime)

**Timestamps:**
- created_at
- updated_at

**Relationships:**
- user (Many-to-one)
- ancestor (Many-to-one)

**Indexes:**
- user_id, ancestor_id (composite)
- ancestor_id, depth
- path

### 2.6 Payout Model

**Fields:**
- id (Primary key)
- user_id (Foreign key)
- amount (Decimal)
- currency (String)
- status (Enum: pending, approved, processing, completed, rejected)
- payout_method (String)

**Payout Details:**
- account_details (JSON, encrypted)
- processing_fee (Decimal)
- net_amount (Decimal)

**Processing:**
- requested_at (Datetime)
- approved_at (Datetime, nullable)
- approved_by (Foreign key to admin)
- completed_at (Datetime, nullable)
- rejection_reason (Text, nullable)

**External Reference:**
- external_transaction_id (String)
- external_response (JSON)

**Relationships:**
- user (Many-to-one)
- transaction (One-to-one)
- approved_by_admin (Many-to-one)

**Indexes:**
- user_id
- status
- requested_at

### 2.7 SupportTicket Model

**Fields:**
- id (Primary key)
- user_id (Foreign key)
- subject (String, not null)
- category (Enum)
- message (Text, not null)
- status (Enum: open, in_progress, waiting_response, closed)
- priority (Enum: low, medium, high, urgent)

**Assignment:**
- assigned_to (Foreign key to admin, nullable)
- assigned_at (Datetime, nullable)

**Timestamps:**
- created_at
- updated_at
- closed_at (Datetime, nullable)

**Relationships:**
- user (Many-to-one)
- assigned_admin (Many-to-one)
- responses (One-to-many)

**Indexes:**
- user_id
- status
- category
- created_at

### 2.8 SupportResponse Model

**Fields:**
- id (Primary key)
- ticket_id (Foreign key)
- user_id (Foreign key)
- message (Text, not null)
- is_internal_note (Boolean)

**Attachments:**
- attachments (JSON array)

**Timestamps:**
- created_at

**Relationships:**
- ticket (Many-to-one)
- author (Many-to-one)

**Indexes:**
- ticket_id
- created_at

### 2.9 ActivityLog Model

**Fields:**
- id (Primary key)
- user_id (Foreign key)
- action (String)
- entity_type (String)
- entity_id (Integer)
- details (JSON)
- ip_address (String)
- user_agent (String)

**Timestamps:**
- created_at

**Relationships:**
- user (Many-to-one)

**Indexes:**
- user_id
- action
- entity_type, entity_id
- created_at

### 2.10 LegalDocument Model

**Fields:**
- id (Primary key)
- user_id (Foreign key)
- document_type (Enum)
- version (String)
- accepted_at (Datetime)
- ip_address (String)

**Timestamps:**
- created_at

**Relationships:**
- user (Many-to-one)

**Indexes:**
- user_id
- document_type

### 2.11 Database Migration Strategy

**Initial Migration:**
- Create tables in dependency order
- Add indexes
- Set up constraints
- Create sequences

**Best Practices:**
- Use Alembic for all changes
- Never modify existing migrations
- Test upgrade and downgrade
- Keep migrations focused
- Add descriptive messages
- Back up before production runs

**Seeding Data:**
- Create 14 ranks (Amber to Double Ultima Diamond)
- Add default configuration
- Create initial admin user

---

## 3. Authentication System

### 3.1 Password Security

**Password Hashing:**
- Use bcrypt via Passlib
- Set appropriate work factor
- Hash before storing
- Never store plain text
- Never log passwords

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase
- At least one lowercase
- At least one number
- Optional special character
- Check against common passwords
- Validate on both sides

**Password Reset Flow:**
- Generate secure token (UUID)
- Store token hash with expiration (1-2 hours)
- Send reset link via email
- Validate token on reset
- Invalidate after successful reset
- Invalidate all other tokens
- Log reset events

### 3.2 JWT Token Management

**Token Structure:**
- Use JWT for stateless auth
- Minimal claims: user_id, email, role, issued_at, expires_at
- Sign with HS256 using SECRET_KEY
- Appropriate expiration times

**Access Tokens:**
- Short-lived (15-60 minutes)
- For API authentication
- In Authorization header as Bearer
- Validate on every protected endpoint

**Refresh Tokens:**
- Longer-lived (7-30 days)
- Stored securely
- Used only for new access tokens
- Can be revoked
- Consider token rotation

**Token Generation:**
- Create access and refresh pair on login
- Include necessary claims
- Sign with secret key
- Return both to client

**Token Validation:**
- Verify signature
- Check expiration
- Validate structure
- Extract user information
- Handle expired gracefully

### 3.3 Registration Endpoint Logic

**Registration Flow:**
1. Receive registration data
2. Validate email format and uniqueness
3. Validate password strength
4. Validate referral code exists
5. Hash password
6. Generate unique referral code
7. Generate email verification token
8. Create user record with sponsor
9. Create team relationships
10. Send verification email
11. Return success

**Referral Code Handling:**
- Extract sponsor user
- Validate sponsor active and verified
- Create sponsor relationship
- Build team tree path
- Update team closure table

**Email Verification:**
- Generate unique token (UUID)
- Store with user
- Send verification link
- Set expiration (24-48 hours)
- User unverified until confirmed

**Data Validation:**
- Email unique and valid format
- Password meets requirements
- Referral code exists and active
- All required fields provided
- Sanitize all inputs

### 3.4 Login Endpoint Logic

**Login Flow:**
1. Receive credentials
2. Retrieve user by email
3. Verify password
4. Check user verified and active
5. Generate access token
6. Generate refresh token
7. Update last_login
8. Log login event
9. Return tokens and user info

**Security Checks:**
- Verify email exists
- Verify password matches
- Check email verified
- Check account active
- Rate limit login attempts
- Log failed attempts
- Consider account lockout

**Response Data:**
- Access token
- Refresh token
- Token type (Bearer)
- User basic info
- Expiration times

**Error Handling:**
- Generic error for invalid credentials
- Clear error for unverified email
- Clear error for suspended account
- Rate limit error

### 3.5 Token Refresh Endpoint Logic

**Refresh Flow:**
1. Receive refresh token
2. Validate token
3. Extract user ID
4. Verify user exists and active
5. Generate new access token
6. Optionally rotate refresh token
7. Return new token(s)

**Security Considerations:**
- Validate not expired
- Verify user still active
- Consider token rotation
- Invalidate old if rotating
- Log refresh events

### 3.6 Email Verification Endpoint Logic

**Verification Flow:**
1. Receive verification token
2. Find user with matching token
3. Check not expired
4. Set is_verified to True
5. Clear verification token
6. Log verification
7. Optionally auto-login
8. Return success

**Edge Cases:**
- Token not found
- Token expired
- User already verified
- Invalid token format

### 3.7 Password Reset Flow Implementation

**Request Reset:**
1. User provides email
2. Find user
3. Generate reset token
4. Store token hash and expiration
5. Send reset email
6. Return success (always)

**Confirm Reset:**
1. Receive token and new password
2. Find user by token
3. Verify not expired
4. Validate new password
5. Hash new password
6. Update password
7. Invalidate reset token
8. Invalidate existing sessions
9. Log password change
10. Send confirmation
11. Return success

### 3.8 Protected Endpoint Dependencies

**Authentication Dependency:**
- Extract token from header
- Validate signature
- Check expiration
- Extract user ID
- Retrieve user
- Verify active and verified
- Return user object
- Raise 401 if invalid

**Permission Dependencies:**
- Check user role
- Verify permissions for action
- Check resource ownership
- Raise 403 if insufficient

**Rate Limiting:**
- Implement on sensitive endpoints
- Track requests per user/IP
- Return 429 if exceeded

---

## 4. User Management

### 4.1 Get Current User Profile

**Endpoint Logic:**
- Use authentication dependency
- Return profile data
- Include: id, email, name, phone, rank, balances
- Include registration_date, referral_code
- Include status flags
- Exclude sensitive data

**Response Structure:**
- User basic info
- Current rank with icon
- Available balances
- Total earnings
- Team statistics summary
- Sponsor information

### 4.2 Update User Profile

**Endpoint Logic:**
- Authenticate user
- Receive update data
- Validate new data
- Update allowed fields only
- Exclude email change (separate flow)
- Exclude password change (separate flow)
- Log update event
- Return updated profile

**Allowed Updates:**
- Full name
- Phone number
- Profile photo
- Communication preferences

**Restrictions:**
- Cannot change email directly
- Cannot change rank manually
- Cannot change sponsor
- Cannot change financial data

### 4.3 Change Email Address

**Email Change Flow:**
1. Request change with new email and password
2. Verify current password
3. Validate new email unique
4. Generate verification token
5. Send verification to new email
6. Store pending change
7. User clicks link
8. Update email
9. Send confirmation to both emails
10. Log change

**Security:**
- Require password confirmation
- Verify new email unique
- Notify old email
- Allow reporting unauthorized change

### 4.4 Change Password

**Password Change Flow:**
1. Authenticate user
2. Receive current and new password
3. Verify current password
4. Validate new password strength
5. Check new ≠ old
6. Hash new password
7. Update password
8. Invalidate refresh tokens
9. Send confirmation
10. Log change
11. Return success

**Validation:**
- Current password correct
- New password meets requirements
- New different from current
- Confirm matches new

### 4.5 User Dashboard Data

**Endpoint Logic:**
- Authenticate user
- Aggregate metrics:
  - Available balances
  - Current rank with progress
  - Team size (first line, total)
  - Recent earnings (30 days)
  - Pending payouts
  - Recent transactions (10)
  - Team turnover breakdown
  - Rank progress percentage

**Performance:**
- Cache frequently accessed data
- Use efficient aggregations
- Return pre-calculated values
- Lazy load heavy computations

### 4.6 Referral Link Management

**Get Referral Link:**
- Return unique referral code
- Generate complete registration URL
- Provide QR code option
- Track link clicks (optional)

**Referral Statistics:**
- Total referrals (direct)
- Active referrals
- Referrals by date/month
- Conversion rate

### 4.7 Activity Status Management

**Activity Tracking:**
- Update last_activity_date on significant actions
- Monitor 30-day inactivity threshold
- Auto-set inactive after 30 days
- Actions counting as activity:
  - Making purchase
  - Logging in (optional)
  - Downline making first purchase

**Reactivation Logic:**
- User makes USDT purchase → activate 30 days
- Direct downline makes first USDT purchase → activate 30 days
- Set activity_status to "active"
- Update last_activity_date
- Trigger compression recalculation

### 4.8 User Verification Process

**Manual Verification:**
- Admin can manually verify
- Verification affects bonus eligibility
- Store verification method
- Store verification timestamp
- Log verification by admin

**KYC Integration (Optional):**
- Accept document uploads
- Store references securely
- Allow admin review
- Update verification status
- Notify user of changes

---

## 5. Team Tree Structure

### 5.1 Team Tree Data Structure

**Closure Table Implementation:**
- Store all ancestor-descendant relationships
- Each relationship includes depth
- Store materialized path
- Update on every registration

**Advantages:**
- Fast descendant retrieval
- Efficient upline/downline queries
- Simple to maintain
- Handles multiple inheritance

**Structure:**
- user_id: The descendant
- ancestor_id: The ancestor (or self at depth=0)
- depth: Levels between them
- path: Materialized path (e.g., "1.5.23.45")

### 5.2 Team Registration Process

**When New User Registers:**
1. Get sponsor from referral code
2. Create user with sponsor_id
3. Copy sponsor's team relationships:
   - For each ancestor of sponsor:
   - Create team_member: (new_user, ancestor, depth+1)
4. Create self-reference: (new_user, new_user, 0)
5. Build materialized path
6. Store path in team_member
7. Initialize turnover counters to 0

### 5.3 Get Team Tree Endpoint

**Endpoint Logic:**
- Authenticate user
- Get depth parameter (default: all, max: 15)
- Query team_members where ancestor_id = user_id
- Filter by depth if specified
- Include user details:
  - Name, email, rank
  - Registration date
  - Verification status
  - Activity status
  - Personal turnover
  - Team size
- Return hierarchical or flat structure

**Performance Optimization:**
- Limit depth
- Paginate for large teams
- Cache structure with short TTL
- Use indexes on ancestor_id and depth

### 5.4 Team Statistics Calculations

**Team Metrics:**
- First line count (depth = 1)
- Total team count (all depths)
- Active members count
- Inactive members count
- Team turnover by leg
- Rank distribution

**Leg Analysis:**
- Identify first-line members
- Calculate team size under each
- Calculate turnover for each leg
- Sort legs by turnover
- Return top 2 legs + combined others

**Calculation Method:**
- Use recursive queries or closure table
- Sum turnovers from team_member
- Group by first-line member
- Cache results with appropriate TTL

### 5.5 Team Search and Filter

**Search Capabilities:**
- Search by name (partial match)
- Search by email
- Search by referral code
- Filter by rank
- Filter by registration date range
- Filter by activity status
- Filter by verification status

**Endpoint Logic:**
- Authenticate user
- Receive search/filter parameters
- Query team members with filters
- Join with user table
- Apply pagination
- Sort by specified field
- Return paginated results with total count

**Query Optimization:**
- Use database indexes
- Limit result set size
- Use query builder for dynamic filters
- Cache common filter combinations

### 5.6 Performance Tree View

**Tree Visualization Data:**
- Return hierarchical structure for frontend
- Include each node's:
  - User basic info (id, name, rank)
  - Direct children count
  - Total descendants count
  - Personal turnover
  - Team turnover
  - Active/inactive status
- Support lazy loading
- Limit initial depth to 3-4 levels

**Data Format:**
- Each node contains user data + children array
- Children array initially empty or direct children only
- Endpoint to fetch children of specific node
- Include metadata: has_children boolean, children_count

### 5.7 Sponsor Information

**Get Sponsor Details:**
- Authenticate user
- Retrieve user's sponsor_id
- Return sponsor basic information:
  - Name, email
  - Rank
  - Contact information (if allowed)
  - Registration date
  - Team statistics
- Handle case where user has no sponsor

### 5.8 Team Turnover Updates

**Update Mechanism:**
- On purchase, update personal_turnover
- Propagate up tree to all ancestors
- Update team_member.total_turnover
- Use efficient bulk updates
- Trigger asynchronously if possible

**Implementation Steps:**
1. Transaction completes
2. Add amount to user's personal_turnover
3. Query all ancestors from team_member
4. For each ancestor, add amount to their total_turnover
5. Commit all updates in single transaction
6. Trigger rank recalculation

---

## 6. Rank System

### 6.1 Rank Configuration

**Initialize Rank Data:**
- Create 14 ranks in database with requirements
- Each rank includes:
  - Name and level (1-14)
  - Total team turnover requirement
  - First leg requirement (50%)
  - Second leg requirement (30%)
  - Other legs requirement (20%)
  - One-time bonus amount
  - Infinity bonus percentage (Diamond+)
  - Display properties (icon, color, description)

**Rank Hierarchy:**
1. Amber (0 EUR) - Starting rank
2. Jade (5,000 EUR) - 50%: 2,500, 30%: 1,500, 20%: 1,000
3. Pearl (10,000 EUR) - 50%: 5,000, 30%: 3,000, 20%: 2,000
4. Sapphire (25,000 EUR) - 50%: 12,500, 30%: 7,500, 20%: 5,000
5. Ruby (50,000 EUR) - 50%: 25,000, 30%: 15,000, 20%: 10,000
6. Emerald (100,000 EUR) - 50%: 50,000, 30%: 30,000, 20%: 20,000
7. Diamond (250,000 EUR) - Bonus: 5,000 EUR, Infinity: 10%
8. Blue Diamond (500,000 EUR) - Bonus: 5,000 EUR, Infinity: 11%
9. Green Diamond (1M EUR) - Bonus: 10,000 EUR, Infinity: 15%
10. Purple Diamond (2M EUR) - Bonus: 20,000 EUR, Infinity: 21%
11. Red Diamond (6M EUR) - Bonus: 80,000 EUR, Infinity: 23%
12. Black Diamond (12M EUR) - Bonus: 120,000 EUR, Infinity: 25%
13. Ultima Diamond (60M EUR) - Bonus: 960,000 EUR, Infinity: 25%
14. Double Ultima Diamond (120M EUR) - Bonus: 1,200,000 EUR, Infinity: 25%

### 6.2 Rank Calculation Logic

**Rank Check Trigger:**
- Run after every transaction affecting team turnover
- Run daily as batch job for all users
- Can be manually triggered by admin

**Calculation Process:**
1. Get user's current rank level
2. Calculate total team turnover
3. Calculate leg turnovers:
   - For each first-line member
   - Sum all turnover in that leg (recursive)
   - Store leg turnovers array
4. Sort legs by turnover (descending)
5. Identify: strongest leg, second strongest, sum of others
6. Check against next rank requirements:
   - Total turnover >= required total
   - Strongest leg >= 50% requirement
   - Second leg >= 30% requirement
   - Other legs combined >= 20% requirement
7. If all conditions met, qualify for higher rank
8. Check all ranks above current (might qualify for multiple jumps)
9. Award highest qualified rank

**Rank Advancement:**
- Update user.current_rank
- Update user.rank_achieved_date
- Update user.highest_rank_achieved if new peak
- Create activity log entry
- Award rank bonus (if eligible)
- Send notification email
- Trigger recalculation of upline bonuses

**Performance Optimization:**
- Cache leg turnover calculations
- Update incrementally on new transactions
- Use database aggregations
- Run heavy calculations asynchronously

### 6.3 Get User Rank Status

**Endpoint Logic:**
- Authenticate user
- Return current rank details:
  - Current rank name, level, icon
  - Next rank name and requirements
  - Current progress toward next rank
  - Total team turnover
  - Leg breakdown with percentages
  - Progress percentage calculation
- Include qualification status (which requirements met)

**Progress Calculation:**
- Calculate percentage toward each requirement
- Identify bottleneck (which requirement furthest from goal)
- Show detailed breakdown:
  - Total turnover: X / Y (Z%)
  - First leg: X / Y (Z%)
  - Second leg: X / Y (Z%)
  - Other legs: X / Y (Z%)

### 6.4 Rank Bonus Awards

**Bonus Award Process:**
- Triggered when user achieves new rank
- Check if rank has bonus amount
- Check if bonus already awarded (prevent duplicates)
- Create bonus record:
  - Type: rank_bonus
  - Amount from rank configuration
  - Status: pending
  - Link to rank achieved
- Create transaction record
- Add to user's balance
- Send notification
- Update bonus to paid status

**Verification:**
- One-time only per rank per user
- Track in bonus_history
- Prevent duplicate awards
- Log all bonus awards

### 6.5 Rank History Tracking

**Track Rank Changes:**
- Store all rank changes in activity_log
- Include: previous rank, new rank, date
- Store qualifying metrics (turnovers that qualified)
- Allow viewing rank progression history

**Get Rank History Endpoint:**
- Return chronological list of rank changes
- Include date achieved, rank name, bonus earned
- Show progression chart data
- Calculate time between rank advancements

---

## 7. Bonus Calculation Engine

### 7.1 Bonus Engine Architecture

**Core Components:**
- Bonus calculator service (core/bonus_engine.py)
- Separate calculator for each bonus type
- Transaction hook to trigger calculations
- Background job for batch calculations
- Verification and validation layer

**Design Principles:**
- Idempotent calculations (can run multiple times safely)
- Atomic operations (all or nothing)
- Audit trail for every calculation
- Rollback capability for errors
- Performance optimization with caching

### 7.2 Unilevel Bonus Calculation

**Trigger:**
- When any team member makes a purchase/transaction
- Real-time or near-real-time processing
- Queue for asynchronous processing if heavy

**Calculation Algorithm:**
1. Get transaction details (user, amount)
2. Find all upline members (ancestors) up to 15 levels
3. For each upline member:
   - Determine level depth from purchaser
   - Get applicable percentage based on level:
     - Level 1 (direct): 40%
     - Level 2: 7%
     - Level 3: 5%
     - Level 4-5: 3% each
     - Level 6-15: 1% each
   - Check if upline member is active
   - Calculate bonus: transaction_amount × percentage
   - Create bonus record
   - Add to pending bonuses

**Dynamic Compression:**
- Before calculating, check each upline member's activity status
- If inactive: skip and distribute to next active upline
- Active status determined by:
  - Made USDT purchase in last 30 days, OR
  - Direct downline made first USDT purchase in last 30 days
- Compression moves bonus up the tree to next active member
- Track compression in bonus metadata

**Implementation Steps:**
1. Query team_members where descendant = purchaser, order by depth
2. Load activity status for all upline members (optimize with single query)
3. Iterate through levels 1-15
4. For each level, get active members only
5. Calculate bonus for active members
6. If no active member at level, carry percentage to next level (optional) or skip
7. Create bonus records in bulk
8. Create corresponding transaction records
9. Update user balances
10. Send notifications

**Edge Cases:**
- No upline at certain level (end of tree)
- All upline at level inactive (compression to next level or skip)
- Multiple upline at same level (split bonus or choose one path)
- Transaction refund (reverse bonuses)

### 7.3 Rank Bonus Calculation

**Trigger:**
- After rank calculation determines user qualified for new rank
- One-time award per rank achievement

**Implementation:**
1. Verify rank advancement is legitimate
2. Check rank has bonus amount defined
3. Verify bonus not already awarded for this rank + user
4. Create bonus record:
   - Type: rank_bonus
   - Amount: from rank configuration
   - Status: pending
   - Metadata: rank achieved, date
5. Create transaction record
6. Add to user EUR balance
7. Update bonus to paid
8. Log in activity log
9. Send notification email

**Verification:**
- Query existing bonuses for user + rank combination
- Prevent duplicate awards
- Validate rank progression (can't skip ranks without earning lower bonuses)

### 7.4 Infinity Bonus Calculation

**Eligibility:**
- Only for Diamond rank and above
- Based on rank achieved, not current rank
- Monthly recurring bonus

**Bonus Percentages by Rank:**
- Diamond: 10%
- Blue Diamond: 11%
- Green Diamond: 15%
- Purple Diamond: 21%
- Red Diamond: 23%
- Black Diamond: 25%
- Ultima Diamond: 25%
- Double Ultima Diamond: 25%

**Monthly Calculation Process:**
1. Run as scheduled job on 1st of each month
2. Query all users with rank >= Diamond
3. For each eligible user:
   - Calculate total company volume for previous month (all transactions)
   - OR calculate team volume for previous month
   - Apply percentage based on user's rank
   - Create bonus record
   - Add to balance
4. Generate reports
5. Send notifications

**Volume Calculation:**
- Aggregate all USDT purchases in previous month
- Can be company-wide or team-specific (business decision)
- Exclude refunds and non-qualifying transactions
- Cache result for all users (same base amount)

**Implementation:**
1. Create Celery scheduled task
2. Calculate month start/end dates
3. Query transactions in date range, sum amounts
4. Query eligible users (rank >= Diamond, active)
5. For each user, calculate: volume × user_rank_percentage
6. Bulk create bonus records
7. Bulk create transaction records
8. Update balances in batch
9. Send batch notifications
10. Log execution and results

### 7.5 Direct Bonus (Optional)

**If Implementing Direct Sales Bonus:**
- Award bonus on direct referral purchases
- Typically 5-10% of purchase amount
- Paid immediately on transaction
- Separate from unilevel level-1 bonus or combined

### 7.6 Bonus Payment Processing

**Bonus Status Flow:**
- pending: Calculated but not yet added to balance
- paid: Added to user's available balance
- cancelled: Reversed due to refund or error

**Payment Implementation:**
1. Create bonus record with pending status
2. Create corresponding transaction record
3. Add amount to user's balance (EUR or DBSP)
4. Update bonus status to paid
5. Update transaction status to completed
6. All in single database transaction (atomic)

**Rollback Capability:**
- If transaction refunded, reverse bonuses
- Find all bonuses linked to transaction
- Create negative bonus records (or update status)
- Subtract from user balances
- Update original bonus status to cancelled
- Log reversal activity

### 7.7 Bonus History and Reporting

**Get User Bonuses Endpoint:**
- Authenticate user
- Query bonuses for user with filters:
  - Date range
  - Bonus type
  - Status
- Join with related data (source user, transaction)
- Paginate results
- Return detailed bonus information:
  - Type, amount, date
  - Source (who generated it)
  - Level (for unilevel)
  - Status
  - Payment details

**Bonus Analytics:**
- Total bonuses earned (all time, by period)
- Breakdown by type (unilevel, rank, infinity)
- Top earning periods
- Bonus growth trends
- Comparison to team average

**Admin Bonus Reports:**
- Total bonuses paid by period
- Bonuses by type distribution
- Top earners
- Bonus payout trends
- Liability projections

### 7.8 Bonus Calculation Testing

**Test Scenarios:**
1. Single purchase triggers unilevel cascade
2. Multiple purchases in quick succession
3. Inactive member compression
4. Rank achievement triggers rank bonus
5. Month-end infinity bonus calculation
6. Bonus reversal on refund
7. Edge cases: orphan users, circular references, max depth

**Validation Checks:**
- Total bonuses <= business limits
- No duplicate bonuses for same event
- All upline properly credited
- Percentages sum correctly
- Compression logic works
- Balance updates are atomic

---

## 8. Transaction Management

### 8.1 Transaction Model Design

**Transaction Types:**
- purchase: User buys product/package
- bonus: Bonus credited to account
- payout: Withdrawal from account
- fee: Platform or processing fee
- refund: Transaction reversal
- adjustment: Manual admin adjustment

**Transaction Status:**
- pending: Created but not completed
- processing: Being processed by payment gateway
- completed: Successfully finished
- failed: Payment or processing failed
- cancelled: Manually cancelled
- refunded: Transaction reversed

### 8.2 Create Purchase Transaction

**Purchase Flow:**
1. Receive purchase request (amount, currency, payment_method)
2. Authenticate user
3. Validate amount and currency
4. Create transaction record (status: pending)
5. Process payment through gateway (Stripe or Crypto)
6. Handle payment response:
   - Success: Update status to completed
   - Failure: Update status to failed
   - Pending: Keep as processing
7. If completed:
   - Update user's team turnover
   - Trigger rank calculation
   - Trigger bonus calculations
   - Update activity status (set active for 30 days)
   - Send confirmation email
8. Return transaction details

**Payment Gateway Integration:**
- For Stripe (EUR):
  - Create payment intent
  - Confirm payment
  - Handle webhook for confirmation
  - Store payment intent ID
- For Crypto (USDT, DBSP):
  - Generate wallet address or payment request
  - Monitor blockchain for confirmation
  - Handle confirmation callback
  - Store transaction hash

**Turnover Update:**
- Add purchase amount to user's personal_turnover
- Update all ancestors' team_turnover in team_member table
- Use database transaction for atomicity
- Trigger rank recalculation asynchronously

### 8.3 Transaction History Endpoint

**Get Transactions:**
- Authenticate user
- Apply filters:
  - Transaction type (purchase, bonus, payout, etc.)
  - Date range (from, to)
  - Status (pending, completed, failed, etc.)
  - Currency
- Sort by date (newest first by default)
- Paginate results (default 20 per page)
- Return transaction list with:
  - ID, type, amount, currency
  - Status with status display info
  - Date created and completed
  - Payment method and reference
  - Description and metadata

**Response Enhancement:**
- Include related data (bonus details, payout info)
- Calculate totals by type
- Show balance changes
- Include downloadable receipt links

### 8.4 Transaction Details Endpoint

**Get Single Transaction:**
- Authenticate user
- Verify user owns transaction or is admin
- Retrieve transaction with all related data
- Return comprehensive details:
  - All transaction fields
  - Related bonus information (if bonus transaction)
  - Related payout information (if payout)
  - Payment gateway response
  - Status history (if tracked)
  - Associated team members (if purchase that generated bonuses)

### 8.5 Admin Transaction Management

**Admin Transaction List:**
- Authenticate admin user
- Support global transaction search
- Filter by:
  - User (search by name, email, ID)
  - Transaction type
  - Status
  - Date range
  - Amount range
  - Payment method
- Export functionality (CSV, Excel)
- Bulk operations (approve, cancel, refund)

**Manual Transaction Creation:**
- Admin can create adjustment transactions
- Require reason/note for audit
- Support adding or deducting balance
- Create proper transaction and audit records
- Send notification to affected user
- Log admin action

### 8.6 Refund Processing

**Refund Flow:**
1. Admin or automated process initiates refund
2. Validate transaction can be refunded:
   - Transaction is completed
   - Not already refunded
   - Within refund window (if applicable)
3. Create refund transaction (negative amount)
4. Update original transaction status to refunded
5. Reverse all bonuses generated by this transaction:
   - Find all bonuses with source_transaction_id
   - Create negative bonus entries
   - Deduct from user balances
   - Update bonus status to cancelled
6. Adjust team turnovers (subtract refunded amount)
7. Trigger rank recalculation (may demote users)
8. Process payment refund through gateway
9. Send notifications to affected users
10. Log all actions

**Cascade Effects:**
- Bonuses reversed from all upline members
- Team turnover reduced
- Ranks may be lost
- Subsequent bonuses may be affected
- All changes logged for transparency

### 8.7 Transaction Webhooks

**Payment Gateway Webhooks:**
- Set up webhook endpoints for Stripe and crypto gateways
- Verify webhook signatures for security
- Handle payment events:
  - payment_intent.succeeded
  - payment_intent.failed
  - payment_intent.canceled
  - refund.created
- Update transaction status based on events
- Trigger follow-up actions (bonuses, notifications)
- Return appropriate HTTP responses
- Log all webhook events

**Idempotency:**
- Use idempotency keys for payment creation
- Store webhook event IDs to prevent duplicate processing
- Handle duplicate webhook deliveries gracefully

### 8.8 Balance Management

**Balance Tracking:**
- Store balances in user table (balance_eur, balance_dbsp)
- Update balances transactionally with transactions
- Validate sufficient balance before deductions
- Never allow negative balances (except by admin adjustment)
- Track total_earnings separately

**Balance Update Process:**
1. Start database transaction
2. Lock user record (FOR UPDATE)
3. Calculate new balance
4. Validate new balance (>= 0 for non-admins)
5. Update user.balance
6. Create or update transaction record
7. Commit database transaction
8. Handle any errors with rollback

---

## 9. Payment Integration

### 9.1 Stripe Integration (EUR)

**Setup:**
- Install Stripe Python SDK
- Store API keys securely in environment variables
- Create Stripe service class
- Implement webhook handler

**Payment Intent Creation:**
1. Receive payment request (amount, currency, metadata)
2. Create Stripe payment intent:
   - Amount in smallest currency unit (cents)
   - Currency (EUR)
   - Payment method types (card)
   - Metadata (user_id, transaction_id, purpose)
3. Return client_secret to frontend
4. Create transaction record (status: pending)
5. Store payment_intent_id in transaction

**Payment Confirmation:**
- Frontend completes payment with client_secret
- Stripe sends webhook event: payment_intent.succeeded
- Webhook handler:
  - Verify signature
  - Extract payment_intent data
  - Find transaction by payment_intent_id
  - Update transaction status to completed
  - Trigger post-payment actions (bonuses, turnover)
  - Send confirmation email

**Error Handling:**
- Handle payment_intent.failed events
- Update transaction to failed status
- Notify user of failure
- Log error details
- Handle insufficient funds, card decline, etc.

### 9.2 Cryptocurrency Integration (USDT, DBSP)

**Crypto Payment Options:**
- Option A: Use payment processor (Coinbase Commerce, NOWPayments)
- Option B: Direct blockchain integration (more complex)
- Option C: Hybrid approach

**Payment Processor Approach:**
1. Create crypto invoice/charge:
   - Amount in crypto or fiat
   - Currency (USDT, DBSP)
   - Callback URL for confirmation
2. Return payment address or QR code
3. User sends crypto to address
4. Monitor payment status via webhooks
5. Confirm payment on blockchain
6. Update transaction status
7. Trigger bonuses and turnover updates

**Blockchain Monitoring:**
- Set up blockchain node access or use API (Infura, Alchemy)
- Monitor wallet addresses for incoming transactions
- Verify transaction confirmations (typically 3-6 confirmations)
- Match incoming transaction to pending payment
- Handle transaction confirmation delays
- Support multiple cryptocurrencies

**Security Considerations:**
- Generate unique address per transaction (if possible)
- Verify transaction amounts match expected
- Handle partial payments
- Prevent double-spending
- Secure wallet private keys (use cold storage, HSM)

### 9.3 Payout Request Processing

**Request Payout Endpoint:**
1. Authenticate user
2. Receive payout request:
   - Amount
   - Currency (EUR, USDT, DBSP)
   - Payout method (bank, crypto)
   - Account details (encrypted)
3. Validate request:
   - User has sufficient balance
   - Amount meets minimum threshold
   - User is verified (KYC if required)
   - No pending payouts
4. Create payout record (status: pending)
5. Lock requested amount (deduct from available balance)
6. Queue for admin approval (if required)
7. Send confirmation email
8. Return payout request details

**Minimum Thresholds:**
- Set minimum payout amounts per currency
- Display thresholds to users
- Calculate fees and net amount
- Show net amount user will receive

### 9.4 Payout Approval Workflow

**Admin Payout Review:**
1. Admin views pending payouts
2. Review user details and payout request
3. Verify account information
4. Check for fraud indicators
5. Approve or reject payout
6. If approved:
   - Update status to processing
   - Initiate actual payment
   - Record approval timestamp and admin
7. If rejected:
   - Update status to rejected
   - Return amount to available balance
   - Notify user with reason

**Automated Approval (Optional):**
- Auto-approve if conditions met:
  - Amount below threshold
  - User verified and trusted
  - No recent fraud flags
- Still create audit trail
- Admin can review after processing

### 9.5 Payout Execution

**Bank Transfer Payouts (EUR):**
1. Validate bank account details
2. Create Stripe payout or use banking API
3. Submit payout to payment processor
4. Store external transaction ID
5. Monitor payout status
6. Handle callbacks/webhooks
7. Update payout status to completed
8. Create final transaction record
9. Send confirmation email

**Crypto Payouts (USDT, DBSP):**
1. Validate crypto wallet address
2. Calculate transaction fee
3. Create blockchain transaction:
   - From: Platform wallet
   - To: User wallet
   - Amount: Requested amount - fees
4. Sign transaction with private key (secure!)
5. Broadcast to blockchain
6. Store transaction hash
7. Monitor confirmations
8. Update status when confirmed
9. Send confirmation with transaction link

**Payout Fees:**
- Calculate fees based on payout method
- Deduct fees from payout amount
- Store fee in transaction record
- Display net amount to user
- Support fee-inclusive or fee-additional models

### 9.6 Payment Security

**Security Measures:**
- Never store credit card details (use Stripe tokens)
- Encrypt sensitive payment information
- Use HTTPS for all payment endpoints
- Implement rate limiting on payment attempts
- Monitor for suspicious patterns
- Verify webhook signatures
- Use environment-specific API keys
- Rotate API keys periodically
- Log all payment activities
- Implement fraud detection:
  - Unusual transaction amounts
  - Rapid successive transactions
  - Mismatched user information
  - Blacklisted addresses/cards

**PCI Compliance:**
- Never handle raw card data
- Use Stripe.js for card tokenization
- Maintain PCI DSS compliance if required
- Regular security audits
- Document security procedures

### 9.7 Payment Reconciliation

**Daily Reconciliation:**
- Compare platform transactions with gateway reports
- Identify discrepancies
- Resolve mismatches
- Generate reconciliation reports
- Alert admins of significant differences

**Reports:**
- Total payments processed
- Total payouts executed
- Fees paid to gateways
- Outstanding/pending transactions
- Failed transaction analysis

---

## 10. Notification System

### 10.1 Email Notification Architecture

**Email Service Setup:**
- Use FastAPI-Mail or similar library
- Configure SMTP settings from environment
- Create email templates
- Implement email queue for reliability
- Handle failures with retry logic

**Email Types:**
1. Transactional emails (immediate)
2. Notification emails (batched)
3. Marketing emails (optional, separate system)

**Template System:**
- Use Jinja2 templates for email content
- Create templates for each email type
- Support HTML and plain text versions
- Include unsubscribe links (for non-critical emails)
- Personalize with user data

### 10.2 Email Notification Types

**Welcome Email:**
- Trigger: User registration
- Content: Welcome message, verification link
- Include: Getting started guide, support info

**Email Verification:**
- Trigger: Registration, email change request
- Content: Verification link with token
- Expiration: 24-48 hours

**Password Reset:**
- Trigger: Password reset request
- Content: Reset link with token
- Security: Token expires in 1-2 hours

**Rank Achievement:**
- Trigger: User achieves new rank
- Content: Congratulations, rank details, bonus info
- Include: Next rank requirements

**Bonus Earned:**
- Trigger: User earns bonus (may batch hourly/daily)
- Content: Bonus type, amount, source
- Include: Updated balance

**Payout Processed:**
- Trigger: Payout status changes
- Content: Amount, method, expected arrival
- Include: Transaction reference

**Team Member Joins:**
- Trigger: New user registers under user
- Content: New team member info
- Include: Team growth stats

**Account Security:**
- Trigger: Password change, login from new device
- Content: Security alert, action taken
- Include: How to report unauthorized access

**Monthly Summary:**
- Trigger: Monthly scheduled job
- Content: Earnings, team growth, rank progress
- Include: Goals and achievements

### 10.3 Email Implementation

**Send Email Function:**
1. Receive email parameters (recipient, subject, template, data)
2. Load template with user data
3. Render HTML and text versions
4. Create email message
5. Attempt to send via SMTP
6. Handle success/failure:
   - Success: Log sent email
   - Failure: Add to retry queue
7. Return send status

**Email Queue:**
- Use Celery task for async sending
- Implement retry logic (3-5 attempts)
- Handle temporary SMTP failures
- Log all email activities
- Track delivery status

**Batching:**
- Batch non-urgent emails (bonus notifications)
- Send summary instead of individual emails
- User preference for email frequency
- Respect quiet hours

### 10.4 In-App Notifications

**Notification System:**
- Store notifications in database
- Types: info, success, warning, error
- Each notification has:
  - User ID
  - Type
  - Title
  - Message
  - Link (optional)
  - Read status
  - Created timestamp

**Create Notification Function:**
1. Receive notification data
2. Create notification record in database
3. Optionally send real-time push (WebSocket)
4. Return notification object

**Get Notifications Endpoint:**
- Authenticate user
- Query user's notifications
- Filter by read/unread
- Paginate results
- Return with count of unread
- Support marking as read

**Notification Events:**
- New team member
- Bonus earned
- Rank achieved
- Payout status change
- Support ticket response
- System announcements

### 10.5 WebSocket Real-Time Notifications (Optional)

**WebSocket Setup:**
- Implement WebSocket endpoint in FastAPI
- Maintain active connections per user
- Handle connection lifecycle (connect, disconnect, reconnect)

**Real-Time Events:**
- Transaction completed
- Bonus credited
- Team member joins
- Rank achieved
- Urgent system messages

**Implementation:**
1. User connects to WebSocket on login
2. Server maintains user_id to connection mapping
3. When event occurs:
   - Find user's active connection
   - Send notification via WebSocket
   - Fall back to polling if connection lost
4. Client displays real-time notification

### 10.6 Notification Preferences

**User Preferences:**
- Email notification settings
- In-app notification settings
- Frequency preferences (immediate, daily digest, weekly)
- Notification categories to receive

**Preference Management:**
- Get preferences endpoint
- Update preferences endpoint
- Default preferences for new users
- Respect unsubscribe requests
- Honor "Do Not Disturb" hours

---

## 11. Admin Panel API

### 11.1 Admin Authentication

**Admin Roles:**
- Super Admin: Full access
- Admin: Most operations
- Support: Limited to support functions
- Finance: Payout and transaction management

**Role-Based Access Control:**
- Store user role in user table or separate role table
- Create permission dependency functions
- Check role before admin operations
- Log all admin actions

**Admin Endpoints Protection:**
- Require authentication
- Require admin role
- Log access attempts
- Rate limit admin endpoints

### 11.2 User Management

**List All Users:**
- Paginated list of all users
- Search by name, email, ID, referral code
- Filter by rank, status, verification, activity
- Sort by various fields
- Export to CSV

**User Details:**
- Get comprehensive user information
- Include: profile, stats, team, transactions, bonuses
- Show audit trail
- Display activity history

**User Actions:**
- Verify user manually
- Suspend/unsuspend account
- Reset password (send reset email)
- Adjust balance (with reason)
- Change rank manually (with reason)
- View/manage user's team

### 11.3 Transaction Management

**Transaction Dashboard:**
- Total transactions by period
- Transaction volume by type
- Revenue analytics
- Failed transaction analysis
- Recent transactions list

**Transaction Operations:**
- View all transactions with advanced filters
- Transaction details with full history
- Manual transaction creation
- Refund processing
- Transaction cancellation
- Export transaction reports

### 11.4 Bonus Management

**Bonus Analytics:**
- Total bonuses paid by period
- Bonus distribution by type
- Top earners leaderboard
- Bonus payout trends
- Bonus liability calculations

**Bonus Operations:**
- View all bonuses with filters
- Manual bonus creation (adjustment)
- Bonus cancellation (with audit)
- Recalculate bonuses (if needed)
- Export bonus reports

**Bonus Configuration:**
- Update bonus percentages (if dynamic)
- Enable/disable bonus types
- Set bonus caps or limits
- Configure compression rules

### 11.5 Payout Management

**Payout Queue:**
- List pending payouts
- Sort by amount, date, user
- Filter by currency, method
- Batch operations (approve multiple)

**Payout Processing:**
- Review payout details
- Verify user information
- Approve or reject
- Track processing status
- Handle failed payouts
- Manual payout execution

**Payout Reports:**
- Total payouts by period
- Payouts by method
- Processing time analytics
- Fee analysis
- Outstanding payout liability

### 11.6 Support Ticket Management

**Ticket Dashboard:**
- Open tickets count
- Ticket by category
- Average response time
- Tickets assigned to admin

**Ticket Operations:**
- View all tickets with filters
- Ticket details with full conversation
- Assign to support agent
- Respond to ticket
- Change ticket status
- Close ticket
- Internal notes (not visible to user)

**Support Analytics:**
- Tickets by category
- Resolution time
- Customer satisfaction (if tracked)
- Support agent performance

### 11.7 System Configuration

**Platform Settings:**
- Minimum payout thresholds by currency
- Transaction fees configuration
- Rank requirements (if editable)
- Bonus percentages (if dynamic)
- Email templates
- System maintenance mode
- Feature flags

**Configuration Endpoints:**
- Get all settings
- Update specific setting
- Reset to defaults
- Export/import configuration

### 11.8 Analytics and Reporting

**Dashboard Metrics:**
- Total users (active, inactive, verified)
- Total transactions (today, week, month)
- Total revenue by currency
- Total bonuses paid
- Pending payouts amount
- System health indicators

**User Analytics:**
- User growth over time
- Registration by referral source
- Rank distribution
- Activation rate
- Retention metrics
- Churn analysis

**Financial Reports:**
- Revenue by period
- Revenue by transaction type
- Payout volume trends
- Bonus expense trends
- Profitability analysis
- Cash flow projections

**Export Functionality:**
- Export reports to CSV, Excel, PDF
- Scheduled report generation
- Email reports to admins
- Custom report builder

### 11.9 Activity Logging

**Audit Trail:**
- Log all admin actions
- Record: admin user, action, entity, timestamp, details
- Store IP address and user agent
- Cannot be modified or deleted
- Searchable and filterable

**Critical Actions to Log:**
- User verification/suspension
- Manual balance adjustments
- Manual bonus creation
- Payout approval/rejection
- Configuration changes
- Permission changes
- Data exports

---

## 12. API Documentation

### 12.1 OpenAPI/Swagger Setup

**FastAPI Auto-Documentation:**
- FastAPI generates OpenAPI schema automatically
- Accessible at /docs (Swagger UI)
- Accessible at /redoc (ReDoc)
- Configure title, description, version
- Add contact information
- Include terms of service link

**Documentation Enhancement:**
- Add detailed descriptions to endpoints
- Document request/response models with examples
- Include error responses
- Add authentication requirements
- Group endpoints by tags
- Provide usage examples

### 12.2 Endpoint Documentation Standards

**For Each Endpoint Document:**
- Summary (brief description)
- Description (detailed explanation)
- Parameters (path, query, body)
- Request body schema with examples
- Response schemas for all status codes
- Authentication requirements
- Required permissions
- Rate limits
- Example requests and responses

**Response Models:**
- Create Pydantic schemas for all responses
- Include field descriptions
- Provide example values
- Document optional vs required fields
- Specify data types and formats

### 12.3 Error Response Standards

**Standard Error Response Format:**
- status_code: HTTP status code
- error_type: Category of error
- message: Human-readable error message
- details: Additional error context (optional)
- timestamp: When error occurred
- request_id: For tracking and support

**Common Error Responses:**
- 400 Bad Request: Validation errors, invalid input
- 401 Unauthorized: Missing or invalid authentication
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource doesn't exist
- 409 Conflict: Resource conflict (duplicate)
- 422 Unprocessable Entity: Semantic errors
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server-side error

**Error Handling Implementation:**
- Create custom exception classes
- Implement global exception handlers
- Log all errors with context
- Never expose sensitive information in errors
- Provide actionable error messages

### 12.4 API Versioning

**Version Strategy:**
- Use URL path versioning: /api/v1/, /api/v2/
- Current version: v1
- Maintain backward compatibility within major version
- Document deprecation timeline
- Support multiple versions simultaneously during transition

**Version Management:**
- Separate router modules by version
- Share common logic via core modules
- Document changes between versions
- Provide migration guides

### 12.5 Rate Limiting Documentation

**Rate Limit Implementation:**
- Use slowapi or custom middleware
- Limits by endpoint type:
  - Authentication: 5 requests/minute
  - Read operations: 100 requests/minute
  - Write operations: 20 requests/minute
  - Admin operations: 50 requests/minute
- Return rate limit headers:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset

**Documentation:**
- Document limits for each endpoint
- Explain rate limit headers
- Provide guidance on handling 429 errors
- Describe retry strategies

---

## 13. Testing Strategy

### 13.1 Test Structure

**Test Organization:**
- Unit tests: Test individual functions
- Integration tests: Test component interactions
- API tests: Test endpoints end-to-end
- Performance tests: Load and stress testing

**Test Directory Structure:**
```
tests/
├── unit/
│   ├── test_bonus_engine.py
│   ├── test_rank_calculator.py
│   └── test_security.py
├── integration/
│   ├── test_team_structure.py
│   └── test_payment_flow.py
├── api/
│   ├── test_auth_endpoints.py
│   ├── test_user_endpoints.py
│   └── test_bonus_endpoints.py
└── conftest.py
```

### 13.2 Test Fixtures and Setup

**Database Fixtures:**
- Create test database
- Use separate database for tests
- Reset database before each test
- Create factory functions for test data
- Use pytest fixtures for common setups

**Common Fixtures:**
- test_db: Database session
- test_client: FastAPI test client
- test_user: Basic user object
- test_admin: Admin user object
- test_team: Pre-built team structure
- auth_headers: Authentication headers

**Factory Functions:**
- create_user: Generate test users
- create_transaction: Generate test transactions
- create_bonus: Generate test bonuses
- create_team_structure: Build test team trees

### 13.3 Authentication Testing

**Test Scenarios:**
- User registration with valid data
- Registration with duplicate email
- Registration with invalid referral code
- Login with correct credentials
- Login with incorrect credentials
- Login with unverified account
- Token generation and validation
- Token expiration handling
- Password reset flow
- Email verification flow

**Security Testing:**
- Password hashing verification
- Token signature validation
- Authorization enforcement
- CSRF protection (if applicable)
- SQL injection prevention
- XSS prevention

### 13.4 Business Logic Testing

**Bonus Calculation Tests:**
- Single level unilevel bonus
- Multi-level cascade (15 levels)
- Dynamic compression with inactive users
- Rank bonus award on advancement
- Infinity bonus calculation
- Bonus reversal on refund
- Edge cases: orphan users, circular refs

**Rank Calculation Tests:**
- Rank advancement with qualifying turnover
- Leg requirement validation
- Multiple rank jumps
- Rank demotion scenarios
- Rank bonus triggering

**Team Structure Tests:**
- User registration updates team tree
- Team query at various depths
- Leg turnover calculations
- Team statistics accuracy
- Ancestor-descendant relationships

### 13.5 API Endpoint Testing

**For Each Endpoint Test:**
- Successful requests with valid data
- Invalid input handling
- Authentication requirement enforcement
- Permission enforcement
- Pagination functionality
- Filtering and sorting
- Error responses
- Edge cases

**Test Pattern:**
1. Setup: Create necessary test data
2. Execute: Make API request
3. Assert: Verify response and side effects
4. Cleanup: Remove test data

### 13.6 Performance Testing

**Load Testing:**
- Simulate concurrent users (100, 500, 1000+)
- Test peak load scenarios
- Measure response times under load
- Identify bottlenecks
- Use tools: Locust, JMeter, or custom scripts

**Key Metrics:**
- Response time (p50, p95, p99)
- Requests per second
- Error rate
- Database query performance
- Memory usage

**Optimization Testing:**
- Database query optimization
- Caching effectiveness
- API response times
- Background job processing times

### 13.7 Integration Testing

**Payment Integration Tests:**
- Stripe payment creation and confirmation
- Webhook handling
- Crypto payment monitoring
- Payout processing
- Refund handling
- Use test/sandbox environments

**Email Integration Tests:**
- Email sending
- Template rendering
- Queue processing
- Delivery confirmation (if available)
- Use email testing services (Mailtrap, etc.)

**Database Integration Tests:**
- Transaction atomicity
- Concurrent update handling
- Constraint enforcement
- Cascade operations
- Migration testing

### 13.8 Test Coverage

**Coverage Goals:**
- Aim for 80%+ code coverage
- 100% coverage for critical paths:
  - Authentication
  - Payment processing
  - Bonus calculations
  - Rank calculations
- Use coverage.py to measure

**Coverage Reporting:**
- Generate coverage reports
- Identify untested code
- Track coverage over time
- Fail CI if coverage drops

---

## 14. Security Implementation

### 14.1 Input Validation

**Validation Strategy:**
- Use Pydantic models for all inputs
- Validate data types, formats, ranges
- Sanitize string inputs
- Validate email formats
- Check referential integrity

**Field Validation:**
- Email: Valid format, lowercase, max length
- Password: Complexity requirements
- Amounts: Positive numbers, max precision
- IDs: Integer, positive
- Dates: Valid format, reasonable range
- URLs: Valid format, allowed domains

**Custom Validators:**
- Create Pydantic validator functions
- Validate business rules
- Cross-field validation
- Async validators for database checks

### 14.2 SQL Injection Prevention

**Protection Measures:**
- Use SQLAlchemy ORM (not raw SQL)
- Use parameterized queries if raw SQL needed
- Never concatenate user input into queries
- Validate and sanitize all inputs
- Use proper escaping

**Safe Practices:**
- Use ORM query builder
- Use bound parameters
- Avoid dynamic table/column names from user input
- Limit database user permissions

### 14.3 Authentication Security

**Token Security:**
- Use strong secret key (random, 256+ bits)
- Store secret in environment variables
- Rotate secret periodically
- Short token expiration times
- Secure token transmission (HTTPS only)

**Session Management:**
- Stateless JWT tokens
- Optional: Track active sessions
- Implement token revocation list
- Logout invalidates refresh tokens
- Concurrent session limits

**Password Security:**
- Bcrypt with appropriate cost factor
- Never store plain text passwords
- Never log passwords
- Validate password strength
- Implement password history (prevent reuse)

### 14.4 Authorization

**Access Control:**
- Verify user identity on every request
- Check resource ownership
- Enforce role-based permissions
- Principle of least privilege
- Deny by default

**Permission Checks:**
- User can only access own data
- Admin can access all data
- Support can access specific modules
- Implement permission decorators/dependencies

### 14.5 Data Protection

**Sensitive Data:**
- Encrypt sensitive fields (payment info, SSN, etc.)
- Use application-level encryption
- Store encryption keys securely (not in code)
- Hash irreversible data (passwords)

**PII Handling:**
- Minimize data collection
- Encrypt at rest and in transit
- Implement data retention policies
- Provide data export (GDPR)
- Provide data deletion (right to be forgotten)

**Database Security:**
- Use connection pooling
- Encrypt database connections (SSL)
- Limit database user permissions
- Regular backups with encryption
- Test restoration procedures

### 14.6 API Security

**HTTPS Enforcement:**
- All API communication over HTTPS
- Redirect HTTP to HTTPS
- Use HSTS headers
- Valid SSL certificates

**CORS Configuration:**
- Configure allowed origins
- Restrict to known frontend domains
- Allow credentials if needed
- Validate origin on each request

**Security Headers:**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Content-Security-Policy
- X-XSS-Protection
- Strict-Transport-Security

**Rate Limiting:**
- Implement per-endpoint rate limits
- Track by user ID and/or IP address
- Progressive delays or blocks
- Whitelist for known good actors
- Monitor for abuse patterns

### 14.7 Logging and Monitoring

**Security Logging:**
- Log all authentication attempts
- Log authorization failures
- Log admin actions
- Log payment transactions
- Log data access and modifications
- Never log sensitive data (passwords, tokens, PII)

**Log Management:**
- Centralized logging system
- Structured logs (JSON format)
- Log retention policy
- Regular log review
- Alerting on suspicious patterns

**Monitoring:**
- Monitor failed login attempts
- Monitor unusual transaction patterns
- Monitor API error rates
- Monitor system resource usage
- Real-time alerts for critical issues

### 14.8 Vulnerability Prevention

**Common Vulnerabilities:**
- SQL Injection: Use ORM, parameterized queries
- XSS: Sanitize outputs, use CSP headers
- CSRF: Use CSRF tokens if needed
- Injection attacks: Validate inputs
- Broken authentication: Strong tokens, secure sessions
- Sensitive data exposure: Encryption, minimal logging
- Missing access control: Enforce on every request
- Security misconfiguration: Regular audits
- Using components with known vulnerabilities: Keep dependencies updated

**Security Best Practices:**
- Principle of least privilege
- Defense in depth
- Fail securely (fail closed, not open)
- Don't trust client input
- Keep software updated
- Regular security audits
- Penetration testing
- Security code reviews
- Dependency vulnerability scanning

### 14.9 Dependency Management

**Package Security:**
- Use requirements.txt with pinned versions
- Regular dependency updates
- Scan for known vulnerabilities (Safety, Snyk)
- Remove unused dependencies
- Review dependency licenses

**Update Strategy:**
- Test updates in staging first
- Monitor security advisories
- Subscribe to security mailing lists
- Have rollback plan
- Document dependency versions

---

## 15. Background Tasks Implementation

### 15.1 Celery Setup

**Celery Configuration:**
- Install Celery and Redis
- Configure broker URL (Redis)
- Configure result backend (Redis)
- Set up task serialization (JSON)
- Configure timezone and task routes

**Worker Setup:**
- Create Celery app instance
- Import all tasks
- Configure concurrency
- Set task time limits
- Configure retry policies

**Task Organization:**
- Group related tasks in modules
- Use meaningful task names
- Implement idempotent tasks
- Add logging to tasks
- Handle errors gracefully

### 15.2 Bonus Calculation Tasks

**Async Bonus Processing:**
- Trigger bonus calculation as Celery task
- Process unilevel bonuses asynchronously
- Batch bonus creation for efficiency
- Handle failures with retries
- Update transaction status on completion

**Task Implementation:**
1. Receive transaction details
2. Perform bonus calculations
3. Create bonus records in batch
4. Update user balances in transaction
5. Send notifications
6. Log completion

**Error Handling:**
- Retry on temporary failures (database locks)
- Alert on permanent failures
- Rollback on errors
- Store failed tasks for review

### 15.3 Scheduled Tasks

**Monthly Infinity Bonus:**
- Run on 1st of each month at configured time
- Calculate for all eligible users
- Create bonus records in batch
- Send summary email
- Generate admin report

**Daily Rank Recalculation:**
- Run daily to catch any missed rank changes
- Recalculate for users with turnover changes
- Award rank bonuses
- Send notifications

**Activity Status Update:**
- Run daily to mark inactive users
- Check last_activity_date against 30-day threshold
- Update activity_status
- Trigger compression recalculation if needed

**Report Generation:**
- Daily summary reports
- Weekly analytics reports
- Monthly financial reports
- Email to admins

### 15.4 Task Monitoring

**Task Status Tracking:**
- Monitor task execution
- Track success/failure rates
- Measure execution times
- Alert on task failures
- Dashboard for task status

**Celery Flower:**
- Install and configure Flower for monitoring
- Real-time task monitoring
- Worker status monitoring
- Task history and statistics
- Remote task control

---

## 16. Development Workflow

### 16.1 Development Environment

**Local Setup:**
- Install Python 3.11+
- Create virtual environment
- Install dependencies from requirements.txt
- Set up PostgreSQL locally or use Docker
- Set up Redis locally or use Docker
- Configure .env file with local settings
- Run database migrations
- Create test admin user
- Start development server

**Docker Setup (Alternative):**
- Create Dockerfile for application
- Create docker-compose.yml with:
  - FastAPI application
  - PostgreSQL database
  - Redis server
  - Celery worker
- Configure environment variables
- Start with docker-compose up

### 16.2 Database Migrations

**Alembic Workflow:**
1. Make model changes
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review generated migration
4. Edit if necessary
5. Test upgrade: `alembic upgrade head`
6. Test downgrade: `alembic downgrade -1`
7. Commit migration file

**Migration Best Practices:**
- Review auto-generated migrations
- Test both upgrade and downgrade
- Never modify existing migrations
- Add data migrations separately if needed
- Back up database before running in production

### 16.3 Git Workflow

**Branch Strategy:**
- main: Production-ready code
- develop: Integration branch
- feature/*: Feature branches
- bugfix/*: Bug fix branches
- hotfix/*: Emergency fixes

**Commit Guidelines:**
- Clear, descriptive commit messages
- Reference issue numbers
- Atomic commits (one logical change)
- Test before committing

### 16.4 Code Quality

**Code Standards:**
- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Keep functions small and focused
- Avoid code duplication

**Linting and Formatting:**
- Use black for formatting
- Use flake8 for linting
- Use mypy for type checking
- Run before committing
- Configure pre-commit hooks

**Code Review:**
- Review all code before merging
- Check for security issues
- Verify tests pass
- Ensure documentation updated
- Verify no sensitive data exposed

---

## 17. Final Implementation Checklist

### 17.1 Week 1-2 Deliverables
- [ ] Project structure created
- [ ] Database models defined
- [ ] Alembic migrations setup
- [ ] Authentication system implemented
- [ ] User registration and login working
- [ ] Email verification implemented
- [ ] Password reset flow working
- [ ] Basic dashboard endpoint
- [ ] JWT token generation and validation
- [ ] Environment configuration setup

### 17.2 Week 3-4 Deliverables
- [ ] Team tree structure implemented
- [ ] Team registration flow working
- [ ] Team query endpoints implemented
- [ ] Rank system configured
- [ ] Rank calculation logic implemented
- [ ] Unilevel bonus calculation working
- [ ] Dynamic compression implemented
- [ ] Rank bonus award system
- [ ] Transaction model and endpoints
- [ ] Bonus tracking system

### 17.3 Week 5-6 Deliverables
- [ ] Stripe integration completed
- [ ] Cryptocurrency payment integrated
- [ ] Payout request system implemented
- [ ] Payout approval workflow
- [ ] Infinity bonus calculation
- [ ] Monthly scheduled tasks setup
- [ ] Email notification system
- [ ] In-app notifications
- [ ] Payment webhooks handling
- [ ] Transaction history endpoints

### 17.4 Week 7-8 Deliverables
- [ ] Admin panel API completed
- [ ] User management endpoints
- [ ] Transaction management
- [ ] Bonus management
- [ ] Payout management
- [ ] Support ticket system
- [ ] Analytics endpoints
- [ ] Promotional materials API
- [ ] API documentation complete
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Code review completed
- [ ] Documentation finalized
- [ ] Source code handover package prepared

---

## 18. Documentation Deliverables

### 18.1 Technical Documentation

**API Documentation:**
- OpenAPI/Swagger specification
- Authentication guide
- Endpoint reference
- Request/response examples
- Error codes reference
- Rate limiting guide

**Database Documentation:**
- Entity-relationship diagram
- Table schemas
- Index documentation
- Migration history
- Backup procedures

**Architecture Documentation:**
- System architecture diagram
- Component interactions
- Data flow diagrams
- Security architecture

### 18.2 Setup Documentation

**Installation Guide:**
- Prerequisites
- Environment setup
- Configuration guide
- Database setup
- Dependency installation
- Initial data seeding

**Development Guide:**
- Local development setup
- Running tests
- Database migrations
- Background tasks
- Debugging tips

### 18.3 Operations Documentation

**Admin Guide:**
- Admin panel usage
- User management
- Transaction management
- Support ticket handling
- Report generation
- System configuration

**Maintenance Guide:**
- Backup procedures
- Database maintenance
- Log management
- Performance monitoring
- Security updates

---

## 19. Handover Package

### 19.1 Code Handover

**Source Code:**
- Complete codebase in Git repository
- All branches with clear history
- Tagged release version
- Clean, commented code
- No hardcoded secrets

**Configuration:**
- .env.example file with all required variables
- Configuration documentation
- Environment-specific settings guide
- Secret generation instructions

### 19.2 Documentation Package

**Include:**
- Technical documentation (architecture, database, API)
- Setup and installation guides
- Development workflow documentation
- Testing documentation
- Security documentation
- Operations and maintenance guides
- Troubleshooting guide

### 19.3 Support Materials

**Knowledge Transfer:**
- Code walkthrough notes
- Architecture decisions document
- Known issues and limitations
- Future enhancement suggestions
- Technical debt documentation

**Testing Materials:**
- Test coverage report
- Test data sets
- Performance test results
- Security audit results

---

## 20. Best Practices Summary

### 20.1 Code Quality
- Follow PEP 8 style guide
- Use type hints consistently
- Write comprehensive docstrings
- Keep functions focused and small
- Avoid deep nesting
- Use meaningful variable names
- Comment complex logic

### 20.2 Security
- Never trust user input
- Validate everything
- Use parameterized queries
- Encrypt sensitive data
- Implement proper authentication and authorization
- Log security events
- Keep dependencies updated
- Follow OWASP guidelines

### 20.3 Performance
- Use database indexes appropriately
- Implement caching where beneficial
- Optimize database queries
- Use pagination for large datasets
- Implement async operations for I/O
- Profile and optimize bottlenecks
- Monitor performance metrics

### 20.4 Maintainability
- Write clean, readable code
- Document complex logic
- Use consistent coding standards
- Implement comprehensive tests
- Version control everything
- Keep documentation updated
- Use meaningful commit messages

### 20.5 Reliability
- Implement proper error handling
- Use transactions for data consistency
- Implement retry logic for transient failures
- Validate data integrity
- Monitor system health
- Implement logging and alerting
- Plan for graceful degradation

---

## Appendix: Key Business Rules Reference

### Unilevel Bonus Percentages
- Level 1: 40%
- Level 2: 7%
- Level 3: 5%
- Levels 4-5: 3% each
- Levels 6-15: 1% each

### Activity Requirements
- User is active if: Made USDT purchase in last 30 days OR direct downline made first USDT purchase in last 30 days
- Dynamic compression applies to inactive users

### Rank Requirements Structure
- Total Team Turnover: 100%
- First Leg (Strongest): 50%
- Second Leg: 30%
- Other Legs Combined: 20%

### Infinity Bonus Eligibility
- Diamond and above ranks only
- Monthly recurring bonus
- Based on company or team volume
- Percentages: 10% to 25% depending on rank

---