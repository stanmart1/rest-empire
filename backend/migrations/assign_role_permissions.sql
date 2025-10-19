-- Assign permissions to Administrator role (most permissions except critical system ones)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name NOT IN (
    'roles:create', 'roles:update', 'roles:delete', 'roles:assign_permissions',
    'users:assign_roles', 'config:delete'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to Support Agent
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'support_agent'
AND p.name IN (
    'users:view_list', 'users:view_details',
    'support:view_list', 'support:view_details', 'support:create', 'support:respond', 
    'support:assign', 'support:close', 'support:reopen',
    'transactions:view_list', 'transactions:view_details',
    'notifications:view'
)
ON CONFLICT DO NOTHING;

-- Assign permissions to Content Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'content_manager'
AND p.name IN (
    'content:view', 'content:create', 'content:update', 'content:delete', 'content:publish', 'content:unpublish',
    'books:view_list', 'books:view_details', 'books:create', 'books:update', 'books:delete', 'books:upload',
    'videos:view_list', 'videos:view_details', 'videos:create', 'videos:update', 'videos:delete',
    'blog:view_list', 'blog:view_details', 'blog:create', 'blog:update', 'blog:delete', 'blog:publish',
    'events:view_list', 'events:view_details', 'events:create', 'events:update', 'events:delete', 
    'events:manage_registrations', 'events:check_in',
    'crypto_signals:view_list', 'crypto_signals:view_details', 'crypto_signals:create', 
    'crypto_signals:update', 'crypto_signals:delete',
    'promo_materials:view_list', 'promo_materials:create', 'promo_materials:update', 'promo_materials:delete',
    'packages:view_list', 'packages:view_details', 'packages:create', 'packages:update', 'packages:delete',
    'upload:files', 'upload:images'
)
ON CONFLICT DO NOTHING;
