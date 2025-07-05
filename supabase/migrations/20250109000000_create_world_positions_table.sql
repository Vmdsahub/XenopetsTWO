/*
  # Create World Positions Table
  
  This migration creates a table to store world/planet positions that can be edited by administrators.
*/

-- Create table for world positions
CREATE TABLE IF NOT EXISTS world_positions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  x REAL NOT NULL DEFAULT 0,
  y REAL NOT NULL DEFAULT 0,
  size REAL NOT NULL DEFAULT 60,
  rotation REAL NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#4ecdc4',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default world positions (matching current SpaceMap configuration)
INSERT INTO world_positions (id, name, x, y, size, rotation, color, image_url) VALUES
('planet-0', 'Estação Galáctica', 7750, 7250, 60, 0, '#ff6b6b', 'https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2Fdfdbc589c3f344eea7b33af316e83b41?format=webp&width=800'),
('planet-1', 'Base Orbital', 7966.6, 7625, 60, 0, '#4ecdc4', 'https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2Fd42810aa3d45429d93d8c58c52827326?format=webp&width=800'),
('planet-2', 'Mundo Alienígena', 7750, 8000, 60, 0, '#45b7d1', 'https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2Fdfce7132f868407eb4d7afdf27d09a77?format=webp&width=800'),
('planet-3', 'Terra Verdejante', 7533.4, 7625, 60, 0, '#96ceb4', 'https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2F8e6b96287f6448089ed602d82e2839bc?format=webp&width=800'),
('planet-4', 'Reino Gelado', 7533.4, 7375, 60, 0, '#ffeaa7', 'https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2F7a1b7c8172a5446b9a22ffd65d22a6f7?format=webp&width=800'),
('planet-5', 'Vila Ancestral', 7966.6, 7375, 60, 0, '#dda0dd', 'https://cdn.builder.io/api/v1/image/assets%2Ff94d2a386a444693b9fbdff90d783a66%2F76c4f943e6e045938d8e5efb84a2a969?format=webp&width=800');

-- Enable RLS
ALTER TABLE world_positions ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can modify world positions, everyone can read
CREATE POLICY "Allow read access to world positions" ON world_positions FOR SELECT USING (true);
CREATE POLICY "Allow admin modifications to world positions" ON world_positions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_world_positions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_world_positions_updated_at_trigger
    BEFORE UPDATE ON world_positions
    FOR EACH ROW
    EXECUTE FUNCTION update_world_positions_updated_at();
