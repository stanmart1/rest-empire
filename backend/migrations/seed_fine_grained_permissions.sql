-- Clear existing permissions and role_permissions
DELETE FROM role_permissions;
DELETE FROM user_permissions;
DELETE FROM permissions;

-- Insert Fine-Grained Permissions
INSERT INTO permissions (name, resource, action, description) VALUES
-- User Management (detailed)
('users:view_list', 'users', 'view_list', 'View list of users'),
('users:view_details', 'users', 'view_details', 'View detailed user information'),
('users:create', 'users', 'create', 'Create new users'),
('users:update', 'users', 'update', 'Update user information'),
('users:delete', 'users', 'delete', 'Delete users'),
('users:suspend', 'users', 'suspend', 'Suspend users'),
('users:unsuspend', 'users', 'unsuspend', 'Unsuspend users'),
('users:verify_kyc', 'users', 'verify_kyc', 'Approve KYC verification'),
('users:reject_kyc', 'users', 'reject_kyc', 'Reject KYC verification'),
('users:view_kyc', 'users', 'view_kyc', 'View KYC documents'),
('users:assign_roles', 'users', 'assign_roles', 'Assign roles to users'),

-- Transaction Management (detailed)
('transactions:view_list', 'transactions', 'view_list', 'View transaction list'),
('transactions:view_details', 'transactions', 'view_details', 'View transaction details'),
('transactions:create_manual', 'transactions', 'create_manual', 'Create manual transactions'),
('transactions:approve', 'transactions', 'approve', 'Approve pending transactions'),
('transactions:reject', 'transactions', 'reject', 'Reject transactions'),
('transactions:refund', 'transactions', 'refund', 'Issue refunds'),
('transactions:cancel', 'transactions', 'cancel', 'Cancel transactions'),
('transactions:export', 'transactions', 'export', 'Export transaction data'),

-- Payout Management (detailed)
('payouts:view_list', 'payouts', 'view_list', 'View payout requests'),
('payouts:view_details', 'payouts', 'view_details', 'View payout details'),
('payouts:approve', 'payouts', 'approve', 'Approve payout requests'),
('payouts:reject', 'payouts', 'reject', 'Reject payout requests'),
('payouts:process', 'payouts', 'process', 'Process approved payouts'),
('payouts:cancel', 'payouts', 'cancel', 'Cancel payouts'),
('payouts:export', 'payouts', 'export', 'Export payout data'),

-- Bonus Management (detailed)
('bonuses:view_list', 'bonuses', 'view_list', 'View bonus records'),
('bonuses:view_details', 'bonuses', 'view_details', 'View bonus details'),
('bonuses:calculate', 'bonuses', 'calculate', 'Trigger bonus calculations'),
('bonuses:create_manual', 'bonuses', 'create_manual', 'Create manual bonuses'),
('bonuses:cancel', 'bonuses', 'cancel', 'Cancel bonuses'),
('bonuses:configure', 'bonuses', 'configure', 'Configure bonus settings'),
('bonuses:view_analytics', 'bonuses', 'view_analytics', 'View bonus analytics'),

-- Support Management (detailed)
('support:view_list', 'support', 'view_list', 'View support tickets'),
('support:view_details', 'support', 'view_details', 'View ticket details'),
('support:create', 'support', 'create', 'Create support tickets'),
('support:respond', 'support', 'respond', 'Respond to tickets'),
('support:assign', 'support', 'assign', 'Assign tickets to agents'),
('support:close', 'support', 'close', 'Close tickets'),
('support:reopen', 'support', 'reopen', 'Reopen closed tickets'),
('support:delete', 'support', 'delete', 'Delete tickets'),

-- Content Management (detailed)
('content:view', 'content', 'view', 'View content'),
('content:create', 'content', 'create', 'Create content'),
('content:update', 'content', 'update', 'Update content'),
('content:delete', 'content', 'delete', 'Delete content'),
('content:publish', 'content', 'publish', 'Publish content'),
('content:unpublish', 'content', 'unpublish', 'Unpublish content'),

-- Books Management
('books:view_list', 'books', 'view_list', 'View books list'),
('books:view_details', 'books', 'view_details', 'View book details'),
('books:create', 'books', 'create', 'Add new books'),
('books:update', 'books', 'update', 'Update books'),
('books:delete', 'books', 'delete', 'Delete books'),
('books:upload', 'books', 'upload', 'Upload book files'),

-- Videos Management
('videos:view_list', 'videos', 'view_list', 'View videos list'),
('videos:view_details', 'videos', 'view_details', 'View video details'),
('videos:create', 'videos', 'create', 'Add new videos'),
('videos:update', 'videos', 'update', 'Update videos'),
('videos:delete', 'videos', 'delete', 'Delete videos'),

-- Blog Management
('blog:view_list', 'blog', 'view_list', 'View blog posts'),
('blog:view_details', 'blog', 'view_details', 'View blog post details'),
('blog:create', 'blog', 'create', 'Create blog posts'),
('blog:update', 'blog', 'update', 'Update blog posts'),
('blog:delete', 'blog', 'delete', 'Delete blog posts'),
('blog:publish', 'blog', 'publish', 'Publish blog posts'),

-- Events Management
('events:view_list', 'events', 'view_list', 'View events'),
('events:view_details', 'events', 'view_details', 'View event details'),
('events:create', 'events', 'create', 'Create events'),
('events:update', 'events', 'update', 'Update events'),
('events:delete', 'events', 'delete', 'Delete events'),
('events:manage_registrations', 'events', 'manage_registrations', 'Manage event registrations'),
('events:check_in', 'events', 'check_in', 'Check-in attendees'),

-- Crypto Signals Management
('crypto_signals:view_list', 'crypto_signals', 'view_list', 'View crypto signals'),
('crypto_signals:view_details', 'crypto_signals', 'view_details', 'View signal details'),
('crypto_signals:create', 'crypto_signals', 'create', 'Create crypto signals'),
('crypto_signals:update', 'crypto_signals', 'update', 'Update crypto signals'),
('crypto_signals:delete', 'crypto_signals', 'delete', 'Delete crypto signals'),

-- Promo Materials Management
('promo_materials:view_list', 'promo_materials', 'view_list', 'View promo materials'),
('promo_materials:create', 'promo_materials', 'create', 'Create promo materials'),
('promo_materials:update', 'promo_materials', 'update', 'Update promo materials'),
('promo_materials:delete', 'promo_materials', 'delete', 'Delete promo materials'),

-- Activation Packages Management
('packages:view_list', 'packages', 'view_list', 'View activation packages'),
('packages:view_details', 'packages', 'view_details', 'View package details'),
('packages:create', 'packages', 'create', 'Create packages'),
('packages:update', 'packages', 'update', 'Update packages'),
('packages:delete', 'packages', 'delete', 'Delete packages'),
('packages:assign', 'packages', 'assign', 'Assign packages to users'),
('packages:view_payments', 'packages', 'view_payments', 'View package payments'),

-- Analytics & Reports
('analytics:view_dashboard', 'analytics', 'view_dashboard', 'View analytics dashboard'),
('analytics:view_users', 'analytics', 'view_users', 'View user analytics'),
('analytics:view_financial', 'analytics', 'view_financial', 'View financial analytics'),
('analytics:view_bonuses', 'analytics', 'view_bonuses', 'View bonus analytics'),
('analytics:export', 'analytics', 'export', 'Export analytics data'),

-- System Configuration
('config:view', 'config', 'view', 'View system configuration'),
('config:update', 'config', 'update', 'Update system configuration'),
('config:delete', 'config', 'delete', 'Delete configuration entries'),
('config:email_settings', 'config', 'email_settings', 'Manage email settings'),
('config:payment_gateways', 'config', 'payment_gateways', 'Manage payment gateways'),
('config:bonus_settings', 'config', 'bonus_settings', 'Configure bonus settings'),

-- Role & Permission Management
('roles:view_list', 'roles', 'view_list', 'View roles'),
('roles:view_details', 'roles', 'view_details', 'View role details'),
('roles:create', 'roles', 'create', 'Create roles'),
('roles:update', 'roles', 'update', 'Update roles'),
('roles:delete', 'roles', 'delete', 'Delete roles'),
('roles:assign_permissions', 'roles', 'assign_permissions', 'Assign permissions to roles'),

-- Verification Management
('verification:view_list', 'verification', 'view_list', 'View verification requests'),
('verification:approve', 'verification', 'approve', 'Approve verifications'),
('verification:reject', 'verification', 'reject', 'Reject verifications'),

-- Team Management
('team:view', 'team', 'view', 'View team structure'),
('team:view_details', 'team', 'view_details', 'View detailed team info'),

-- Notifications
('notifications:view', 'notifications', 'view', 'View notifications'),
('notifications:create', 'notifications', 'create', 'Create notifications'),
('notifications:send_bulk', 'notifications', 'send_bulk', 'Send bulk notifications'),

-- File Upload
('upload:files', 'upload', 'files', 'Upload files'),
('upload:images', 'upload', 'images', 'Upload images')
ON CONFLICT (name) DO NOTHING;

-- Assign ALL permissions to super_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;
