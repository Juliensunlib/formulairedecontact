/*
  # Force PostgREST Schema Reload

  Forces PostgREST to reload its schema cache by making a trivial schema change.
*/

-- Add comment to force reload
COMMENT ON TABLE airtable_metadata IS 'Metadata for Airtable records - forced reload';

-- Recreate a view to trigger schema change detection
CREATE OR REPLACE VIEW airtable_metadata_view AS 
SELECT * FROM airtable_metadata;

DROP VIEW airtable_metadata_view;
