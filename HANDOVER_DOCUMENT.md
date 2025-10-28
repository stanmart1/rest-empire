# Project Handover Document
# Opened Seal and Rest Empire - MLM Platform

**Project Name:** Opened Seal and Rest Empire  
**Project Type:** Multi-Level Marketing (MLM) Platform  
**Handover Date:** October 28, 2025  
**Document Version:** 1.0

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Environment Setup](#environment-setup)
5. [Database Information](#database-information)
6. [Key Features](#key-features)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Payment Integration](#payment-integration)
9. [Deployment Information](#deployment-information)
10. [Important Credentials](#important-credentials)
11. [Known Issues & Limitations](#known-issues--limitations)
12. [Future Enhancements](#future-enhancements)
13. [Support & Maintenance](#support--maintenance)
14. [Documentation References](#documentation-references)

---

## Project Overview

### Purpose
A comprehensive MLM (Multi-Level Marketing) platform that enables users to:
- Build and manage referral networks
- Earn bonuses through multiple compensation plans
- Track team performance and earnings
- Access educational resources and trading signals
- Request and receive payouts

### Target Users
- **End Users**: Network marketers building their teams
- **Administrators**: Platform managers handling operations
- **Super Admins**: System administrators with full access

### Business Model
- Users purchase activation packages to unlock earning potential
- Three bonus types: Unilevel, Rank Bonus, and Infinity Bonus
- Commission-based earnings from team activations
- Rank advancement system with increasing benefits

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: OpenAPI/Swagger (auto-generated)
- **CORS**: Enabled for frontend communication

### Third-Party Integrations
- **Chatbase**: AI-powered help chatbot
- **Payment Gateways**:
  - GTpay
  - Providus Bank
  - Paystack
  - Cryptocurrency (USDT)
  - Manual Bank Transfer

---

## System Architecture

### Application Structure

```
rest-empire/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── layout/      # Layout components (Sidebar, Topbar, Footer)
│   │   │   ├── common/      # Common components (Badges, Cards)
│   │   │   ├── admin/       # Admin-specific components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── pages/           # Page components
│   │   │   ├── auth/        # Authentication pages
│   │   │   ├── admin/       # Admin pages
│   │   │   └── bonuses/     # Bonus-related pages
│   │   ├── contexts/        # React contexts (Auth, etc.)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries
│   │   ├── services/        # API service layer
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── .env                 # Environment variables
│
└── backend/                 # FastAPI backend application
    ├── app/
    │   ├── api/             # API endpoints
    │   ├── models/          # Database models
    │   ├── schemas/         # Pydantic schemas
    │   ├── services/        # Business logic
    │   └── core/            # Core configurations
    └── .env                 # Environment variables
```


### Frontend-Backend Communication
- Frontend communicates with backend via REST API
- Base URL configured in `.env` file (`VITE_API_BASE_URL`)
- JWT tokens stored in localStorage for authentication
- Axios used for HTTP requests with interceptors for auth

### Database Schema
- Users table with referral relationships
- Transactions for all financial activities
- Bonuses for commission tracking
- Payouts for withdrawal requests
- Activation packages and user activations
- Content tables (books, videos, events, crypto signals)
- Admin configuration tables

---

## Environment Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- PostgreSQL 13+
- Git

### Frontend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd rest-empire/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_CHATBASE_ID=YfB_Xl2G0cigz7kGXZcD7
```

4. **Run development server**
```bash
npm run dev
```
Access at: http://localhost:5173

5. **Build for production**
```bash
npm run build
```
Output in `dist/` folder

### Backend Setup

1. **Navigate to backend directory**
```bash
cd rest-empire/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
Create `.env` file with database and API configurations

5. **Run database migrations**
```bash
alembic upgrade head
```

6. **Start development server**
```bash
uvicorn app.main:app --reload
```
Access at: http://localhost:8000
API docs at: http://localhost:8000/docs

---

## Database Information

### Database: PostgreSQL

**Why PostgreSQL?**
- ACID compliance for financial transactions
- Excellent support for complex queries (recursive for team trees)
- JSON support for flexible configurations
- Reliable and scalable
- Strong data integrity features

### Key Tables

**users**
- User accounts and authentication
- Referral relationships (sponsor_id)
- Balance tracking (NGN and USDT)
- Rank and activation status

**transactions**
- All financial transactions
- Payment method tracking
- Status and reference numbers

**bonuses**
- Unilevel, rank, and infinity bonuses
- Source user and level tracking
- Payment status

**payouts**
- Withdrawal requests
- Bank details and crypto addresses
- Approval workflow

**activation_packages**
- Available packages for purchase
- Pricing and features
- Duration and benefits

**user_activations**
- User's purchased packages
- Activation and expiry dates
- Payment tracking

**books, videos, events, crypto_signals**
- Content management tables
- User access control

**config_settings**
- Platform configuration
- Payment gateway settings
- Bonus configurations

### Database Backup
- Recommended: Daily automated backups
- Keep at least 30 days of backups
- Test restore procedures regularly
- Store backups securely off-site

---

## Key Features

### User Features

**1. Authentication & Registration**
- Email/password registration
- Referral code tracking
- JWT-based authentication
- Password reset functionality

**2. Dashboard**
- Balance overview (NGN and USDT)
- Referral link with copy function
- Rank status and progress
- Team statistics
- Recent earnings summary

**3. Team Management**
- Team tree view (expandable hierarchy)
- Team list view with search and filters
- Leg breakdown (50%, 30%, 20%)
- Member details and statistics

**4. Bonuses**
- Three bonus types: Unilevel, Rank, Infinity
- Bonus history with filtering
- Visual charts and trends
- Detailed transaction records

**5. Account Activation**
- Multiple package options
- Payment method selection
- Payment proof upload
- Status tracking

**6. Rank System**
- Six ranks: Amber, Pearl, Sapphire, Ruby, Emerald, Diamond
- Rank requirements display
- Progress tracking
- Rank achievement history

**7. Transactions**
- Complete transaction history
- Filtering and search
- Status tracking
- Reference numbers

**8. Payouts**
- Withdrawal requests
- Bank account management
- Crypto wallet setup
- Payout history and status

**9. Profile & Settings**
- Profile information update
- Password change
- Payment details management
- Notification preferences

**10. Resources**
- Digital book library
- Crypto trading signals
- Video gallery
- Promotional materials
- Company events

**11. Support**
- Help chatbot (Chatbase integration)
- Support ticket system
- FAQ page
- Contact information

### Admin Features

**1. Admin Dashboard**
- Key metrics and statistics
- User growth charts
- Revenue trends
- Rank distribution
- Transaction overview

**2. User Management**
- View all users
- User details modal
- Account activation management
- User deletion
- Role management

**3. Transaction Management**
- View all transactions
- Filter and search
- Transaction statistics
- Payment method tracking

**4. Payout Processing**
- Review payout requests
- Approve/reject payouts
- View bank details
- Process payments
- Track completion

**5. Verification Management**
- Review payment proofs
- Approve/reject verifications
- Activate user accounts
- Track verification status

**6. Financial Management**
- Revenue tracking
- Expense monitoring
- Cash flow analysis
- Financial reports

**7. Bonus Management**
- View bonus payments
- Configure bonus settings
- Monitor distributions
- Manual adjustments

**8. Activation Packages**
- Create/edit packages
- Set pricing and features
- Enable/disable packages
- Track sales

**9. Content Management**
- Books: Upload and manage
- Crypto Signals: Create and update
- Events: Schedule and manage
- Videos: Upload and organize
- Promo Materials: Add and categorize

**10. Platform Settings**
- Payout configuration
- Payment gateway setup
- Bonus settings
- Email configuration
- System settings
- Referral settings

**11. Support Management**
- View support tickets
- Respond to users
- Manage ticket status
- Priority assignment

---

## User Roles & Permissions

### Role Hierarchy

**1. Super Admin**
- Full system access
- All permissions granted
- Can manage other admins
- Access to all settings

**2. Admin (Various Types)**
- Finance Admin: Financial operations
- Support Admin: User support
- Content Admin: Content management
- Custom roles with specific permissions

**3. Regular User**
- Standard user features
- No admin access
- Team building and earnings

### Permission System

Permissions are granular and include:
- `users:view`, `users:edit`, `users:delete`
- `transactions:view`, `transactions:edit`
- `payouts:view`, `payouts:approve`
- `verifications:view`, `verifications:approve`
- `config:view`, `config:edit`
- `config:payment_gateways`, `config:bonus_settings`
- `roles:list`, `roles:create`, `roles:edit`, `roles:delete`
- `content:view`, `content:edit`, `content:delete`

### Role Management
- Admins can create custom roles
- Assign specific permissions to roles
- Assign roles to users
- Modify role permissions as needed

---

## Payment Integration

### Supported Payment Methods

**1. GTpay**
- Online payment gateway
- Card payments
- Configuration: Merchant ID, API Key, Callback URL
- Status: Can be enabled/disabled in settings

**2. Providus Bank**
- Dynamic virtual account generation
- Automatic payment confirmation
- Configuration: Account number, Bank code, API Key
- Status: Can be enabled/disabled in settings

**3. Paystack**
- Card and bank payments
- Popular in Nigeria
- Configuration: Public Key, Secret Key, Callback URL
- Status: Can be enabled/disabled in settings

**4. Cryptocurrency (USDT)**
- Manual crypto payments
- USDT on TRC20 or ERC20
- Configuration: Wallet address
- Status: Can be enabled/disabled in settings

**5. Bank Transfer**
- Manual bank transfer
- User uploads payment proof
- Admin verification required
- Configuration: Bank details
- Status: Can be enabled/disabled in settings

### Payment Flow

**For Automated Gateways (GTpay, Providus, Paystack):**
1. User selects package
2. Chooses payment method
3. Redirected to payment gateway
4. Completes payment
5. Callback confirms payment
6. Account activated automatically

**For Manual Methods (Bank Transfer, Crypto):**
1. User selects package
2. Receives payment instructions
3. Makes payment
4. Uploads proof of payment
5. Admin reviews and verifies
6. Admin approves activation
7. Account activated

### Payment Gateway Configuration

All payment gateways are configured in:
- Admin Dashboard → Settings → Payment Gateways
- Each gateway has enable/disable toggle
- Configuration fields specific to each gateway
- Test mode available for development

---

## Deployment Information

### Frontend Deployment

**Recommended Platforms:**
- Vercel (recommended)
- Netlify
- AWS Amplify
- Railway

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist/
```

**Environment Variables Required:**
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_CHATBASE_ID`: Chatbase chatbot ID

**Important Notes:**
- Environment variables must be set in hosting platform
- Rebuild required after env variable changes
- Configure custom domain if needed
- Enable HTTPS (automatic on most platforms)

### Backend Deployment

**Recommended Platforms:**
- Railway (recommended)
- Heroku
- AWS EC2
- DigitalOcean
- Render

**Requirements:**
- PostgreSQL database
- Python 3.9+ runtime
- Environment variables configured
- CORS settings for frontend domain

**Environment Variables Required:**
- Database connection string
- JWT secret key
- Payment gateway credentials
- Email service credentials
- Other API keys

**Deployment Steps:**
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy application
5. Verify API endpoints
6. Test payment integrations

### Database Hosting

**Recommended Services:**
- Railway (included with app)
- Supabase
- AWS RDS
- DigitalOcean Managed Databases
- ElephantSQL

**Important:**
- Use managed PostgreSQL service
- Enable automated backups
- Set up connection pooling
- Monitor database performance
- Scale as needed

---

## Important Credentials

### Development Environment

**Frontend:**
- Local URL: http://localhost:5173
- API Base URL: http://localhost:8000

**Backend:**
- Local URL: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: Local PostgreSQL

### Production Environment

**Frontend:**
- Production URL: [Your production URL]
- Environment variables set in hosting platform

**Backend:**
- Production API URL: [Your API URL]
- Database: Managed PostgreSQL service

### Third-Party Services

**Chatbase:**
- Chatbot ID: YfB_Xl2G0cigz7kGXZcD7
- Help Page: https://www.chatbase.co/YfB_Xl2G0cigz7kGXZcD7/help
- Configuration: In frontend `.env` as `VITE_CHATBASE_ID`

**Payment Gateways:**
- Credentials stored in backend database
- Configured via admin settings panel
- Never commit credentials to repository

**Email Service:**
- SMTP credentials in backend environment
- Configured for transactional emails

### Security Notes

- Never commit `.env` files to repository
- Use `.env.example` as template
- Rotate credentials regularly
- Use strong passwords
- Enable 2FA where available
- Limit access to production credentials

---

## Known Issues & Limitations

### Current Limitations

1. **Chatbase Widget**
   - Only shows for non-admin users
   - Opens in new tab instead of embedded
   - Requires environment variable to be set

2. **Payment Gateways**
   - Manual verification required for bank transfers
   - Crypto payments need manual confirmation
   - Gateway testing should be done in sandbox mode

3. **Mobile Responsiveness**
   - Some admin tables may need horizontal scroll on small screens
   - Charts may be cramped on mobile devices

4. **Performance**
   - Large team trees (1000+ members) may load slowly
   - Consider pagination for very large datasets

5. **Bonus Calculations**
   - Calculated in real-time, may have slight delays
   - Complex team structures need optimization

### Known Bugs

None critical at handover. Minor issues:
- Some edge cases in rank calculation need testing
- Email notifications may need template improvements

### Browser Compatibility

**Fully Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Limited Support:**
- Internet Explorer: Not supported
- Older mobile browsers: May have issues

---

## Future Enhancements

### Planned Features

**Short Term (1-3 months):**
1. Email notification system improvements
2. SMS notifications for important events
3. Mobile app (React Native)
4. Advanced analytics dashboard
5. Automated bonus calculation optimization
6. Multi-language support

**Medium Term (3-6 months):**
1. Live chat support integration
2. Video conferencing for events
3. Gamification features (badges, achievements)
4. Social media integration
5. Advanced reporting tools
6. API for third-party integrations

**Long Term (6-12 months):**
1. AI-powered team building recommendations
2. Predictive analytics for earnings
3. Blockchain integration for transparency
4. NFT rewards system
5. Decentralized identity verification
6. Advanced fraud detection

### Technical Improvements

1. **Performance Optimization**
   - Implement caching strategies
   - Optimize database queries
   - Add CDN for static assets
   - Lazy loading for images

2. **Security Enhancements**
   - Implement rate limiting
   - Add CAPTCHA for sensitive operations
   - Enhanced audit logging
   - Regular security audits

3. **Testing**
   - Unit tests for critical functions
   - Integration tests for API endpoints
   - End-to-end tests for user flows
   - Load testing for scalability

4. **DevOps**
   - CI/CD pipeline setup
   - Automated deployment
   - Monitoring and alerting
   - Log aggregation

---

## Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor system health
- Check error logs
- Review support tickets
- Process pending verifications
- Approve payouts

**Weekly:**
- Database backup verification
- Security updates
- Performance monitoring
- User feedback review
- Content updates

**Monthly:**
- Full system audit
- Security patches
- Dependency updates
- Performance optimization
- Financial reconciliation

### Monitoring

**Key Metrics to Monitor:**
- Server uptime and response time
- Database performance
- Error rates
- User registration trends
- Transaction success rates
- Payout processing time
- Support ticket volume

**Recommended Tools:**
- Application monitoring: New Relic, Datadog
- Error tracking: Sentry
- Uptime monitoring: UptimeRobot
- Log management: Loggly, Papertrail

### Backup Strategy

**Database Backups:**
- Automated daily backups
- Keep 30 days of daily backups
- Weekly backups kept for 3 months
- Monthly backups kept for 1 year

**Code Backups:**
- Version controlled in Git
- Regular commits to repository
- Tagged releases for production
- Backup repository to multiple locations

**Configuration Backups:**
- Document all settings
- Export configurations regularly
- Keep encrypted copies of credentials

### Incident Response

**In Case of Issues:**

1. **System Down:**
   - Check server status
   - Review error logs
   - Notify users of downtime
   - Escalate to technical team
   - Document incident

2. **Payment Issues:**
   - Verify payment gateway status
   - Check transaction logs
   - Contact payment provider
   - Communicate with affected users
   - Process manual refunds if needed

3. **Security Breach:**
   - Immediately secure system
   - Change all credentials
   - Notify affected users
   - Document breach
   - Report to authorities if required
   - Implement additional security

4. **Data Loss:**
   - Stop all operations
   - Restore from latest backup
   - Verify data integrity
   - Communicate with users
   - Document incident
   - Review backup procedures

---

## Documentation References

### User Documentation
- **USER_GUIDE.md**: Comprehensive guide for end users
  - Getting started
  - Using all features
  - FAQ and troubleshooting
  - Tips for success

### Admin Documentation
- **ADMIN_GUIDE.md**: Complete administrator manual
  - Admin dashboard usage
  - User management
  - Financial operations
  - Content management
  - Platform settings
  - Best practices

### Technical Documentation
- **README.md**: Project setup and overview
- **API Documentation**: Available at `/docs` endpoint
- **Database Schema**: In backend models
- **Component Documentation**: In code comments

### Additional Resources
- Frontend: React, TypeScript, Tailwind CSS docs
- Backend: FastAPI, SQLAlchemy docs
- Database: PostgreSQL documentation
- Payment Gateways: Provider documentation

---

## Contact Information

### Development Team
- **Project Lead**: [Name and contact]
- **Frontend Developer**: [Name and contact]
- **Backend Developer**: [Name and contact]
- **Database Administrator**: [Name and contact]

### Support Contacts
- **Technical Support**: [Email/Phone]
- **Business Support**: [Email/Phone]
- **Emergency Contact**: [24/7 contact]

### External Services
- **Hosting Provider**: [Provider and support contact]
- **Database Provider**: [Provider and support contact]
- **Payment Gateway Support**: [Provider contacts]

---

## Handover Checklist

### Pre-Handover
- [ ] All code committed to repository
- [ ] Documentation completed and reviewed
- [ ] Environment variables documented
- [ ] Credentials securely transferred
- [ ] Database backups verified
- [ ] Production deployment tested
- [ ] Payment gateways tested
- [ ] Admin accounts created
- [ ] Training materials prepared

### During Handover
- [ ] Walkthrough of codebase
- [ ] Demo of all features
- [ ] Review of admin functions
- [ ] Explanation of deployment process
- [ ] Discussion of known issues
- [ ] Q&A session
- [ ] Access to all systems granted
- [ ] Emergency procedures reviewed

### Post-Handover
- [ ] Support period defined
- [ ] Communication channels established
- [ ] Monitoring setup verified
- [ ] Backup procedures tested
- [ ] First maintenance tasks completed
- [ ] Feedback collected
- [ ] Follow-up meeting scheduled

---

## Acceptance Criteria

The project is considered successfully handed over when:

1. **Technical Transfer Complete**
   - All code and documentation provided
   - Development environment set up
   - Production environment accessible
   - All credentials transferred

2. **Knowledge Transfer Complete**
   - Team trained on system usage
   - Admin functions demonstrated
   - Maintenance procedures understood
   - Support processes established

3. **Operational Readiness**
   - System running in production
   - Monitoring in place
   - Backups verified
   - Support team ready

4. **Documentation Complete**
   - User guide available
   - Admin guide available
   - Technical documentation complete
   - Handover document reviewed

---

## Final Notes

### Project Strengths
- Comprehensive MLM functionality
- Modern, responsive UI
- Robust admin controls
- Multiple payment options
- Scalable architecture
- Well-documented codebase

---

**This handover document should be reviewed and updated regularly as the system evolves.**

**Handover Completed By:** [Your Name]  
**Date:** October 28, 2025  
**Signature:** ___________________

**Received By:** [Recipient Name]  
**Date:** ___________________  
**Signature:** ___________________

---

*For questions or clarifications about this handover document, please contact the development team.*
