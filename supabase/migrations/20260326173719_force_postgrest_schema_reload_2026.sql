/*
  # Force PostgREST Schema Reload for typeform_responses_2026
  
  1. Changes
    - Sends NOTIFY signal to reload PostgREST schema cache
    - Forces API endpoint refresh for typeform_responses_2026 table
    - Ensures the table is immediately accessible via REST API
  
  2. Technical Details
    - Uses pg_notify to send pgrst reload signal
    - This forces PostgREST to reload its schema cache
    - Required after table creation to make it available via API
*/

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- Additional cache invalidation
SELECT pg_notify('pgrst', 'reload config');
