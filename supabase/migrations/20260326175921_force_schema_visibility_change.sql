/*
  # Force Schema Visibility Change

  1. Changes
    - Add a dummy column and remove it to force PostgREST cache refresh
    - Grant explicit permissions to anon role
    
  2. Notes
    - This forces PostgREST to detect table changes
*/

-- Add a temporary column to force schema change detection
ALTER TABLE typeform_responses_2026 ADD COLUMN IF NOT EXISTS _temp_trigger text DEFAULT 'trigger';

-- Grant all permissions to anon role
GRANT ALL ON typeform_responses_2026 TO anon;
GRANT ALL ON typeform_responses_2026 TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Remove the temporary column
ALTER TABLE typeform_responses_2026 DROP COLUMN IF EXISTS _temp_trigger;

-- Update table stats to force detection
ANALYZE typeform_responses_2026;
