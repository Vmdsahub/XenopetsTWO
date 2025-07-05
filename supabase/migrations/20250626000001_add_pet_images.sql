-- Add image_url column to pets table to support custom pet images
ALTER TABLE pets ADD COLUMN image_url text;

-- Set the Griffin pet image to the provided URL
-- This will serve as the default image for Griffin species
UPDATE pets 
SET image_url = 'https://cdn.builder.io/api/v1/image/assets%2F00527235c81749aeadef448eefcc705e%2Ffe8040cedae642518cc8c46775fc3786?format=webp&width=800'
WHERE species = 'Griffin' AND image_url IS NULL;
