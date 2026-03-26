/*
  # Create Schema Reload Function
  
  1. Changes
    - Creates a stored function to force PostgREST reload
    - Can be called via RPC from the frontend
    - Forces immediate schema cache refresh
  
  2. Security
    - Function is accessible to anonymous users
    - Safe operation - only reloads schema cache
*/

-- Create a function to force PostgREST reload
CREATE OR REPLACE FUNCTION reload_postgrest_schema()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Send reload notifications
  PERFORM pg_notify('pgrst', 'reload schema');
  PERFORM pg_notify('pgrst', 'reload config');
  
  -- Return success message
  RETURN 'Schema reload triggered successfully';
END;
$$;

-- Allow anonymous and authenticated users to call this function
GRANT EXECUTE ON FUNCTION reload_postgrest_schema() TO anon, authenticated;

-- Execute it immediately
SELECT reload_postgrest_schema();
