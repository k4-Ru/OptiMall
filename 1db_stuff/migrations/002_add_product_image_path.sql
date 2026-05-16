-- Add image path support for product images.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_path VARCHAR(255) NULL AFTER tags;
