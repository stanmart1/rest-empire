-- Insert Permissions
INSERT INTO permissions (name, resource, action, description) VALUES
-- User Management
('users:read', 'users', 'read', 'View user information'),
('users:write', 'users', 'write', 'Create and update users'),
('users:delete', 'users', 'delete', 'Delete users'),
('users:verify_kyc', 'users', 'verify_kyc', 'Approve KYC verification'),
('users:suspend', 'users', 'suspend', 'Suspend/unsuspend users'),

-- Transaction Management
('transactions:read', 'transactions', 'read', 'View transactions'),
('transactions:write', 'transactions', 'write', 'Create manual transactions'),
('transactions:refund', 'transactions', 'refund', 'Issue refunds'),
('transactions:approve', 'transactions', 'approve', 'Approve pending transactions'),

-- Payout Management
('payouts:read', 'payouts', 'read', 'View payout requests'),
('payouts:approve', 'payouts', 'approve', 'Approve payout requests'),
('payouts:reject', 'payouts', 'reject', 'Reject payout requests'),
('payouts:process', 'payouts', 'process', 'Process approved payouts'),

-- Bonus Management
('bonuses:read', 'bonuses', 'read', 'View bonus records'),
('bonuses:calculate', 'bonuses', 'calculate', 'Trigger bonus calculations'),
('bonuses:manual_create', 'bonuses', 'manual_create', 'Create manual bonuses'),
('bonuses:config', 'bonuses', 'config', 'Configure bonus settings'),

-- Support Management
('support:read', 'support', 'read', 'View support tickets'),
('support:respond', 'support', 'respond', 'Respond to tickets'),
('support:assign', 'support', 'assign', 'Assign tickets to agents'),
('support:close', 'support', 'close', 'Close tickets'),

-- Content Management
('content:read', 'content', 'read', 'View content'),
('content:write', 'content', 'write', 'Create and edit content'),
('content:delete', 'content', 'delete', 'Delete content'),
('content:publish', 'content', 'publish', 'Publish content'),

-- Analytics
('analytics:view', 'analytics', 'view', 'View analytics dashboard'),
('analytics:export', 'analytics', 'export', 'Export analytics data'),

-- System Configuration
('config:read', 'config', 'read', 'View system configuration'),
('config:write', 'config', 'write', 'Modify system configuration'),

-- Activation Packages
('packages:read', 'packages', 'read', 'View activation packages'),
('packages:write', 'packages', 'write', 'Create and edit packages'),
('packages:delete', 'packages', 'delete', 'Delete packages'),

-- Role Management
('roles:read', 'roles', 'read', 'View roles and permissions'),
('roles:write', 'roles', 'write', 'Create and edit roles'),
('roles:assign', 'roles', 'assign', 'Assign roles to users')
ON CONFLICT (name) DO NOTHING;

-- Insert Roles
INSERT INTO roles (name, display_name, description, is_system) VALUES
('super_admin', 'Super Administrator', 'Full system access', TRUE),
('finance_admin', 'Finance Administrator', 'Manage transactions, payouts, and bonuses', TRUE),
('support_agent', 'Support Agent', 'Handle customer support tickets', TRUE),
('content_manager', 'Content Manager', 'Manage content and resources', TRUE),
('moderator', 'Moderator', 'Limited user management and moderation', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to Super Admin (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Assign permissions to Finance Admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'finance_admin'
AND p.name IN (
    'users:read',
    'transactions:read', 'transactions:write', 'transactions:refund', 'transactions:approve',
    'payouts:read', 'payouts:approve', 'payouts:reject', 'payouts:process',
    'bonuses:read', 'bonuses:calculate', 'bonuses:manual_create', 'bonuses:config',
    'analytics:view', 'analytics:export'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to Support Agent
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'support_agent'
AND p.name IN (
    'users:read',
    'support:read', 'support:respond', 'support:assign', 'support:close',
    'transactions:read'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to Content Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'content_manager'
AND p.name IN (
    'content:read', 'content:write', 'content:delete', 'content:publish',
    'packages:read', 'packages:write', 'packages:delete'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to Moderator
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'moderator'
AND p.name IN (
    'users:read', 'users:suspend',
    'support:read', 'support:respond',
    'content:read'
)
ON CONFLICT DO NOTHING;

-- Migrate existing admin users to super_admin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.role = 'admin'
AND r.name = 'super_admin'
ON CONFLICT DO NOTHING;
