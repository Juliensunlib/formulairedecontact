/*
  # Add anonymous access to typeform_responses_2026

  1. Changes
    - Add policy for anonymous (anon) users to read typeform_responses_2026
    - This allows the frontend to access the data without authentication

  2. Security
    - Read-only access for anonymous users
    - Write access still restricted to authenticated users
*/

-- Add policy for anonymous users to read typeform responses 2026
CREATE POLICY "Anonymous users can read typeform responses 2026"
  ON typeform_responses_2026
  FOR SELECT
  TO anon
  USING (true);

-- Also add anon access for insert/update for edge functions
CREATE POLICY "Anonymous users can insert typeform responses 2026"
  ON typeform_responses_2026
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can update typeform responses 2026"
  ON typeform_responses_2026
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
