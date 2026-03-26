/*
  # Force API Cache Reload for typeform_responses_2026
  
  1. Actions
    - Notify PostgREST to reload schema cache
    - Ensure typeform_responses_2026 is accessible via REST API
  
  2. Technical Details
    - Uses NOTIFY command to signal PostgREST
    - Forces immediate cache invalidation
*/

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Verify table exists and has correct permissions
DO $$
BEGIN
  -- Ensure RLS is enabled
  ALTER TABLE typeform_responses_2026 ENABLE ROW LEVEL SECURITY;
  
  -- Recreate the anon access policy if needed
  DROP POLICY IF EXISTS "Allow anonymous read access" ON typeform_responses_2026;
  
  CREATE POLICY "Allow anonymous read access"
    ON typeform_responses_2026
    FOR SELECT
    TO anon
    USING (true);
    
  DROP POLICY IF EXISTS "Allow anonymous insert access" ON typeform_responses_2026;
  
  CREATE POLICY "Allow anonymous insert access"
    ON typeform_responses_2026
    FOR INSERT
    TO anon
    WITH CHECK (true);
    
  DROP POLICY IF EXISTS "Allow anonymous update access" ON typeform_responses_2026;
  
  CREATE POLICY "Allow anonymous update access"
    ON typeform_responses_2026
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);
END $$;