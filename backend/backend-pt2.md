# FastAPI Backend Implementation Guide - Part 2
## Rest Empire MLM Platform (Sections 6-20)

*This is a continuation of the FastAPI Implementation Guide. For sections 1-5, see Part 1.*

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

###