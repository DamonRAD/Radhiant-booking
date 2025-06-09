-- Script to clean up any orphaned records across the entire system
-- This will find and fix records that reference non-existent users

DO $$
DECLARE
    record_count INTEGER;
    orphaned_uuid UUID;
BEGIN
    RAISE NOTICE 'Starting cleanup of orphaned records...';
    
    -- Find trucks with current_driver_id that doesn't exist in users
    FOR orphaned_uuid IN 
        SELECT DISTINCT current_driver_id 
        FROM trucks 
        WHERE current_driver_id IS NOT NULL 
        AND current_driver_id NOT IN (SELECT id FROM users)
    LOOP
        RAISE NOTICE 'Found orphaned driver UUID in trucks: %', orphaned_uuid;
        
        UPDATE trucks 
        SET current_driver_id = NULL, updated_at = NOW() 
        WHERE current_driver_id = orphaned_uuid;
        
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Cleared orphaned driver from % trucks', record_count;
    END LOOP;
    
    -- Find trucks with current_mammographer_id that doesn't exist in users
    FOR orphaned_uuid IN 
        SELECT DISTINCT current_mammographer_id 
        FROM trucks 
        WHERE current_mammographer_id IS NOT NULL 
        AND current_mammographer_id NOT IN (SELECT id FROM users)
    LOOP
        RAISE NOTICE 'Found orphaned mammographer UUID in trucks: %', orphaned_uuid;
        
        UPDATE trucks 
        SET current_mammographer_id = NULL, updated_at = NOW() 
        WHERE current_mammographer_id = orphaned_uuid;
        
        GET DIAGNOSTICS record_count = ROW_COUNT;
        RAISE NOTICE 'Cleared orphaned mammographer from % trucks', record_count;
    END LOOP;
    
    -- Close open time entries for non-existent users
    UPDATE time_entries 
    SET 
        sign_out_time = NOW(),
        is_auto_sign_out = TRUE,
        total_hours = EXTRACT(EPOCH FROM (NOW() - sign_in_time))/3600,
        updated_at = NOW()
    WHERE 
        sign_out_time IS NULL
        AND user_id NOT IN (SELECT id FROM users);
    
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Closed % open time entries for non-existent users', record_count;
    
    -- Remove user_truck_assignments for non-existent users
    DELETE FROM user_truck_assignments 
    WHERE user_id NOT IN (SELECT id FROM users);
    
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Removed % truck assignments for non-existent users', record_count;
    
    RAISE NOTICE 'Cleanup completed successfully';
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error during cleanup: %', SQLERRM;
END $$;

-- Show summary of current system state
SELECT 'Active Users:' as summary, COUNT(*) as count FROM users WHERE is_active = true;
SELECT 'Trucks with Drivers:' as summary, COUNT(*) as count FROM trucks WHERE current_driver_id IS NOT NULL;
SELECT 'Trucks with Mammographers:' as summary, COUNT(*) as count FROM trucks WHERE current_mammographer_id IS NOT NULL;
SELECT 'Open Time Entries:' as summary, COUNT(*) as count FROM time_entries WHERE sign_out_time IS NULL;
