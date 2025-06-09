-- Safe script to update Damon's UUID
-- Replace 'CURRENT_UUID_HERE' with Damon's actual current UUID

DO $$
DECLARE
    old_uuid UUID;
    new_uuid UUID := 'e3922c5b-ecca-4908-98d1-8c8089a4a133';
    record_count INTEGER;
BEGIN
    -- Find Damon's current UUID
    SELECT id INTO old_uuid FROM users WHERE name = 'Damon' LIMIT 1;
    
    IF old_uuid IS NULL THEN
        RAISE NOTICE 'User Damon not found';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found Damon with UUID: %', old_uuid;
    RAISE NOTICE 'Updating to new UUID: %', new_uuid;
    
    -- Check if new UUID already exists
    SELECT COUNT(*) INTO record_count FROM users WHERE id = new_uuid;
    IF record_count > 0 THEN
        RAISE EXCEPTION 'New UUID % already exists in users table', new_uuid;
    END IF;
    
    -- Start transaction
    BEGIN
        -- Update time_entries
        UPDATE time_entries SET user_id = new_uuid WHERE user_id = old_uuid;
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Updated % time_entries records', record_count;
        
        -- Update user_truck_assignments
        UPDATE user_truck_assignments SET user_id = new_uuid WHERE user_id = old_uuid;
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Updated % user_truck_assignments records', record_count;
        
        -- Update trucks current_driver_id
        UPDATE trucks SET current_driver_id = new_uuid WHERE current_driver_id = old_uuid;
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Updated % trucks current_driver_id records', record_count;
        
        -- Update trucks current_mammographer_id
        UPDATE trucks SET current_mammographer_id = new_uuid WHERE current_mammographer_id = old_uuid;
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Updated % trucks current_mammographer_id records', record_count;
        
        -- Finally update users table
        UPDATE users SET id = new_uuid WHERE id = old_uuid;
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Updated % users records', record_count;
        
        RAISE NOTICE 'Successfully updated Damon UUID from % to %', old_uuid, new_uuid;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Error updating UUID: %', SQLERRM;
    END;
END $$;

-- Verify the update
SELECT 'Verification - Updated user:' as status, id, name, role 
FROM users 
WHERE id = 'e3922c5b-ecca-4908-98d1-8c8089a4a133';
