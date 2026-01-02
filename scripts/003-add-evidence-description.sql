-- Add description column to evidences table if it doesn't exist
ALTER TABLE evidences 
ADD COLUMN IF NOT EXISTS description TEXT;
