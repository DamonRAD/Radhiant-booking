-- Script to completely remove Damon by specific UUID
-- This will check for both name "Damon" and UUID e3922c5b-ecca-4908-98d1-8c8089a4a133

DO $$
DECLARE
    specific_uuid UUID := 'e3922c5b-ecca-4908-98d1-8c8089a4a133';
    record_count INTEGER;
BEGIN
    -- Check if the specific UUID exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = specific_uuid) THEN
        RAISE NOTICE 'No user found with UUID: %', specific_uuid;
        
        -- Check if Damon exists with a different UUID
        IF EXISTS (SELECT 1 FROM users WHERE name = 'Damon') THEN
            RAISE NOTICE 'User Damon exists but with a different UUID';
        ELSE
            RAISE NOTICE 'No user named Damon exists in the database';
        END IF;
        
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user with UUID: %', specific_uuid;
    
    -- Check if this user is currently signed in to any truck
    IF EXISTS (SELECT 1 FROM trucks WHERE current_driver_id = specific_uuid OR current_mammographer_id = specific_uuid) THEN
        -- Sign out from any trucks
        UPDATE trucks SET current_driver_id = NULL WHERE current_driver_id = specific_uuid;
        UPDATE trucks SET current_mammographer_id = NULL WHERE current_mammographer_id = specific_uuid;
        RAISE NOTICE 'Signed out user from all trucks';
        
        -- Close any open time entries
        UPDATE time_entries 
        SET 
            sign_out_time = NOW(),
            is_auto_sign_out = TRUE,
            total_hours = EXTRACT(EPOCH FROM (NOW() - sign_in_time))/3600,
            updated_at = NOW()
        WHERE 
            user_id = specific_uuid 
            AND sign_out_time IS NULL;
            
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Closed % open time entries', record_count;
    END IF;
    
    -- Remove all traces of this user
    
    -- 1. Remove all time entries
    DELETE FROM time_entries WHERE user_id = specific_uuid;
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Removed % time entries', record_count;
    
    -- 2. Remove all truck assignments
    DELETE FROM user_truck_assignments WHERE user_id = specific_uuid;
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Removed % truck assignments', record_count;
    
    -- 3. Finally, remove the user record
    DELETE FROM users WHERE id = specific_uuid;
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Removed user from users table (% record)', record_count;
    
    RAISE NOTICE 'Successfully removed all traces of user with UUID % from the system', specific_uuid;
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error removing user: %', SQLERRM;
END $$;

-- Verify user is gone
SELECT COUNT(*) AS remaining_users FROM users WHERE id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133';
SELECT COUNT(*) AS remaining_users_named_damon FROM users WHERE name = 'Damon';
SELECT COUNT(*) AS remaining_time_entries FROM time_entries WHERE user_id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133';
SELECT COUNT(*) AS remaining_assignments FROM user_truck_assignments WHERE user_id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133';
SELECT 
    id, 
    current_driver_id, 
    current_mammographer_id 
FROM trucks 
WHERE 
    current_driver_id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133' 
    OR current_mammographer_id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133';
