-- Script to check for any records related to Damon or the specific UUID
-- This is a safe script that only reads data, doesn't modify anything

-- Check for users named Damon
SELECT 'Users named Damon:' as check_type, id, name, role, is_active, created_at
FROM users 
WHERE name = 'Damon';

-- Check for the specific UUID
SELECT 'User with specific UUID:' as check_type, id, name, role, is_active, created_at
FROM users 
WHERE id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133';

-- Check for time entries
SELECT 'Time entries for Damon:' as check_type, id, user_id, truck_id, sign_in_time, sign_out_time, is_auto_sign_out, total_hours
FROM time_entries
WHERE user_id IN (
    SELECT id FROM users WHERE name = 'Damon'
    UNION
    SELECT 'e3922c5b-ecca-4908-98d1-8c8089a4a133'::uuid
);

-- Check for truck assignments
SELECT 'Truck assignments for Damon:' as check_type, user_id, truck_id, assigned_at
FROM user_truck_assignments
WHERE user_id IN (
    SELECT id FROM users WHERE name = 'Damon'
    UNION
    SELECT 'e3922c5b-ecca-4908-98d1-8c8089a4a133'::uuid
);

-- Check if currently signed in to any truck
SELECT 'Trucks with Damon signed in:' as check_type, id as truck_id, current_driver_id, current_mammographer_id
FROM trucks
WHERE current_driver_id IN (
    SELECT id FROM users WHERE name = 'Damon'
    UNION
    SELECT 'e3922c5b-ecca-4908-98d1-8c8089a4a133'::uuid
)
OR current_mammographer_id IN (
    SELECT id FROM users WHERE name = 'Damon'
    UNION
    SELECT 'e3922c5b-ecca-4908-98d1-8c8089a4a133'::uuid
);
