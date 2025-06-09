-- Script to completely remove Damon from the system
-- This will:
-- 1. Sign him out if currently signed in
-- 2. Remove all time entries
-- 3. Remove all truck assignments
-- 4. Remove the user record

DO $$
DECLARE
    damon_id UUID;
    damon_truck VARCHAR;
    record_count INTEGER;
BEGIN
    -- Find Damon's UUID
    SELECT id INTO damon_id FROM users WHERE name = 'Damon' LIMIT 1;
    
    IF damon_id IS NULL THEN
        RAISE NOTICE 'User Damon not found in the database';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found Damon with UUID: %', damon_id;
    
    -- Check if Damon is currently signed in to any truck
    SELECT truck_id INTO damon_truck 
    FROM trucks 
    WHERE current_driver_id = damon_id OR current_mammographer_id = damon_id
    LIMIT 1;
    
    IF damon_truck IS NOT NULL THEN
        RAISE NOTICE 'Damon is currently signed in to truck: %', damon_truck;
        
        -- Sign Damon out by updating the truck record
        IF EXISTS (SELECT 1 FROM trucks WHERE current_driver_id = damon_id) THEN
            UPDATE trucks SET current_driver_id = NULL WHERE current_driver_id = damon_id;
            RAISE NOTICE 'Signed Damon out as driver from truck: %', damon_truck;
        END IF;
        
        IF EXISTS (SELECT 1 FROM trucks WHERE current_mammographer_id = damon_id) THEN
            UPDATE trucks SET current_mammographer_id = NULL WHERE current_mammographer_id = damon_id;
            RAISE NOTICE 'Signed Damon out as mammographer from truck: %', damon_truck;
        END IF;
        
        -- Close any open time entries
        UPDATE time_entries 
        SET 
            sign_out_time = NOW(),
            is_auto_sign_out = TRUE,
            total_hours = EXTRACT(EPOCH FROM (NOW() - sign_in_time))/3600,
            updated_at = NOW()
        WHERE 
            user_id = damon_id 
            AND sign_out_time IS NULL;
            
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Closed % open time entries for Damon', record_count;
    ELSE
        RAISE NOTICE 'Damon is not currently signed in to any truck';
    END IF;
    
    -- Start removing all traces of Damon
    
    -- 1. Remove all time entries
    DELETE FROM time_entries WHERE user_id = damon_id;
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Removed % time entries for Damon', record_count;
    
    -- 2. Remove all truck assignments
    DELETE FROM user_truck_assignments WHERE user_id = damon_id;
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Removed % truck assignments for Damon', record_count;
    
    -- 3. Finally, remove the user record
    DELETE FROM users WHERE id = damon_id;
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Removed Damon from users table (% record)', record_count;
    
    RAISE NOTICE 'Successfully removed all traces of Damon from the system';
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error removing Damon: %', SQLERRM;
END $$;

-- Verify Damon is gone
SELECT COUNT(*) AS remaining_users FROM users WHERE name = 'Damon';
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
