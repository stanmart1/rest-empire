# FastAPI Backend Implementation Guide
## Rest Empire MLM Platform

**Version:** 1.0  
**Target Framework:** FastAPI 0.104+  
**Database:** PostgreSQL with SQLAlchemy  
**Timeline:** 8 Weeks  
**Purpose:** Step-by-step guide for AI coding assistants

---

## Project Overview

This guide provides a structured approach to building the Rest Empire MLM platform backend using FastAPI. Each section includes detailed requirements, architectural decisions, and implementation considerations without actual code.

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

---

## 1. Initial Setup & Project Structure

### 1.1 Directory Structure Creation

Create the following directory structure:

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

Create requirements.txt with essential packages:

**Core Framework:**
- FastAPI (latest stable)
- Uvicorn with standard extras for ASGI server
- Python-multipart for file uploads

**Database:**
- SQLAlchemy for ORM
- Alembic for migrations
- Psycopg2-binary for PostgreSQL driver
- Asyncpg for async PostgreSQL operations

**Authentication:**
- Python-jose with cryptography for JWT
- Passlib with bcrypt for password hashing
- Python-multipart for OAuth2

**Validation:**
- Pydantic with settings support
- Email-validator for email validation

**Background Tasks:**
- Celery for task queue
- Redis for Celery broker and caching

**Payment Processing:**
- Stripe SDK for EUR payments
- Web3.py or similar for cryptocurrency

**Email:**
- FastAPI-mail or similar for email notifications

**Testing:**
- Pytest with async support
- Pytest-asyncio
- HTTPX for testing async endpoints

**Additional:**
- Python-dotenv for environment variables
- Requests for external API calls

### 1.3 Environment Configuration

Create configuration management system with the following environment variables:

**Database:**
- DATABASE_URL (PostgreSQL connection string)
- DATABASE_POOL_SIZE
- DATABASE_MAX_OVERFLOW

**Security:**
- SECRET_KEY (for JWT signing)
- ALGORITHM (JWT algorithm, typically HS256)
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
- CORS_ORIGINS (comma-separated allowed origins)
- API_V1_PREFIX (e.g., /api/v1)

### 1.4 Initial Application Setup

Set up the main FastAPI application:

**Main Application (main.py):**
- Initialize FastAPI app with title, description, version
- Configure CORS middleware for frontend communication
- Add exception handlers for common errors
- Include all API routers from api/v1
- Add startup and shutdown event handlers
- Configure OpenAPI documentation

**Database Connection (database.py):**
- Create SQLAlchemy engine with connection pooling
- Set up SessionLocal for database sessions
- Create Base class for models to inherit
- Implement get_db dependency for dependency injection
- Add connection health check function

**Configuration (config.py):**
- Use Pydantic Settings for configuration management
- Load from environment variables
- Provide sensible defaults
- Validate configuration on startup
- Support different environments (dev, staging, prod)

---

## 2. Database Models & Schema

### 2.1 User Model

Create comprehensive user model with the following fields:

**Core Fields:**
- id (Primary key, auto-increment integer)
- email (Unique, indexed, not null)
- hashed_password (Not null)
- full_name (Optional)
- phone_number (Optional)
- is_verified (Boolean, default False)
- verification_token (String, nullable, for email verification)
- is_active (Boolean, default True for status tracking)
- is_inactive (Boolean, default False for compression logic)

**MLM Structure:**
- sponsor_id (Foreign key to users.id, self-referential)
- referral_code (Unique, indexed, auto-generated)
- registration_date (Datetime, auto-set on creation)

**Rank Information:**
- current_rank (String, default "Amber", indexed)
- rank_achieved_date (Datetime)
- highest_rank_achieved (String for tracking peak)

**Financial:**
- balance_eur (Decimal with precision for money)
- balance_dbsp (Decimal with precision)
- total_earnings (Decimal, aggregate of all bonuses)

**Security:**
- last_login (Datetime)
- password_reset_token (String, nullable)
- password_reset_expires (Datetime, nullable)

**Activity Tracking:**
- last_activity_date (Datetime for compression logic)
- activity_status (String: "active", "inactive", "suspended")

**Timestamps:**
- created_at (Datetime, auto-set)
- updated_at (Datetime, auto-update)

**Relationships:**
- sponsor (Self-referential relationship to parent user)
- downline (Back-reference to all recruited users)
- transactions (One-to-many to Transaction model)
- bonuses (One-to-many to Bonus model)
- payouts (One-to-many to Payout model)
- support_tickets (One-to-many to SupportTicket model)

**Indexes:**
- email (unique)
- referral_code (unique)
- sponsor_id
- current_rank
- is_active

### 2.2 Transaction Model

Track all financial transactions:

**Fields:**
- id (Primary key)
- user_id (Foreign key to users.id, not null)
- transaction_type (Enum: purchase, bonus, payout, fee, refund)
- amount (Decimal, not null)
- currency (String: EUR, USDT, DBSP)
- status (Enum: pending, completed, failed, cancelled)
- description (Text)
- metadata (JSON field for flexible additional data)

**Payment Information:**
- payment_method (String: stripe, crypto, manual)
- payment_reference (String, external transaction ID)
- payment_gateway_response (JSON)

**Related Transaction:**
- related_transaction_id (Foreign key for refunds/reversals)

**Timestamps:**
- created_at
- updated_at
- completed_at (When transaction finalized)

**Relationships:**
- user (Many-to-one to User)
- bonus (One-to-one if transaction is for bonus)

**Indexes:**
- user_id
- transaction_type
- status
- created_at (for date range queries)

### 2.3 Bonus Model

Track all bonus awards:

**Fields:**
- id (Primary key)
- user_id (Foreign key to users.id)
- bonus_type (Enum: rank_bonus, unilevel, infinity, direct)
- amount (Decimal)
- currency (String)
- calculation_date (Date when calculated)
- paid_date (Date when paid out, nullable)
- status (Enum: pending, paid, cancelled)

**Bonus-Specific Data:**
- level (Integer for unilevel depth, nullable)
- source_user_id (Foreign key to user who generated the bonus)
- source_transaction_id (Foreign key to transaction that triggered bonus)
- rank_achieved (String for rank bonuses)

**Calculation Details:**
- percentage (Decimal, the rate applied)
- base_amount (Decimal, amount before percentage)
- calculation_metadata (JSON for detailed breakdown)

**Timestamps:**
- created_at
- updated_at

**Relationships:**
- user (Many-to-one to User receiving bonus)
- source_user (Many-to-one to User who generated it)
- source_transaction (Many-to-one to Transaction)
- payout_transaction (One-to-one to Transaction when paid)

**Indexes:**
- user_id
- bonus_type
- status
- calculation_date

### 2.4 Rank Model

Define rank structure and requirements:

**Fields:**
- id (Primary key)
- name (String, unique: Amber, Jade, Pearl, etc.)
- level (Integer for ordering: 1-14)
- team_turnover_required (Decimal, total team sales)
- first_leg_requirement (Decimal, 50% leg requirement)
- second_leg_requirement (Decimal, 30% leg requirement)
- other_legs_requirement (Decimal, remaining requirement)
- bonus_amount (Decimal, one-time bonus for achieving rank)
- infinity_bonus_percentage (Decimal, nullable, for Diamond+)

**Display Information:**
- display_name (String for UI)
- icon_url (String, path to rank badge image)
- color_hex (String for UI theming)
- description (Text)

**Status:**
- is_active (Boolean, for temporarily disabling ranks)

**Timestamps:**
- created_at
- updated_at

**Indexes:**
- name (unique)
- level (unique)

### 2.5 TeamMember Model (Association Table)

Track team relationships and structure:

**Fields:**
- id (Primary key)
- user_id (Foreign key to users.id)
- ancestor_id (Foreign key to users.id, upline member)
- depth (Integer, how many levels deep from ancestor)
- path (String or Array, materialized path for quick queries)

**Turnover Tracking:**
- total_turnover (Decimal, aggregate of this branch)
- personal_turnover (Decimal, user's own purchases)
- last_turnover_update (Datetime)

**Timestamps:**
- created_at
- updated_at

**Relationships:**
- user (Many-to-one to User)
- ancestor (Many-to-one to User)

**Indexes:**
- user_id, ancestor_id (composite)
- ancestor_id, depth
- path (for hierarchical queries)

**Note:** This is a closure table pattern for efficient tree queries.

### 2.6 Payout Model

Manage withdrawal requests:

**Fields:**
- id (Primary key)
- user_id (Foreign key to users.id)
- amount (Decimal, requested amount)
- currency (String)
- status (Enum: pending, approved, processing, completed, rejected)
- payout_method (String: bank_transfer, crypto, etc.)

**Payout Details:**
- account_details (JSON, encrypted payment info)
- processing_fee (Decimal)
- net_amount (Decimal, after fees)

**Processing:**
- requested_at (Datetime)
- approved_at (Datetime, nullable)
- approved_by (Foreign key to admin user, nullable)
- completed_at (Datetime, nullable)
- rejection_reason (Text, nullable)

**External Reference:**
- external_transaction_id (String, from payment processor)
- external_response (JSON)

**Relationships:**
- user (Many-to-one to User)
- transaction (One-to-one to Transaction record)
- approved_by_admin (Many-to-one to User with admin role)

**Indexes:**
- user_id
- status
- requested_at

### 2.7 SupportTicket Model

Customer support system:

**Fields:**
- id (Primary key)
- user_id (Foreign key to users.id)
- subject (String, not null)
- category (Enum: bonuses, verification, payout, account, technical, other)
- message (Text, not null)
- status (Enum: open, in_progress, waiting_response, closed)
- priority (Enum: low, medium, high, urgent)

**Assignment:**
- assigned_to (Foreign key to admin/support user, nullable)
- assigned_at (Datetime, nullable)

**Timestamps:**
- created_at
- updated_at
- closed_at (Datetime, nullable)

**Relationships:**
- user (Many-to-one to User)
- assigned_admin (Many-to-one to User with support role)
- responses (One-to-many to SupportResponse model)

**Indexes:**
- user_id
- status
- category
- created_at

### 2.8 SupportResponse Model

Responses to support tickets:

**Fields:**
- id (Primary key)
- ticket_id (Foreign key to support_tickets.id)
- user_id (Foreign key to users.id, who responded)
- message (Text, not null)
- is_internal_note (Boolean, default False)

**Attachments:**
- attachments (JSON array of file paths, nullable)

**Timestamps:**
- created_at

**Relationships:**
- ticket (Many-to-one to SupportTicket)
- author (Many-to-one to User)

**Indexes:**
- ticket_id
- created_at

### 2.9 ActivityLog Model

Audit trail for important actions:

**Fields:**
- id (Primary key)
- user_id (Foreign key to users.id)
- action (String: login, rank_change, bonus_earned, payout_requested, etc.)
- entity_type (String: user, transaction, bonus, payout)
- entity_id (Integer, ID of affected entity)
- details (JSON for additional context)
- ip_address (String)
- user_agent (String)

**Timestamps:**
- created_at

**Relationships:**
- user (Many-to-one to User)

**Indexes:**
- user_id
- action
- entity_type, entity_id (composite)
- created_at

### 2.10 LegalDocument Model

Store accepted legal documents:

**Fields:**
- id (Primary key)
- user_id (Foreign key to users.id)
- document_type (Enum: privacy_policy, terms_conditions, terms_of_use, aml_policy, etc.)
- version (String, document version number)
- accepted_at (Datetime)
- ip_address (String, where accepted from)

**Timestamps:**
- created_at

**Relationships:**
- user (Many-to-one to User)

**Indexes:**
- user_id
- document_type

### 2.11 Database Migration Strategy

**Initial Migration:**
- Create all tables in order respecting foreign key dependencies
- Add all indexes for performance
- Set up constraints (unique, not null, foreign keys)
- Create necessary sequences for auto-increment

**Migration Best Practices:**
- Use Alembic for all schema changes
- Never modify existing migrations
- Test migrations both upgrade and downgrade
- Keep migrations small and focused
- Add descriptive messages to migrations
- Back up database before running migrations in production

**Seeding Data:**
- Create initial rank data (14 ranks from Amber to Double Ultima Diamond)
- Add default configuration values
- Create initial admin user (with secure password)

---

## 3. Authentication System

### 3.1 Password Security

**Password Hashing:**
- Use bcrypt algorithm via Passlib
- Set appropriate work factor (rounds) for security vs performance balance
- Hash passwords before storing in database
- Never store plain text passwords
- Never log or expose hashed passwords

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Optional: special character requirement
- Check against common password lists
- Validate on both frontend and backend

**Password Reset Flow:**
- Generate secure random token (UUID or similar)
- Store token hash in database with expiration (1-2 hours)
- Send reset link via email with token
- Validate token on reset request
- Invalidate token after successful reset
- Invalidate all other tokens for user after reset
- Log password reset events

### 3.2 JWT Token Management

**Token Structure:**
- Use JWT (JSON Web Tokens) for stateless authentication
- Include minimal claims: user_id, email, role, issued_at, expires_at
- Sign with HS256 algorithm using SECRET_KEY
- Set appropriate expiration times

**Access Tokens:**
- Short-lived (15-60 minutes)
- Used for API authentication
- Include in Authorization header as Bearer token
- Validate on every protected endpoint

**Refresh Tokens:**
- Longer-lived (7-30 days)
- Stored securely (httpOnly cookie or secure storage)
- Used only to obtain new access tokens
- Can be revoked if compromised
- Consider token rotation on refresh

**Token Generation:**
- Create access and refresh token pair on login
- Include necessary claims for authorization
- Sign with application secret key
- Return both tokens to client

**Token Validation:**
- Verify signature using secret key
- Check expiration timestamp
- Validate token structure
- Extract user information from valid token
- Handle expired tokens gracefully with clear error messages

### 3.3 Registration Endpoint Logic

**Registration Flow:**
1. Receive registration data (email, password, referral_code)
2. Validate email format and uniqueness
3. Validate password strength
4. Validate referral code exists and is active
5. Hash password using bcrypt
6. Generate unique referral code for new user
7. Generate email verification token
8. Create user record in database with sponsor relationship
9. Create team relationship records (closure table entries)
10. Send verification email
11. Return success response (without sensitive data)

**Referral Code Handling:**
- Extract sponsor user from referral code
- Validate sponsor is active and verified
- Create sponsor relationship (sponsor_id foreign key)
- Build team tree path
- Update team closure table for all ancestors

**Email Verification:**
- Generate unique verification token (UUID)
- Store token with user record
- Send email with verification link
- Set token expiration (24-48 hours)
- User remains unverified until email confirmed

**Data Validation:**
- Email must be unique
- Email must be valid format
- Password meets complexity requirements
- Referral code exists and belongs to active user
- All required fields provided
- Sanitize all inputs

### 3.4 Login Endpoint Logic

**Login Flow:**
1. Receive credentials (email, password)
2. Retrieve user by email
3. Verify password against hashed password
4. Check user is verified and active
5. Generate access token
6. Generate refresh token
7. Update last_login timestamp
8. Log login event
9. Return tokens and basic user info

**Security Checks:**
- Verify email exists
- Verify password matches hash
- Check email is verified (is_verified = True)
- Check account is active (is_active = True)
- Rate limit login attempts (prevent brute force)
- Log failed login attempts
- Consider account lockout after X failed attempts

**Response Data:**
- Access token
- Refresh token
- Token type (Bearer)
- User basic info (id, email, name, rank)
- Expiration times

**Error Handling:**
- Return generic error for invalid credentials (don't reveal which field is wrong)
- Clear error for unverified email
- Clear error for suspended account
- Rate limit error for too many attempts

### 3.5 Token Refresh Endpoint Logic

**Refresh Flow:**
1. Receive refresh token
2. Validate refresh token signature and expiration
3. Extract user ID from token
4. Verify user still exists and is active
5. Generate new access token
6. Optionally rotate refresh token
7. Return new token(s)

**Security Considerations:**
- Validate refresh token is not expired
- Verify user account is still active
- Consider refresh token rotation (issue new refresh token)
- Invalidate old refresh token if rotating
- Log token refresh events

### 3.6 Email Verification Endpoint Logic

**Verification Flow:**
1. Receive verification token from URL parameter
2. Find user with matching token
3. Check token hasn't expired
4. Set is_verified to True
5. Clear verification token
6. Log verification event
7. Optionally auto-login user
8. Return success response

**Edge Cases:**
- Token not found (invalid or already used)
- Token expired (offer resend option)
- User already verified
- Token format invalid

### 3.7 Password Reset Flow Implementation

**Request Reset:**
1. User provides email address
2. Find user by email
3. Generate reset token
4. Store token hash and expiration (1-2 hours)
5. Send reset email with link containing token
6. Return success (even if email doesn't exist - security)

**Confirm Reset:**
1. Receive token and new password
2. Find user by token
3. Verify token hasn't expired
4. Validate new password strength
5. Hash new password
6. Update user password
7. Invalidate reset token
8. Invalidate all existing sessions/refresh tokens
9. Log password change event
10. Send confirmation email
11. Return success

### 3.8 Protected Endpoint Dependencies

**Authentication Dependency:**
- Extract token from Authorization header
- Validate token signature
- Check expiration
- Extract user ID from token
- Retrieve user from database
- Verify user is active and verified
- Return user object for endpoint use
- Raise 401 Unauthorized if invalid

**Permission Dependencies:**
- Check user role (admin, user, support)
- Verify user has permission for specific action
- Check resource ownership (user can only access own data)
- Raise 403 Forbidden if insufficient permissions

**Rate Limiting:**
- Implement rate limiting on sensitive endpoints
- Track requests per user/IP
- Return 429 Too Many Requests if exceeded

---

## 4. User Management

### 4.1 Get Current User Profile

**Endpoint Logic:**
- Use authentication dependency to get current user
- Return user profile data
- Include: id, email, full_name, phone, current_rank, balances
- Include registration_date, referral_code
- Include verification and active status
- Exclude sensitive data (password, tokens)

**Response Structure:**
- User basic info
- Current rank with icon
- Available balances (EUR, DBSP)
- Total earnings
- Team statistics summary
- Sponsor information

### 4.2 Update User Profile

**Endpoint Logic:**
- Authenticate user
- Receive search/filter parameters
- Query team members with filters applied
- Join with user table for details
- Apply pagination (limit, offset)
- Sort by specified field (name, date, rank, turnover)
- Return paginated results with total count

**Query Optimization:**
- Use database indexes for filter fields
- Limit result set size
- Use query builder for dynamic filters
- Cache common filter combinations

### 5.6 Performance Tree View

**Tree Visualization Data:**
- Return hierarchical structure suitable for frontend tree rendering
- Include each node's:
  - User basic info (id, name, rank)
  - Direct children count
  - Total descendants count
  - Personal turnover
  - Team turnover
  - Active/inactive status
- Support lazy loading (load children on demand)
- Limit initial depth to 3-4 levels

**Data Format:**
- Each node contains user data + children array
- Children array initially empty or contains only direct children
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
- Handle case where user has no sponsor (top-level admin)

### 5.8 Team Turnover Updates

**Update Mechanism:**
- When user makes purchase, update personal_turnover
- Propagate turnover up the tree to all ancestors
- Update team_member.total_turnover for all ancestor relationships
- Use efficient bulk updates
- Trigger asynchronously if possible

**Implementation Steps:**
1. Transaction completes successfully
2. Add amount to user's personal_turnover
3. Query all ancestors from team_member table
4. For each ancestor, add amount to their total_turnover for this user
5. Commit all updates in single transaction
6. Trigger rank recalculation for affected users

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
7. Diamond (250,000 EUR) - Bonus: 5,000 EUR
8. Blue Diamond (500,000 EUR) - Bonus: 5,000 EUR
9. Green Diamond (1M EUR) - Bonus: 10,000 EUR
10. Purple Diamond (2M EUR) - Bonus: 20,000 EUR
11. Red Diamond (6M EUR) - Bonus: 80,000 EUR
12. Black Diamond (12M EUR) - Bonus: 120,000 EUR
13. Ultima Diamond (60M EUR) - Bonus: 960,000 EUR
14. Double Ultima Diamond (120M EUR) - Bonus: 1,200,000 EUR

### 6.2 Rank Calculation Logic

**Rank Check Trigger:**
- Run after every transaction that affects team turnover
- Run daily as batch job for all users
- Can be manually triggered by admin

**Calculation Process:**
1. Get user's current rank level
2. Calculate total team turnover (sum of all team members' purchases)
3. Calculate leg turnovers:
   - For each first-line member (direct recruit)
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
8. Check all ranks above current (user might qualify for multiple jumps)
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
- Minimum payout thresholds
- Transaction fees
- Rank update data (name, phone, address)
- Validate new data
- Update allowed fields only
- Exclude email change (requires separate flow)
- Exclude password change (requires separate flow)
- Log update event
- Return updated profile

**Allowed Updates:**
- Full name
- Phone number
- Profile photo upload
- Communication preferences

**Restrictions:**
- Cannot change email directly
- Cannot change rank manually
- Cannot change sponsor
- Cannot change financial data

### 4.3 Change Email Address

**Email Change Flow:**
1. User requests email change with new email and password
2. Verify current password
3. Validate new email format and uniqueness
4. Generate verification token for new email
5. Send verification email to new address
6. Store pending email change in temporary table
7. User clicks verification link
8. Update email address
9. Send confirmation to both old and new email
10. Log change event

**Security:**
- Require password confirmation
- Verify new email is unique
- Notify old email of change
- Allow old email to report unauthorized change

### 4.4 Change Password

**Password Change Flow:**
1. Authenticate user
2. Receive current password and new password
3. Verify current password is correct
4. Validate new password strength
5. Check new password != old password
6. Hash new password
7. Update user password
8. Invalidate all refresh tokens
9. Send confirmation email
10. Log password change
11. Return success

**Validation:**
- Current password must be correct
- New password meets complexity requirements
- New password different from current
- Confirm new password matches

### 4.5 User Dashboard Data

**Endpoint Logic:**
- Authenticate user
- Aggregate dashboard metrics:
  - Available balances (EUR, DBSP)
  - Current rank with progress to next
  - Team size (first line, total team)
  - Recent earnings (last 30 days)
  - Pending payouts
  - Recent transactions (last 10)
  - Team turnover breakdown
  - Rank progress percentage

**Performance:**
- Cache frequently accessed data (Redis)
- Use database aggregations efficiently
- Return pre-calculated values where possible
- Lazy load heavy computations

### 4.6 Referral Link Management

**Get Referral Link:**
- Return user's unique referral code
- Generate complete registration URL
- Provide QR code generation option
- Track referral link clicks (optional)

**Referral Statistics:**
- Total referrals (direct)
- Active referrals
- Referrals by date/month
- Conversion rate

### 4.7 Activity Status Management

**Activity Tracking:**
- Update last_activity_date on significant actions
- Monitor for 30-day inactivity threshold
- Automatically set activity_status to "inactive" after 30 days
- Actions that count as activity:
  - Making a purchase
  - Logging in (optional)
  - Downline making first purchase

**Reactivation Logic:**
- User makes USDT purchase → activate for 30 days
- Direct downline makes first USDT purchase → activate for 30 days
- Set activity_status back to "active"
- Update last_activity_date
- Trigger dynamic compression recalculation

### 4.8 User Verification Process

**Manual Verification:**
- Admin can manually verify users
- Verification status affects bonus eligibility
- Store verification method (email, manual, kyc)
- Store verification timestamp
- Log verification by admin

**KYC Integration (Optional):**
- Accept document uploads
- Store document references securely
- Allow admin review of documents
- Update verification status on approval
- Notify user of verification status changes

---

## 5. Team Tree Structure

### 5.1 Team Tree Data Structure

**Closure Table Implementation:**
- Store all ancestor-descendant relationships
- Each relationship includes depth (levels between users)
- Store materialized path for quick subtree queries
- Update on every new registration

**Advantages:**
- Fast retrieval of all descendants at any depth
- Efficient upline/downline queries
- Simple to understand and maintain
- Handles multiple inheritance paths if needed

**Structure:**
- user_id: The descendant
- ancestor_id: The ancestor (or self, where depth=0)
- depth: Number of levels between them
- path: Materialized path string (e.g., "1.5.23.45")

### 5.2 Team Registration Process

**When New User Registers:**
1. Get sponsor user from referral code
2. Create user record with sponsor_id
3. Copy all sponsor's team relationships:
   - For each ancestor of sponsor (including sponsor):
   - Create team_member record: (new_user, ancestor, depth+1)
4. Create self-reference: (new_user, new_user, 0)
5. Build materialized path: sponsor_path + "." + new_user_id
6. Store path in team_member record
7. Initialize turnover counters to 0

### 5.3 Get Team Tree Endpoint

**Endpoint Logic:**
- Authenticate user
- Get depth parameter (default: all levels, max: 15 for unilevel)
- Query team_members where ancestor_id = user_id
- Filter by depth if specified
- Include user details for each team member:
  - Name, email, rank
  - Registration date
  - Verification status
  - Activity status
  - Personal turnover
  - Team size
- Return hierarchical structure or flat array with depth

**Performance Optimization:**
- Limit depth to prevent huge queries
- Paginate results for large teams
- Cache team structure with short TTL
- Use database indexes on ancestor_id and depth

### 5.4 Team Statistics Calculations

**Team Metrics:**
- First line count (depth = 1)
- Total team count (all depths)
- Active members count
- Inactive members count
- Team turnover by leg
- Rank distribution in team

**Leg Analysis:**
- Identify first-line members (direct recruits)
- Calculate total team size under each first-line member
- Calculate total turnover for each leg
- Sort legs by turnover (strongest, second strongest, others)
- Return top 2 legs + combined others

**Calculation Method:**
- Use recursive queries or closure table
- Sum turnovers from team_member records
- Group by first-line member for leg analysis
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
- Receive