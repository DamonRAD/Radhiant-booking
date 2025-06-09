-- Script to update Damon's UUID from current to e3922c5b-ecca-4908-98d1-8c8089a4a133
-- This script should be run carefully as it affects multiple tables

BEGIN;

-- First, let's find Damon's current UUID
-- (You'll need to replace 'current-uuid-here' with Damon's actual current UUID)

-- Step 1: Update time_entries table first (foreign key references)
UPDATE time_entries 
SET user_id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133'
WHERE user_id IN (
    SELECT id FROM users WHERE name = 'Damon'
);

-- Step 2: Update user_truck_assignments table
UPDATE user_truck_assignments 
SET user_id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133'
WHERE user_id IN (
    SELECT id FROM users WHERE name = 'Damon'
);

-- Step 3: Update trucks table if Damon is currently assigned as driver
UPDATE trucks 
SET current_driver_id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133'
WHERE current_driver_id IN (
    SELECT id FROM users WHERE name = 'Damon'
);

-- Step 4: Update trucks table if Damon is currently assigned as mammographer
UPDATE trucks 
SET current_mammographer_id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133'
WHERE current_mammographer_id IN (
    SELECT id FROM users WHERE name = 'Damon'
);

-- Step 5: Finally, update the users table (primary key)
UPDATE users 
SET id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133'
WHERE name = 'Damon';

-- Verify the update
SELECT 'Updated user:' as status, id, name, role 
FROM users 
WHERE id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133';

SELECT 'Time entries:' as status, COUNT(*) as count 
FROM time_entries 
WHERE user_id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133';

SELECT 'Truck assignments:' as status, COUNT(*) as count 
FROM user_truck_assignments 
WHERE user_id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133';

COMMIT;
