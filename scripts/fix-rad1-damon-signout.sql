-- Emergency script to sign out Damon from RAD-1
-- This handles the specific case where the truck shows a driver but the UUID doesn't exist

DO $$
DECLARE
    problematic_uuid UUID := '93e428a9-0f7b-48d4-93e5-5a3288fb0f30';
    record_count INTEGER;
BEGIN
    RAISE NOTICE 'Starting emergency sign-out for RAD-1...';
    
    -- Check current RAD-1 status
    SELECT current_driver_id INTO problematic_uuid FROM trucks WHERE id = 'RAD-1';
    RAISE NOTICE 'RAD-1 current_driver_id: %', problematic_uuid;
    
    -- Check if this UUID exists in users table
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = problematic_uuid) THEN
        RAISE NOTICE 'UUID % does not exist in users table - this is the problem!', problematic_uuid;
    ELSE
        RAISE NOTICE 'UUID % exists in users table', problematic_uuid;
    END IF;
    
    -- Force sign out from RAD-1 regardless of user existence
    UPDATE trucks 
    SET 
        current_driver_id = NULL,
        updated_at = NOW()
    WHERE id = 'RAD-1';
    
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Cleared current_driver_id from RAD-1 (% records updated)', record_count;
    
    -- Close any open time entries for this UUID (even if user doesn't exist)
    UPDATE time_entries 
    SET 
        sign_out_time = NOW(),
        is_auto_sign_out = TRUE,
        total_hours = EXTRACT(EPOCH FROM (NOW() - sign_in_time))/3600,
        updated_at = NOW()
    WHERE 
        user_id = problematic_uuid
        AND truck_id = 'RAD-1'
        AND sign_out_time IS NULL;
    
    GET DIAGNOSTICS record_count = ROW_COUNT;
    RAISE NOTICE 'Closed % open time entries for UUID %', record_count, problematic_uuid;
    
    -- Also clear mammographer if it has the same issue
    UPDATE trucks 
    SET 
        current_mammographer_id = NULL,
        updated_at = NOW()
    WHERE 
        id = 'RAD-1' 
        AND current_mammographer_id = problematic_uuid;
    
    GET DIAGNOSTICS record_count = ROW_COUNT;
    IF record_count > 0 THEN
        RAISE NOTICE 'Also cleared current_mammographer_id from RAD-1';
    END IF;
    
    RAISE NOTICE 'Emergency sign-out completed for RAD-1';
    
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error during emergency sign-out: %', SQLERRM;
END $$;

-- Verify RAD-1 is now clear
SELECT 
    'RAD-1 Status After Fix:' as status,
    id,
    current_driver_id,
    current_mammographer_id,
    updated_at
FROM trucks 
WHERE id = 'RAD-1';

-- Check for any remaining open time entries for the problematic UUID
SELECT 
    'Remaining Open Entries:' as status,
    COUNT(*) as count
FROM time_entries 
WHERE 
    user_id = '93e428a9-0f7b-48d4-93e5-5a3288fb0f30'
    AND sign_out_time IS NULL;
