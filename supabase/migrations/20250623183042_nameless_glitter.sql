/*
  # Fix collectibles system and add missing collectibles

  1. New collectibles
    - Add the Alpha Egg collectible that's referenced in the redeem codes
    - Add other missing collectibles from the game

  2. Functions
    - Function to handle collectible redemption from codes
    - Function to add collectibles to users

  3. Security
    - Proper RLS policies for collectibles operations
*/

-- Insert the Alpha Egg collectible that's referenced in redeem codes
INSERT INTO collectibles (name, type, rarity, description, image_url)
SELECT 'Ovo Alpha', 'egg', 'Unique', 'Distribuído através de código para jogadores do alpha, parece ser feito de um material que não existe no plano real, que irônico...', null
WHERE NOT EXISTS (SELECT 1 FROM collectibles WHERE name = 'Ovo Alpha');

-- Insert other collectibles from the game system
INSERT INTO collectibles (name, type, rarity, description, image_url)
SELECT 'Ovo de Dragão', 'egg', 'Legendary', 'Um ovo lendário que brilha com fogo interno', null
WHERE NOT EXISTS (SELECT 1 FROM collectibles WHERE name = 'Ovo de Dragão');

INSERT INTO collectibles (name, type, rarity, description, image_url)
SELECT 'Ovo de Fênix', 'egg', 'Epic', 'Um ovo que irradia calor e luz dourada', null
WHERE NOT EXISTS (SELECT 1 FROM collectibles WHERE name = 'Ovo de Fênix');

INSERT INTO collectibles (name, type, rarity, description, image_url)
SELECT 'Ovo de Grifo', 'egg', 'Rare', 'Um ovo com padrões de penas e escamas', null
WHERE NOT EXISTS (SELECT 1 FROM collectibles WHERE name = 'Ovo de Grifo');

INSERT INTO collectibles (name, type, rarity, description, image_url)
SELECT 'Peixe Dourado', 'fish', 'Epic', 'Um peixe lendário dos oceanos profundos que brilha como ouro', null
WHERE NOT EXISTS (SELECT 1 FROM collectibles WHERE name = 'Peixe Dourado');

INSERT INTO collectibles (name, type, rarity, description, image_url)
SELECT 'Peixe de Cristal', 'fish', 'Rare', 'Um peixe transparente como cristal', null
WHERE NOT EXISTS (SELECT 1 FROM collectibles WHERE name = 'Peixe de Cristal');

INSERT INTO collectibles (name, type, rarity, description, image_url)
SELECT 'Peixe Arco-íris', 'fish', 'Uncommon', 'Um peixe com escamas que refletem todas as cores', null
WHERE NOT EXISTS (SELECT 1 FROM collectibles WHERE name = 'Peixe Arco-íris');

-- Function to add collectible to user when redeeming codes
CREATE OR REPLACE FUNCTION add_collectible_to_user(
  user_id uuid,
  collectible_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  collectible_id uuid;
BEGIN
  -- Find the collectible by name
  SELECT id INTO collectible_id 
  FROM collectibles 
  WHERE name = collectible_name 
  LIMIT 1;
  
  IF collectible_id IS NULL THEN
    RAISE EXCEPTION 'Collectible not found: %', collectible_name;
  END IF;
  
  -- Add to user_collectibles (ignore if already exists)
  INSERT INTO user_collectibles (user_id, collectible_id)
  VALUES (user_id, collectible_id)
  ON CONFLICT (user_id, collectible_id) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Function to handle code redemption with collectibles
CREATE OR REPLACE FUNCTION redeem_code_with_collectibles(
  user_id uuid,
  code_text text,
  collectible_names text[]
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  collectible_name text;
BEGIN
  -- Add each collectible to the user
  FOREACH collectible_name IN ARRAY collectible_names
  LOOP
    PERFORM add_collectible_to_user(user_id, collectible_name);
  END LOOP;
  
  RETURN true;
END;
$$;

-- Update RLS policies for collectibles
DROP POLICY IF EXISTS "Users can read collectibles" ON collectibles;
CREATE POLICY "Users can read collectibles" ON collectibles
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage collectibles" ON collectibles;
CREATE POLICY "Admins can manage collectibles" ON collectibles
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin',
      'false'
    )::boolean = true
  );

-- Ensure user_collectibles policies are correct
DROP POLICY IF EXISTS "Users can manage own collectibles" ON user_collectibles;
CREATE POLICY "Users can manage own collectibles" ON user_collectibles
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read all user collectibles" ON user_collectibles
  FOR SELECT
  TO authenticated
  USING (true);