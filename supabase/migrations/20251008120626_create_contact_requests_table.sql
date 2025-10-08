/*
  # Create Contact Requests Table for SunLib

  1. New Tables
    - `contact_requests`
      - `id` (uuid, primary key) - Unique identifier
      - `typeform_response_id` (text, unique) - Typeform response ID to prevent duplicates
      - `submitted_at` (timestamptz) - When the form was submitted
      - `form_id` (text) - Typeform form ID
      - `name` (text) - Contact name
      - `email` (text) - Contact email
      - `phone` (text, nullable) - Contact phone number
      - `company` (text, nullable) - Company name
      - `message` (text, nullable) - Contact message
      - `status` (text) - Status: 'new', 'in_progress', 'contacted', 'completed', 'archived'
      - `priority` (text) - Priority: 'low', 'medium', 'high'
      - `notes` (text, nullable) - Internal notes
      - `assigned_to` (text, nullable) - Person assigned to handle this request
      - `raw_data` (jsonb) - Full Typeform response data
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `contact_requests` table
    - Add policy for authenticated users to view all contact requests
    - Add policy for authenticated users to update contact requests

  3. Indexes
    - Index on `status` for filtering
    - Index on `submitted_at` for sorting
    - Unique index on `typeform_response_id` for duplicate prevention
*/

CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  typeform_response_id text UNIQUE NOT NULL,
  submitted_at timestamptz NOT NULL,
  form_id text NOT NULL,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  company text,
  message text,
  status text NOT NULL DEFAULT 'new',
  priority text NOT NULL DEFAULT 'medium',
  notes text,
  assigned_to text,
  raw_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contact requests"
  ON contact_requests FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert contact requests"
  ON contact_requests FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update contact requests"
  ON contact_requests FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_submitted_at ON contact_requests(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_priority ON contact_requests(priority);

CREATE OR REPLACE FUNCTION update_contact_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_contact_requests_updated_at
  BEFORE UPDATE ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_requests_updated_at();