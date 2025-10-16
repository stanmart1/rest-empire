-- Fix foreign key constraint for activation packages
-- This allows packages to be deleted by setting package_id to NULL in user_activations

ALTER TABLE user_activations 
DROP CONSTRAINT IF EXISTS user_activations_package_id_fkey;

ALTER TABLE user_activations 
ADD CONSTRAINT user_activations_package_id_fkey 
FOREIGN KEY (package_id) 
REFERENCES activation_packages(id) 
ON DELETE SET NULL;
