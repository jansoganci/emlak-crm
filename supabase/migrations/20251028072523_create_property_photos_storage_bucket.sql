/*
  # Create Property Photos Storage Bucket and Policies

  1. Storage Bucket
    - Creates 'property-photos' bucket for storing property images
    - Configured with public access for easy retrieval
  
  2. Storage Policies
    - Authenticated users can upload photos (INSERT)
    - Authenticated users can delete their own uploaded photos (DELETE)
    - Public read access for all photos (SELECT)
  
  3. Security
    - Only authenticated users can upload/delete
    - All users can view photos (for property listings)
*/

-- Create the storage bucket for property photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload property photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property photos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access to property photos" ON storage.objects;

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload property photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-photos');

-- Allow authenticated users to delete photos
CREATE POLICY "Authenticated users can delete property photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-photos');

-- Allow public read access to photos
CREATE POLICY "Public read access to property photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-photos');