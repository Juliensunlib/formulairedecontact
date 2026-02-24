/*
  # Force complete schema cache reload

  1. Actions
    - Notify PostgREST to reload schema cache
    - Force database metadata refresh
    - Ensure typeform_responses table is visible
*/

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Verify table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'typeform_responses'
  ) THEN
    RAISE EXCEPTION 'Table typeform_responses does not exist!';
  END IF;
END $$;