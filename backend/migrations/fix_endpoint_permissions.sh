#!/bin/bash
# Script to fix all permission mismatches in admin endpoints

cd "$(dirname "$0")/.."

echo "Fixing permission mismatches in admin endpoints..."

# Fix admin_books.py
sed -i '' 's/books:view_list/books:list/g' app/api/v1/endpoints/admin_books.py
sed -i '' 's/books:view_details/books:view/g' app/api/v1/endpoints/admin_books.py

# Fix admin_videos.py  
sed -i '' 's/videos:view_list/videos:list/g' app/api/v1/endpoints/admin_videos.py
sed -i '' 's/videos:view_details/videos:view/g' app/api/v1/endpoints/admin_videos.py

# Fix admin_promo_materials.py
sed -i '' 's/promo_materials:view_list/promo_materials:list/g' app/api/v1/endpoints/admin_promo_materials.py

# Fix admin_support.py
sed -i '' 's/support:view_list/support:list/g' app/api/v1/endpoints/admin_support.py
sed -i '' 's/support:view_details/support:view/g' app/api/v1/endpoints/admin_support.py

# Fix admin_users.py
sed -i '' 's/users:view_list/users:list/g' app/api/v1/endpoints/admin_users.py
sed -i '' 's/users:view_details/users:view/g' app/api/v1/endpoints/admin_users.py

# Fix admin_bonuses.py
sed -i '' 's/bonuses:view_list/bonuses:list/g' app/api/v1/endpoints/admin_bonuses.py
sed -i '' 's/bonuses:view_details/bonuses:view/g' app/api/v1/endpoints/admin_bonuses.py
sed -i '' 's/bonuses:manual_create/bonuses:create/g' app/api/v1/endpoints/admin_bonuses.py

# Fix rbac.py
sed -i '' 's/roles:view_list/roles:list/g' app/api/v1/endpoints/rbac.py
sed -i '' 's/roles:view_details/roles:view/g' app/api/v1/endpoints/rbac.py
sed -i '' 's/users:view_details/users:view/g' app/api/v1/endpoints/rbac.py

echo "✅ All permission mismatches fixed!"
echo ""
echo "Summary of changes:"
echo "- Standardized all :view_list to :list"
echo "- Standardized all :view_details to :view"
echo "- Standardized all :manual_create to :create"
echo ""
echo "Next steps:"
echo "1. Run: python migrations/run_migration.py migrations/standardize_permissions.sql"
echo "2. Run: python migrations/run_migration.py migrations/remove_legacy_role_system.sql"
echo "3. Restart the application"
