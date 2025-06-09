-- Script to find Damon's current UUID before updating
SELECT 
    'Current Damon record:' as info,
    id as current_uuid, 
    name, 
    role, 
    is_active,
    created_at
FROM users 
WHERE name = 'Damon';

-- Check related records
SELECT 
    'Time entries count:' as info,
    COUNT(*) as count,
    user_id
FROM time_entries 
WHERE user_id IN (SELECT id FROM users WHERE name = 'Damon')
GROUP BY user_id;

SELECT 
    'Truck assignments:' as info,
    truck_id,
    user_id
FROM user_truck_assignments 
WHERE user_id IN (SELECT id FROM users WHERE name = 'Damon');

SELECT 
    'Current truck assignments:' as info,
    id as truck_id,
    current_driver_id,
    current_mammographer_id
FROM trucks 
WHERE current_driver_id IN (SELECT id FROM users WHERE name = 'Damon')
   OR current_mammographer_id IN (SELECT id FROM users WHERE name = 'Damon');
