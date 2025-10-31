/*
  # Create Property Photos Table

  1. New Tables
    - `property_photos`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key to properties) - Associated property
      - `file_path` (text, required) - Storage path or URL to the photo
      - `sort_order` (integer) - Display order of photos (0-9, max 10 photos)
      - `created_at` (timestamptz) - Upload timestamp

  2. Security
    - Enable RLS on `property_photos` table
    - Add policies for authenticated users to perform all operations

  3. Indexes
    - Create index on property_id for faster property photo queries
    - Create index on sort_order for ordered retrieval

  4. Constraints
    - Foreign key constraint to properties with CASCADE delete
    - Check constraint to enforce max 10 photos per property (enforced at app level)
*/

CREATE TABLE IF NOT EXISTS property_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE property_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view property photos"
  ON property_photos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can upload property photos"
  ON property_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update property photos"
  ON property_photos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete property photos"
  ON property_photos
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS property_photos_property_id_idx ON property_photos(property_id);
CREATE INDEX IF NOT EXISTS property_photos_sort_order_idx ON property_photos(sort_order);
