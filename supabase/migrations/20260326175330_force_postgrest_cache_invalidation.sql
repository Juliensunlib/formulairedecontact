/*
  # Force PostgREST Cache Invalidation

  1. Changes
    - Add a trigger to force PostgREST to recognize typeform_responses_2026
    - Update table comment to force schema cache refresh
    
  2. Notes
    - This migration forces PostgREST to reload its schema cache
    - The table already exists but is not visible to the REST API
*/

-- Update table comment to force cache invalidation
COMMENT ON TABLE typeform_responses_2026 IS 'Table pour stocker les réponses des formulaires Typeform 2026 avec structure unifiée';

-- Ensure RLS is enabled
ALTER TABLE typeform_responses_2026 ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON typeform_responses_2026;
DROP POLICY IF EXISTS "Enable insert for service role" ON typeform_responses_2026;
DROP POLICY IF EXISTS "Enable update for service role" ON typeform_responses_2026;
DROP POLICY IF EXISTS "Enable delete for service role" ON typeform_responses_2026;

-- Recreate policies
CREATE POLICY "Enable read access for all users"
ON typeform_responses_2026
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for service role"
ON typeform_responses_2026
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for service role"
ON typeform_responses_2026
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for service role"
ON typeform_responses_2026
FOR DELETE
USING (true);

-- Force schema cache reload by notifying PostgREST
NOTIFY pgrst, 'reload schema';
