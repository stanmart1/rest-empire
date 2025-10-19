-- Migration: Standardize Permission Naming Convention
-- Pattern: resource:action where action is one of: list, view, create, update, delete, or specific action

-- Clear existing permissions (will be recreated with standard names)
DELETE FROM role_permissions;
DELETE FROM user_permissions;
DELETE FROM permissions;

-- Insert Standardized Permissions
INSERT INTO permissions (name, resource, action, description) VALUES
-- User Management
('users:list', 'users', 'list', 'View list of users'),
('users:view', 'users', 'view', 'View user details'),
('users:create', 'users', 'create', 'Create new users'),
('users:update', 'users', 'update', 'Update user information'),
('users:delete', 'users', 'delete', 'Delete users'),
('users:suspend', 'users', 'suspend', 'Suspend/unsuspend users'),
('users:assign_roles', 'users', 'assign_roles', 'Assign roles to users'),
('users:verify_kyc', 'users', 'verify_kyc', 'Verify KYC documents'),

-- Transaction Management
('transactions:list', 'transactions', 'list', 'View transaction list'),
('transactions:view', 'transactions', 'view', 'View transaction details'),
('transactions:create', 'transactions', 'create', 'Create manual transactions'),
('transactions:approve', 'transactions', 'approve', 'Approve transactions'),
('transactions:refund', 'transactions', 'refund', 'Issue refunds'),
('transactions:export', 'transactions', 'export', 'Export transaction data'),

-- Payout Management
('payouts:list', 'payouts', 'list', 'View payout requests'),
('payouts:view', 'payouts', 'view', 'View payout details'),
('payouts:approve', 'payouts', 'approve', 'Approve payouts'),
('payouts:reject', 'payouts', 'reject', 'Reject payouts'),
('payouts:process', 'payouts', 'process', 'Process payouts'),
('payouts:export', 'payouts', 'export', 'Export payout data'),

-- Bonus Management
('bonuses:list', 'bonuses', 'list', 'View bonus records'),
('bonuses:view', 'bonuses', 'view', 'View bonus details'),
('bonuses:create', 'bonuses', 'create', 'Create manual bonuses'),
('bonuses:calculate', 'bonuses', 'calculate', 'Trigger bonus calculations'),
('bonuses:configure', 'bonuses', 'configure', 'Configure bonus settings'),

-- Support Management
('support:list', 'support', 'list', 'View support tickets'),
('support:view', 'support', 'view', 'View ticket details'),
('support:create', 'support', 'create', 'Create tickets'),
('support:update', 'support', 'update', 'Update tickets'),
('support:respond', 'support', 'respond', 'Respond to tickets'),
('support:close', 'support', 'close', 'Close tickets'),

-- Content Management
('content:list', 'content', 'list', 'View content'),
('content:view', 'content', 'view', 'View content details'),
('content:create', 'content', 'create', 'Create content'),
('content:update', 'content', 'update', 'Update content'),
('content:delete', 'content', 'delete', 'Delete content'),
('content:publish', 'content', 'publish', 'Publish content'),

-- Books Management
('books:list', 'books', 'list', 'View books'),
('books:view', 'books', 'view', 'View book details'),
('books:create', 'books', 'create', 'Create books'),
('books:update', 'books', 'update', 'Update books'),
('books:delete', 'books', 'delete', 'Delete books'),

-- Videos Management
('videos:list', 'videos', 'list', 'View videos'),
('videos:view', 'videos', 'view', 'View video details'),
('videos:create', 'videos', 'create', 'Create videos'),
('videos:update', 'videos', 'update', 'Update videos'),
('videos:delete', 'videos', 'delete', 'Delete videos'),

-- Blog Management
('blog:list', 'blog', 'list', 'View blog posts'),
('blog:view', 'blog', 'view', 'View blog details'),
('blog:create', 'blog', 'create', 'Create blog posts'),
('blog:update', 'blog', 'update', 'Update blog posts'),
('blog:delete', 'blog', 'delete', 'Delete blog posts'),
('blog:publish', 'blog', 'publish', 'Publish blog posts'),

-- Events Management
('events:list', 'events', 'list', 'View events'),
('events:view', 'events', 'view', 'View event details'),
('events:create', 'events', 'create', 'Create events'),
('events:update', 'events', 'update', 'Update events'),
('events:delete', 'events', 'delete', 'Delete events'),
('events:manage_registrations', 'events', 'manage_registrations', 'Manage registrations'),

-- Crypto Signals Management
('crypto_signals:list', 'crypto_signals', 'list', 'View crypto signals'),
('crypto_signals:view', 'crypto_signals', 'view', 'View signal details'),
('crypto_signals:create', 'crypto_signals', 'create', 'Create signals'),
('crypto_signals:update', 'crypto_signals', 'update', 'Update signals'),
('crypto_signals:delete', 'crypto_signals', 'delete', 'Delete signals'),

-- Promo Materials Management
('promo_materials:list', 'promo_materials', 'list', 'View promo materials'),
('promo_materials:create', 'promo_materials', 'create', 'Create promo materials'),
('promo_materials:update', 'promo_materials', 'update', 'Update promo materials'),
('promo_materials:delete', 'promo_materials', 'delete', 'Delete promo materials'),

-- Activation Packages Management
('packages:list', 'packages', 'list', 'View packages'),
('packages:view', 'packages', 'view', 'View package details'),
('packages:create', 'packages', 'create', 'Create packages'),
('packages:update', 'packages', 'update', 'Update packages'),
('packages:delete', 'packages', 'delete', 'Delete packages'),
('packages:assign', 'packages', 'assign', 'Assign packages to users'),

-- Analytics & Reports
('analytics:view', 'analytics', 'view', 'View analytics dashboard'),
('analytics:export', 'analytics', 'export', 'Export analytics data'),

-- System Configuration
('config:view', 'config', 'view', 'View system configuration'),
('config:update', 'config', 'update', 'Update system configuration'),

-- Role & Permission Management
('roles:list', 'roles', 'list', 'View roles'),
('roles:view', 'roles', 'view', 'View role details'),
('roles:create', 'roles', 'create', 'Create roles'),
('roles:update', 'roles', 'update', 'Update roles'),
('roles:delete', 'roles', 'delete', 'Delete roles'),

-- Verification Management
('verification:list', 'verification', 'list', 'View verifications'),
('verification:approve', 'verification', 'approve', 'Approve verifications'),
('verification:reject', 'verification', 'reject', 'Reject verifications')
ON CONFLICT (name) DO NOTHING;

-- Assign ALL permissions to super_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Assign permissions to finance_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'finance_admin'
AND p.name IN (
    'users:list', 'users:view',
    'transactions:list', 'transactions:view', 'transactions:create', 'transactions:approve', 'transactions:refund', 'transactions:export',
    'payouts:list', 'payouts:view', 'payouts:approve', 'payouts:reject', 'payouts:process', 'payouts:export',
    'bonuses:list', 'bonuses:view', 'bonuses:create', 'bonuses:calculate', 'bonuses:configure',
    'analytics:view', 'analytics:export'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to support_agent
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'support_agent'
AND p.name IN (
    'users:list', 'users:view',
    'support:list', 'support:view', 'support:create', 'support:update', 'support:respond', 'support:close',
    'transactions:list', 'transactions:view'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to content_manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'content_manager'
AND p.name IN (
    'content:list', 'content:view', 'content:create', 'content:update', 'content:delete', 'content:publish',
    'books:list', 'books:view', 'books:create', 'books:update', 'books:delete',
    'videos:list', 'videos:view', 'videos:create', 'videos:update', 'videos:delete',
    'blog:list', 'blog:view', 'blog:create', 'blog:update', 'blog:delete', 'blog:publish',
    'events:list', 'events:view', 'events:create', 'events:update', 'events:delete',
    'crypto_signals:list', 'crypto_signals:view', 'crypto_signals:create', 'crypto_signals:update', 'crypto_signals:delete',
    'promo_materials:list', 'promo_materials:create', 'promo_materials:update', 'promo_materials:delete',
    'packages:list', 'packages:view', 'packages:create', 'packages:update', 'packages:delete'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to moderator
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'moderator'
AND p.name IN (
    'users:list', 'users:view', 'users:suspend',
    'support:list', 'support:view', 'support:respond',
    'content:list', 'content:view'
)
ON CONFLICT DO NOTHING;
