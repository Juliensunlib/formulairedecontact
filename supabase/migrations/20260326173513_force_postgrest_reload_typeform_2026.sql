/*
  # Force PostgREST cache reload for typeform_responses_2026

  1. Purpose
    - Force PostgREST to reload its schema cache and recognize typeform_responses_2026 table
    - This fixes 404 errors when accessing the table via REST API

  2. Changes
    - Send NOTIFY signal to PostgREST to reload schema cache
    - Add comment to table to trigger schema change detection
*/

-- Add a comment to trigger schema change detection
COMMENT ON TABLE typeform_responses_2026 IS 'Typeform responses for 2026 forms - Schema reloaded';

-- Notify PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
