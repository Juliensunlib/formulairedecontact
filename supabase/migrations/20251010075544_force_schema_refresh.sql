/*
  # Force Schema Cache Refresh

  This migration forces PostgREST to reload the schema cache
  by making a trivial schema change.
*/

-- Add a comment to force schema reload
COMMENT ON TABLE airtable_metadata IS 'Metadata for Airtable records including status, priority, and notes';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
