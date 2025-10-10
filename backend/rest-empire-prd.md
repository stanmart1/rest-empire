# Product Requirements Document (PRD)

## Rest Empire - Multi-Level Marketing Platform

**Version:** 1.0  
**Date:** October 2025  
**Document Owner:** Product Management  
**Status:** Draft

---

## 1. Executive Summary

Rest Empire is a web-based multi-level marketing (MLM) platform that enables distributors to build sales networks, earn commissions through multiple bonus structures, and track their team performance. The platform provides comprehensive tools for recruitment, rank advancement, and earnings management.

---

## 2. Product Overview

### 2.1 Product Vision
To provide a transparent, user-friendly platform that empowers distributors to build sustainable income streams through network marketing while maintaining compliance with regulatory requirements.

### 2.2 Target Audience
- **Primary:** Independent distributors seeking supplemental or primary income through network marketing
- **Secondary:** Team leaders and sponsors managing downline organizations
- **Tertiary:** Company administrators managing the platform

### 2.3 Success Metrics
- User registration and activation rate
- Active distributor retention (30/60/90 day)
- Average team size per distributor
- Monthly transaction volume
- Platform uptime and performance

---

## 3. Core Features & Requirements

### 3.1 User Authentication & Onboarding

#### 3.1.1 Registration
**Requirements:**
- Email-based registration with verification
- Referral link tracking for sponsor attribution
- Multi-document acceptance interface
- Password requirements: minimum 8 characters, alphanumeric + special characters

**Legal Documents Required:**
- Privacy Policy
- Terms and Conditions
- Terms of Use
- AML Policy
- Ethical Rules for Distributors
- General Disclaimer
- Financial Disclaimer
- Platform-specific disclaimers

**User Stories:**
- As a new user, I want to register using a referral link so that I'm properly connected to my sponsor
- As a new user, I want to review all legal documents before joining so that I understand my obligations

**Acceptance Criteria:**
- All checkboxes must be selected to enable "Confirm" button
- "Accept All" toggle enables/disables all checkboxes simultaneously
- Email verification required before account activation
- User status shows as "Not verified" until email confirmation

#### 3.1.2 Profile Setup
**Requirements:**
- Basic profile information (name, contact details, address)
- Profile photo upload (optional)
- Verification status display
- Account creation date tracking

---

### 3.2 Dashboard

#### 3.2.1 Main Dashboard View
**Requirements:**
- Display available balances (EUR and DBSP cryptocurrency)
- Show current rank status with visual indicators
- Display next rank target with progress tracking
- Payout action buttons for each currency
- Referral link with copy functionality
- QR code generation for referral link

**User Stories:**
- As a distributor, I want to see my available balance at a glance so that I know what I can withdraw
- As a distributor, I want to easily share my referral link so that I can recruit new members

**Components:**
- Balance cards with currency icons
- Rank status widget showing current and next rank
- Team turnover visualization
- Rank progress bar with percentage completion
- Quick action buttons

#### 3.2.2 Status Display
**Required Information:**
- User verification status
- Account active/inactive status
- Member since date
- Current rank with icon
- Next rank with requirements

---

### 3.3 Rank System

#### 3.3.1 Rank Structure
**Requirements:**
- Progressive rank system with clear advancement criteria
- Visual rank badges/icons for each level
- Team turnover requirements per rank
- Multi-leg qualification requirements

**Rank Levels:**
1. Amber (Starting rank)
2. Jade (5,000 EUR turnover)
3. Pearl (10,000 EUR)
4. Sapphire (25,000 EUR)
5. Ruby (50,000 EUR)
6. Emerald (100,000 EUR)
7. Diamond (250,000 EUR)
8. Blue Diamond (500,000 EUR)
9. Green Diamond (1,000,000 EUR)
10. Purple Diamond (2,000,000 EUR)
11. Red Diamond (6,000,000 EUR)
12. Black Diamond (12,000,000 EUR)
13. Ultima Diamond (60,000,000 EUR)
14. Double Ultima Diamond (120,000,000 EUR)

#### 3.3.2 My Status Page
**Requirements:**
- Current rank display with visual indicator
- Next rank target information
- Total team turnover tracking
- Leg-specific turnover breakdown (1st line, 2nd strongest, all other legs)
- Progress visualization
- Rank qualification rules explanation
- "Leg Rules" quick access button

**Acceptance Criteria:**
- Display turnover split percentages (50%, 30%, All Team)
- Show exact amounts required for next rank
- Highlight current rank with distinct styling
- Update in real-time as team makes purchases

---

### 3.4 Team Management

#### 3.4.1 My Team Overview
**Requirements:**
- Sponsor information display
- First-line team member count
- All team member count
- Search and filter functionality
- Performance tree visualization
- Member verification status indicators

**User Stories:**
- As a team leader, I want to see all my team members so that I can track my organization
- As a distributor, I want to search for specific team members so that I can quickly find their information

**Filter Options:**
- Registered date (Newest on Top, Oldest on Top)
- Rank level (All, specific ranks)
- Verification status
- Activity status (Active/Inactive)
- Search by name

#### 3.4.2 Performance Tree
**Requirements:**
- Visual tree diagram showing team structure
- Expandable/collapsible nodes
- Member information on hover/click
- Color-coding for rank levels
- Direct line vs indirect line distinction

---

### 3.5 Bonus Systems

#### 3.5.1 Rank Bonus
**Requirements:**
- Automatic bonus award on rank achievement
- One-time payment per rank milestone
- Bonus amount display in EUR
- Status tracking (earned/not earned)
- Historical bonus record

**Bonus Structure:**
| Rank | Team Turnover | 1st Line (50%) | 2nd Line (30%) | Bonus (EUR) |
|------|---------------|----------------|----------------|-------------|
| Diamond | 250,000 € | 125,000 € | 75,000 € | 5,000 |
| Blue Diamond | 500,000 € | 250,000 € | 150,000 € | 5,000 |
| Green Diamond | 1,000,000 € | 500,000 € | 300,000 € | 10,000 |
| Purple Diamond | 2,000,000 € | 1,000,000 € | 600,000 € | 20,000 |
| Red Diamond | 6,000,000 € | 3,000,000 € | 1,800,000 € | 80,000 |
| Black Diamond | 12,000,000 € | 6,000,000 € | 3,600,000 € | 120,000 |
| Ultima Diamond | 60,000,000 € | 30,000,000 € | 18,000,000 € | 960,000 |
| Double Ultima Diamond | 120,000,000 € | 60,000,000 € | 36,000,000 € | 1,200,000 |

**User Stories:**
- As a distributor, I want to see my next rank bonus so that I'm motivated to achieve it
- As a distributor, I want to track which bonuses I've earned so that I can verify my earnings

#### 3.5.2 Unilevel Bonus
**Requirements:**
- Multi-level commission structure
- Percentage-based earnings on team purchases
- Dynamic compression feature
- Active vs inactive partner distinction
- Real-time calculation

**Commission Structure:**
- Direct Bonus (Level 1): 40%
- Team Bonus Level 2: 7%
- Team Bonus Level 3: 5%
- Team Bonus Level 4-5: 3%
- Team Bonus Level 6-15: 1%

**Dynamic Compression:**
- Automatically redistributes commissions from inactive members
- Requires active status maintenance
- 30-day activity window
- Activation requirements:
  - Make a product purchase in USDT, OR
  - First-line partner makes first USDT payment

**User Stories:**
- As a distributor, I want to earn commissions on my team's purchases so that I benefit from team building
- As a distributor, I want my inactive team members' commissions redistributed so that active members are rewarded

**Acceptance Criteria:**
- Calculate commissions in real-time on each transaction
- Display percentage breakdown visually (pie chart)
- Show active vs inactive member impact
- Provide transparency on compression calculations

#### 3.5.3 Infinity Bonus
**Requirements:**
- Monthly recurring bonus for top performers
- Percentage-based passive income (10-25%)
- Rank-specific qualification
- Monthly countdown timer
- Bonus history tracking
- Goal achievement indicators

**Qualification Tiers:**
- Diamond: 10%
- Triple Ultima Diamond: 23%
- Blue Diamond: 11%
- Double Ultima Diamond: 21%
- Ultima Diamond: 25%

**User Stories:**
- As a high-ranking distributor, I want to earn passive income so that I'm rewarded for sustained performance
- As a distributor, I want to see when the next bonus period begins so that I can plan accordingly

**Components:**
- Countdown timer (days, hours, minutes, seconds)
- Current rank display
- Turnover tracking
- Level-specific turnover breakdown
- Progress visualization (circular gauge)
- Goal status indicator
- Your bonus amount display

---

### 3.6 Promotional Materials

#### 3.6.1 Promo Pages
**Requirements:**
- Pre-designed landing page templates
- Calculator tools (ULTIMA Calculator, BOOSTER SPLIT 2.0 Calculator)
- Contact information sharing toggle
- Profile link integration
- Responsive design for mobile sharing

**User Stories:**
- As a distributor, I want access to professional marketing materials so that I can effectively recruit new members
- As a distributor, I want to control what contact information I share so that I maintain privacy

**Acceptance Criteria:**
- "My Profile" button links to user's public profile
- Toggle for sharing contact information
- Visual previews of promo pages
- Direct links to calculator tools

#### 3.6.2 Presentations
**Requirements:**
- Downloadable presentation files
- Multiple language support
- Text and visual versions
- File format: PDF or PPTX
- Updated content versioning

**Components:**
- Presentation preview thumbnails
- Download buttons
- Description text
- File size indicators

---

### 3.7 Transactions & Payouts

#### 3.7.1 Transaction History
**Requirements:**
- Comprehensive transaction log
- Multiple transaction types (payouts, bonuses, reports, activation)
- Date range filtering
- Status filtering (all statuses, pending, completed, failed)
- Export functionality
- Search capability

**Transaction Types:**
- Payouts (withdrawals)
- Bonus history (rank, unilevel, infinity)
- Purchase reports
- Activation history

**User Stories:**
- As a distributor, I want to see all my transactions so that I can track my earnings and payments
- As a distributor, I want to filter transactions by type so that I can quickly find specific records

**Acceptance Criteria:**
- Display transaction date, type, amount, status
- Pagination for large datasets
- Empty state with helpful message
- Real-time updates for new transactions

#### 3.7.2 Payout System
**Requirements:**
- Minimum payout thresholds per currency
- Multiple payout methods
- Processing time indicators
- Fee disclosure
- Payout request confirmation
- Status tracking

**User Stories:**
- As a distributor, I want to request payouts easily so that I can access my earnings
- As a distributor, I want to know when my payout will be processed so that I can plan accordingly

---

### 3.8 Support System

#### 3.8.1 Support Page
**Requirements:**
- FAQ accordion interface
- Category-based organization
- Search functionality
- Direct support inquiry submission
- Recommendation to contact sponsor first

**Support Categories:**
- Change passport/address/phone
- Change email address
- Questions about bonuses
- Questions about verification
- Account recovery and safety

**User Stories:**
- As a distributor, I want to find answers to common questions so that I don't need to wait for support
- As a distributor, I want to submit support tickets so that I can get help with specific issues

**Acceptance Criteria:**
- Expandable/collapsible FAQ sections
- Search highlights relevant sections
- Support form includes required fields
- Confirmation message after submission

---

## 4. Technical Requirements

### 4.1 Platform Architecture
**Requirements:**
- Web-based application (responsive design)
- Mobile-optimized interface
- Desktop compatibility (Chrome, Firefox, Safari, Edge)
- Progressive Web App (PWA) capabilities

### 4.2 Security
**Requirements:**
- HTTPS encryption for all communications
- Two-factor authentication (optional)
- AML/KYC compliance features
- Data encryption at rest
- Regular security audits
- GDPR compliance
- Session timeout after inactivity

### 4.3 Performance
**Requirements:**
- Page load time: < 3 seconds
- API response time: < 500ms
- 99.9% uptime SLA
- Scalable infrastructure to handle traffic spikes
- CDN for static assets

### 4.4 Database
**Requirements:**
- Relational database for transactional data
- Real-time calculation engine for bonuses
- Audit trail for all financial transactions
- Backup strategy (daily automated backups)
- Data retention policy compliance

### 4.5 Integrations
**Required Integrations:**
- Payment gateways (multiple providers)
- Email service (transactional and marketing)
- SMS notifications
- Cryptocurrency wallets (USDT, DBSP)
- Analytics platform
- Customer support ticketing system

---

## 5. User Interface Requirements

### 5.1 Design Principles
- Clean, modern interface
- Blue and white color scheme (primary brand colors)
- Intuitive navigation
- Consistent iconography
- Accessibility compliance (WCAG 2.1 AA)

### 5.2 Navigation Structure
**Primary Navigation:**
- Dashboard
- My Status
- My Team
- Our Events
- Promo Materials

**Secondary Navigation (Bonuses):**
- Bonuses (overview)
- Rank bonus
- Unilevel Bonus
- Infinity Bonus

**Tertiary Navigation (Personal):**
- Payouts
- Transactions
- Activation
- Support

### 5.3 Components Library
**Required Components:**
- Cards (balance, status, team member)
- Progress bars and indicators
- Data tables with sorting/filtering
- Modal dialogs
- Toast notifications
- Empty states
- Loading indicators
- Form inputs and validation
- Buttons (primary, secondary, ghost)
- Badges and tags
- Accordion sections
- Countdown timers

---

## 6. Compliance & Legal

### 6.1 Regulatory Compliance
**Requirements:**
- Anti-Money Laundering (AML) procedures
- Know Your Customer (KYC) verification
- Income disclosure statements
- Clear compensation plan documentation
- Terms of service acceptance tracking

### 6.2 Data Protection
**Requirements:**
- GDPR compliance (for EU users)
- Data subject access requests handling
- Right to be forgotten implementation
- Data portability features
- Privacy policy enforcement

### 6.3 Financial Regulations
**Requirements:**
- Transaction reporting thresholds
- Tax documentation (1099 generation for US)
- Audit trail for all payouts
- Fraud detection mechanisms
- Chargeback handling procedures

---

## 7. User Roles & Permissions

### 7.1 Distributor (Standard User)
**Permissions:**
- View own dashboard and statistics
- Access team information (downline only)
- Request payouts
- Upload promotional materials usage
- Submit support tickets
- Update own profile

### 7.2 Team Leader (Same as Distributor with additional analytics)
**Additional Permissions:**
- Advanced team analytics
- Bulk team communication
- Performance reports

### 7.3 Administrator
**Permissions:**
- Full platform access
- User management (create, suspend, delete)
- Payout approval
- Bonus calculations override
- Support ticket management
- Content management
- System configuration
- Reporting and analytics

### 7.4 Support Agent
**Permissions:**
- View user accounts (read-only)
- Manage support tickets
- Communication with users
- Limited transaction history access

---

## 8. Notification System

### 8.1 Email Notifications
**Required Emails:**
- Welcome and verification email
- Rank achievement notification
- Bonus earned notification
- Payout processed confirmation
- Team member joins notification
- Weekly/monthly summary reports
- Security alerts

### 8.2 In-App Notifications
**Required Notifications:**
- Real-time transaction confirmations
- Rank progress updates
- Team activity alerts
- System maintenance notices
- Support ticket responses

### 8.3 SMS Notifications (Optional)
**Optional SMS:**
- Payout confirmations
- Security alerts
- High-value bonus notifications

---

## 9. Analytics & Reporting

### 9.1 User Analytics
**Required Metrics:**
- Daily active users
- Team growth rate
- Average team size
- Rank distribution
- Conversion rate (registration to first purchase)
- Retention metrics

### 9.2 Financial Analytics
**Required Metrics:**
- Total transaction volume
- Payout volume by period
- Bonus distribution by type
- Average earnings per distributor
- Top performers leaderboard

### 9.3 System Analytics
**Required Metrics:**
- Page load times
- Error rates
- API performance
- User journey mapping
- Feature adoption rates

---

## 10. Development Phases

### Phase 1: MVP (Months 1-3)
**Core Features:**
- User registration and authentication
- Basic dashboard
- Team tree visualization
- Simple rank system
- Manual payout processing
- Basic support system

### Phase 2: Enhanced Features (Months 4-6)
**Additional Features:**
- Automated bonus calculations
- Unilevel bonus implementation
- Rank bonus system
- Transaction history
- Promotional materials section
- Email notifications

### Phase 3: Advanced Features (Months 7-9)
**Advanced Features:**
- Infinity bonus system
- Dynamic compression
- Advanced analytics dashboard
- Mobile app development
- Third-party integrations
- Automated payout processing

### Phase 4: Optimization (Months 10-12)
**Optimization:**
- Performance optimization
- A/B testing implementation
- Advanced reporting
- International expansion features
- Enhanced security features

---

## 11. Success Criteria

### 11.1 Launch Criteria
- All MVP features functional
- Security audit passed
- Legal compliance verified
- Load testing completed (minimum 10,000 concurrent users)
- 95% of critical bugs resolved

### 11.2 Post-Launch Success Metrics (6 months)
- 10,000+ active distributors
- 70% user retention rate
- < 0.1% transaction error rate
- 99.9% uptime achieved
- Average user satisfaction score: 4.0/5.0

---

## 12. Risks & Mitigation

### 12.1 Technical Risks
**Risk:** System downtime during high-traffic periods  
**Mitigation:** Load balancing, auto-scaling infrastructure, stress testing

**Risk:** Data breach or security vulnerability  
**Mitigation:** Regular security audits, penetration testing, encryption standards

### 12.2 Business Risks
**Risk:** Regulatory changes in MLM industry  
**Mitigation:** Legal counsel on retainer, compliance monitoring, flexible system architecture

**Risk:** Payment processor issues  
**Mitigation:** Multiple payment provider integrations, backup processors

### 12.3 User Experience Risks
**Risk:** User confusion with complex bonus structures  
**Mitigation:** Comprehensive onboarding, tooltips, video tutorials, simplified visualizations

---

## 13. Appendices

### Appendix A: Glossary
- **Distributor:** Independent member who sells and recruits
- **Downline:** Team members recruited beneath a distributor
- **Upline:** Sponsor and their sponsors above a distributor
- **Leg:** A branch of team members stemming from one first-line member
- **Compression:** Redistribution of commissions from inactive members
- **USDT:** Tether cryptocurrency stablecoin
- **DBSP:** Platform-specific cryptocurrency

### Appendix B: Reference Documents
- Legal Terms and Conditions
- Privacy Policy
- AML Policy
- Compensation Plan Details
- API Documentation
- Brand Guidelines

### Appendix C: Contact Information
- Product Manager: [Contact]
- Technical Lead: [Contact]
- Legal Counsel: [Contact]
- Compliance Officer: [Contact]

---

**Document End**

*This PRD is a living document and will be updated as requirements evolve.*