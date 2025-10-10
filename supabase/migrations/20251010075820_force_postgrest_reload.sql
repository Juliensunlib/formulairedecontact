/*
  # Force PostgREST to reload schema

  This migration creates a temporary function and drops it to force
  PostgREST to reload its schema cache.
*/

-- Create and drop a temporary function to trigger schema reload
CREATE OR REPLACE FUNCTION public.trigger_reload() RETURNS void AS $$
BEGIN
  -- This is just a dummy function to trigger schema reload
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION public.trigger_reload();

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant all privileges on the table
GRANT ALL ON public.airtable_metadata TO anon, authenticated;

-- Notify PostgREST
NOTIFY pgrst, 'reload schema';
