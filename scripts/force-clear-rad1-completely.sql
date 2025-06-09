-- Force clear RAD-1 completely and verify all related data
DO $$
DECLARE
    record_count INTEGER;
BEGIN
    RAISE NOTICE 'Starting complete RAD-1 clearance...';
    
    -- Force clear RAD-1 truck record completely
    UPDATE trucks 
    SET 
        current_driver_id = NULL,
        current_mammographer_id = NULL,
        updated_at = NOW()
    WHERE id = 'RAD-1';
    
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Updated RAD-1 truck record (% rows)', record_count;
    
    -- Close ALL open time entries for RAD-1 regardless of user
    UPDATE time_entries 
    SET 
        sign_out_time = NOW(),
        is_auto_sign_out = TRUE,
        total_hours = EXTRACT(EPOCH FROM (NOW() - sign_in_time))/3600,
        updated_at = NOW()
    WHERE 
        truck_id = 'RAD-1'
        AND sign_out_time IS NULL;
    
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Closed % open time entries for RAD-1', record_count;
    
    -- Also close any entries for the specific UUIDs we know about
    UPDATE time_entries 
    SET 
        sign_out_time = NOW(),
        is_auto_sign_out = TRUE,
        total_hours = EXTRACT(EPOCH FROM (NOW() - sign_in_time))/3600,
        updated_at = NOW()
    WHERE 
        user_id IN (
            '93e428a9-0f7b-48d4-93e5-5a3288fb0f30',
            'e3922c5b-ecca-4908-98d1-8c8089a4a133'
        )
        AND sign_out_time IS NULL;
    
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Closed % additional open entries for known Damon UUIDs', record_count;
    
    RAISE NOTICE 'Complete RAD-1 clearance finished';
    
END $$;

-- Comprehensive verification
SELECT 'RAD-1 Truck Status:' as check_type, * FROM trucks WHERE id = 'RAD-1';

SELECT 'Open entries for RAD-1:' as check_type, COUNT(*) as count 
FROM time_entries 
WHERE truck_id = 'RAD-1' AND sign_out_time IS NULL;

SELECT 'Open entries for known Damon UUIDs:' as check_type, COUNT(*) as count
FROM time_entries 
WHERE user_id IN (
    '93e428a9-0f7b-48d4-93e5-5a3288fb0f30',
    'e3922c5b-ecca-4908-98d1-8c8089a4a133'
) AND sign_out_time IS NULL;

SELECT 'All users named Damon:' as check_type, COUNT(*) as count FROM users WHERE name = 'Damon';
