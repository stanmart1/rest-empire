-- Add missing permissions
INSERT INTO permissions (name, resource, action, description) VALUES
('support:assign', 'support', 'assign', 'Assign tickets to agents'),
('promo_materials:view', 'promo_materials', 'view', 'View promo material details'),
('verification:view', 'verification', 'view', 'View verification details'),
('config:email_settings', 'config', 'email_settings', 'Manage email settings'),
('config:payment_gateways', 'config', 'payment_gateways', 'Manage payment gateways'),
('config:bonus_settings', 'config', 'bonus_settings', 'Manage bonus settings'),
('finance:view', 'finance', 'view', 'View financial reports'),
('finance:manage', 'finance', 'manage', 'Manage financial operations'),
('transactions:delete', 'transactions', 'delete', 'Delete transactions')
ON CONFLICT (name) DO NOTHING;

-- Assign all new permissions to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
AND p.name IN (
    'support:assign',
    'promo_materials:view',
    'verification:view',
    'config:email_settings',
    'config:payment_gateways',
    'config:bonus_settings',
    'finance:view',
    'finance:manage',
    'transactions:delete'
)
ON CONFLICT DO NOTHING;
