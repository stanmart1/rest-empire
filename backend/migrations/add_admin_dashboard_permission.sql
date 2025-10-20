-- Add admin_dashboard:view permission
INSERT INTO permissions (name, resource, action, description) VALUES
('admin_dashboard:view', 'admin_dashboard', 'view', 'View admin dashboard')
ON CONFLICT (name) DO NOTHING;

-- Assign to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
AND p.name = 'admin_dashboard:view'
ON CONFLICT DO NOTHING;

-- Assign to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name = 'admin_dashboard:view'
ON CONFLICT DO NOTHING;
