/*
  # Force complete PostgREST cache invalidation

  ## Description
  Force PostgREST to completely invalidate its cache by temporarily renaming the table
  and then renaming it back. This forces PostgREST to reload the schema from scratch.

  ## Actions
  1. Rename typeform_metadata to typeform_metadata_temp
  2. Rename it back to typeform_metadata
  3. Send NOTIFY to reload PostgREST
*/

-- Rename table temporarily to force cache invalidation
ALTER TABLE IF EXISTS typeform_metadata RENAME TO typeform_metadata_temp;

-- Rename it back immediately
ALTER TABLE IF EXISTS typeform_metadata_temp RENAME TO typeform_metadata;

-- Force PostgREST to reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
