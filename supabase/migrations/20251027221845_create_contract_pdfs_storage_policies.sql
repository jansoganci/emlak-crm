/*
  # Create Storage Bucket and Policies for Contract PDFs

  1. Storage Setup
    - Bucket: `contract-pdfs` (private)
    - Used for storing uploaded contract PDF files

  2. Security Policies
    - Authenticated users can upload contract PDFs
    - Authenticated users can view/download contract PDFs
    - Authenticated users can delete contract PDFs
    - All policies restricted to authenticated users only

  3. Important Notes
    - PDFs are stored privately (not publicly accessible without authentication)
    - File path structure: contracts/{contractId}-{timestamp}.pdf
*/

-- Create the storage bucket for contract PDFs (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('contract-pdfs', 'contract-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Authenticated users can upload contract PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view contract PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update contract PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete contract PDFs" ON storage.objects;

CREATE POLICY "Authenticated users can upload contract PDFs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'contract-pdfs');

CREATE POLICY "Authenticated users can view contract PDFs"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'contract-pdfs');

CREATE POLICY "Authenticated users can update contract PDFs"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'contract-pdfs')
  WITH CHECK (bucket_id = 'contract-pdfs');

CREATE POLICY "Authenticated users can delete contract PDFs"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'contract-pdfs');
