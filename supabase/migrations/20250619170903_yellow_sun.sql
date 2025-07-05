/*
  # Populate Xenopets Game Data

  1. Game Content
    - Insert basic items for gameplay
    - Add continents and world locations
    - Create NPCs and points of interest
    - Set up achievements and collectibles
    - Add minigames and sample quests

  2. Data Safety
    - All inserts check for existing data to prevent duplicates
    - Uses proper PostgreSQL syntax for conditional inserts
    - Follows database constraints and validation rules
*/

-- Insert basic items for gameplay
INSERT INTO items (name, description, type, rarity, price, currency, effects, daily_limit, slot)
SELECT 'Health Potion', 'A magical elixir that restores 5 health points instantly', 'Potion', 'Common', 50, 'xenocoins', '{"health": 5}', 10, null
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Health Potion');

INSERT INTO items (name, description, type, rarity, price, currency, effects, daily_limit, slot)
SELECT 'Magic Apple', 'A mystical fruit that restores hunger and provides energy', 'Food', 'Uncommon', 25, 'xenocoins', '{"hunger": 3, "happiness": 1}', null, null
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Magic Apple');

INSERT INTO items (name, description, type, rarity, price, currency, effects, daily_limit, slot)
SELECT 'Dragon Scale Armor', 'Legendary armor forged from ancient dragon scales', 'Equipment', 'Epic', 1000, 'xenocoins', '{"defense": 10}', null, 'torso'
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Dragon Scale Armor');

INSERT INTO items (name, description, type, rarity, price, currency, effects, daily_limit, slot)
SELECT 'Phoenix Feather', 'A rare collectible feather that glows with inner fire', 'Collectible', 'Legendary', 5000, 'xenocoins', '{}', null, null
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Phoenix Feather');

INSERT INTO items (name, description, type, rarity, price, currency, effects, daily_limit, slot)
SELECT 'Mystic Sword', 'A powerful blade imbued with ancient magic', 'Weapon', 'Rare', 750, 'xenocoins', '{"attack": 8, "strength": 3}', null, 'weapon'
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Mystic Sword');

INSERT INTO items (name, description, type, rarity, price, currency, effects, daily_limit, slot)
SELECT 'Happiness Toy', 'A colorful toy that brings joy to pets', 'Special', 'Common', 30, 'xenocoins', '{"happiness": 2}', 5, null
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Happiness Toy');

INSERT INTO items (name, description, type, rarity, price, currency, effects, daily_limit, slot)
SELECT 'Energy Drink', 'A refreshing beverage that boosts pet stats temporarily', 'Potion', 'Uncommon', 75, 'xenocoins', '{"speed": 2, "dexterity": 1}', 3, null
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Energy Drink');

INSERT INTO items (name, description, type, rarity, price, currency, effects, daily_limit, slot)
SELECT 'King Egg', 'An extremely rare egg that transforms pet appearance', 'Style', 'Unique', 10000, 'cash', '{}', null, null
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'King Egg');

-- Insert continents
INSERT INTO continents (name, description, image_url, order_index)
SELECT 'Mystic Forest', 'Ancient woods filled with magical creatures and hidden secrets', 'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=600', 1
WHERE NOT EXISTS (SELECT 1 FROM continents WHERE name = 'Mystic Forest');

INSERT INTO continents (name, description, image_url, order_index)
SELECT 'Golden Desert', 'Vast dunes hiding ancient treasures and mysterious oases', 'https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?auto=compress&cs=tinysrgb&w=600', 2
WHERE NOT EXISTS (SELECT 1 FROM continents WHERE name = 'Golden Desert');

INSERT INTO continents (name, description, image_url, order_index)
SELECT 'Crystal Mountains', 'Towering peaks where warriors test their strength', 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=600', 3
WHERE NOT EXISTS (SELECT 1 FROM continents WHERE name = 'Crystal Mountains');

INSERT INTO continents (name, description, image_url, order_index)
SELECT 'Endless Ocean', 'Mysterious waters with floating islands and sea creatures', 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=600', 4
WHERE NOT EXISTS (SELECT 1 FROM continents WHERE name = 'Endless Ocean');

INSERT INTO continents (name, description, image_url, order_index)
SELECT 'Floating Islands', 'Ethereal realm among the clouds with ancient magic', 'https://images.pexels.com/photos/1363876/pexels-photo-1363876.jpeg?auto=compress&cs=tinysrgb&w=600', 5
WHERE NOT EXISTS (SELECT 1 FROM continents WHERE name = 'Floating Islands');

INSERT INTO continents (name, description, image_url, order_index)
SELECT 'Shadow Realm', 'Dark depths where only the bravest dare to venture', 'https://images.pexels.com/photos/531321/pexels-photo-531321.jpeg?auto=compress&cs=tinysrgb&w=600', 6
WHERE NOT EXISTS (SELECT 1 FROM continents WHERE name = 'Shadow Realm');

-- Insert NPCs
INSERT INTO npcs (name, personality, services)
SELECT 'Woodland Merchant', 'Friendly and helpful', '["shop"]'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE name = 'Woodland Merchant');

INSERT INTO npcs (name, personality, services)
SELECT 'Forest Healer', 'Wise and caring', '["hospital"]'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE name = 'Forest Healer');

INSERT INTO npcs (name, personality, services)
SELECT 'Desert Banker', 'Professional and trustworthy', '["bank"]'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE name = 'Desert Banker');

INSERT INTO npcs (name, personality, services)
SELECT 'Mountain Warrior', 'Brave and strong', '["battle", "training"]'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE name = 'Mountain Warrior');

INSERT INTO npcs (name, personality, services)
SELECT 'Ocean Sage', 'Mysterious and knowledgeable', '["dialogue", "quest"]'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE name = 'Ocean Sage');

-- Insert POIs for Mystic Forest
DO $$
DECLARE
  forest_id uuid;
BEGIN
  SELECT id INTO forest_id FROM continents WHERE name = 'Mystic Forest' LIMIT 1;
  
  IF forest_id IS NOT NULL THEN
    INSERT INTO pois (continent_id, name, type, x_coordinate, y_coordinate, services) 
    SELECT forest_id, 'Woodland General Store', 'Shop', 25, 60, '["shop"]'
    WHERE NOT EXISTS (SELECT 1 FROM pois WHERE name = 'Woodland General Store');
    
    INSERT INTO pois (continent_id, name, type, x_coordinate, y_coordinate, services)
    SELECT forest_id, 'Forest Healing Sanctuary', 'Hospital', 70, 40, '["hospital"]'
    WHERE NOT EXISTS (SELECT 1 FROM pois WHERE name = 'Forest Healing Sanctuary');
    
    INSERT INTO pois (continent_id, name, type, x_coordinate, y_coordinate, services)
    SELECT forest_id, 'Elder Tree Quest', 'Quest', 50, 25, '["quest"]'
    WHERE NOT EXISTS (SELECT 1 FROM pois WHERE name = 'Elder Tree Quest');
  END IF;
END $$;

-- Insert POIs for Golden Desert
DO $$
DECLARE
  desert_id uuid;
BEGIN
  SELECT id INTO desert_id FROM continents WHERE name = 'Golden Desert' LIMIT 1;
  
  IF desert_id IS NOT NULL THEN
    INSERT INTO pois (continent_id, name, type, x_coordinate, y_coordinate, services)
    SELECT desert_id, 'Desert Vault', 'Bank', 50, 30, '["bank"]'
    WHERE NOT EXISTS (SELECT 1 FROM pois WHERE name = 'Desert Vault');
    
    INSERT INTO pois (continent_id, name, type, x_coordinate, y_coordinate, services)
    SELECT desert_id, 'Sand Racing Arena', 'Minigame', 75, 55, '["minigame"]'
    WHERE NOT EXISTS (SELECT 1 FROM pois WHERE name = 'Sand Racing Arena');
    
    INSERT INTO pois (continent_id, name, type, x_coordinate, y_coordinate, services)
    SELECT desert_id, 'Oasis Mystery', 'Quest', 35, 70, '["quest"]'
    WHERE NOT EXISTS (SELECT 1 FROM pois WHERE name = 'Oasis Mystery');
  END IF;
END $$;

-- Insert POIs for Crystal Mountains
DO $$
DECLARE
  mountain_id uuid;
BEGIN
  SELECT id INTO mountain_id FROM continents WHERE name = 'Crystal Mountains' LIMIT 1;
  
  IF mountain_id IS NOT NULL THEN
    INSERT INTO pois (continent_id, name, type, x_coordinate, y_coordinate, services)
    SELECT mountain_id, 'Crystal Arena', 'Battle', 60, 50, '["battle"]'
    WHERE NOT EXISTS (SELECT 1 FROM pois WHERE name = 'Crystal Arena');
    
    INSERT INTO pois (continent_id, name, type, x_coordinate, y_coordinate, services)
    SELECT mountain_id, 'Mountain Armory', 'Shop', 20, 80, '["shop"]'
    WHERE NOT EXISTS (SELECT 1 FROM pois WHERE name = 'Mountain Armory');
    
    INSERT INTO pois (continent_id, name, type, x_coordinate, y_coordinate, services)
    SELECT mountain_id, 'Wise Hermit', 'Dialogue', 80, 20, '["dialogue"]'
    WHERE NOT EXISTS (SELECT 1 FROM pois WHERE name = 'Wise Hermit');
  END IF;
END $$;

-- Insert basic achievements
INSERT INTO achievements (name, description, category, requirements, rewards, max_progress)
SELECT 'First Steps', 'Create your first pet', 'special', '{"pets_created": 1}', '{"xenocoins": 100}', 1
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'First Steps');

INSERT INTO achievements (name, description, category, requirements, rewards, max_progress)
SELECT 'Explorer', 'Visit 5 different locations', 'exploration', '{"locations_visited": 5}', '{"xenocoins": 250}', 5
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Explorer');

INSERT INTO achievements (name, description, category, requirements, rewards, max_progress)
SELECT 'Collector', 'Collect 10 different items', 'collection', '{"unique_items": 10}', '{"xenocoins": 500}', 10
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Collector');

INSERT INTO achievements (name, description, category, requirements, rewards, max_progress)
SELECT 'Wealthy', 'Accumulate 10,000 Xenocoins', 'special', '{"total_xenocoins": 10000}', '{"cash": 5}', 1
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Wealthy');

INSERT INTO achievements (name, description, category, requirements, rewards, max_progress)
SELECT 'Pet Lover', 'Reach maximum happiness with a pet', 'social', '{"max_happiness": 1}', '{"xenocoins": 300}', 1
WHERE NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Pet Lover');

-- Insert basic minigames
INSERT INTO minigames (name, type, description, daily_reward_limit, base_reward, max_score)
SELECT 'Crystal Collector', 'arcade', 'Collect crystals while avoiding obstacles', 3, 150, 100000
WHERE NOT EXISTS (SELECT 1 FROM minigames WHERE name = 'Crystal Collector');

INSERT INTO minigames (name, type, description, daily_reward_limit, base_reward, max_score)
SELECT 'Pet Puzzle', 'puzzle', 'Solve puzzles featuring your pets', 3, 120, 50000
WHERE NOT EXISTS (SELECT 1 FROM minigames WHERE name = 'Pet Puzzle');

INSERT INTO minigames (name, type, description, daily_reward_limit, base_reward, max_score)
SELECT 'Adventure Quest', 'roguelike', 'Navigate through dangerous dungeons', 3, 200, 200000
WHERE NOT EXISTS (SELECT 1 FROM minigames WHERE name = 'Adventure Quest');

-- Insert welcome collectibles
INSERT INTO collectibles (name, type, rarity, description, image_url)
SELECT 'Starter Stone', 'stone', 'Common', 'A simple stone marking the beginning of your journey', null
WHERE NOT EXISTS (SELECT 1 FROM collectibles WHERE name = 'Starter Stone');

INSERT INTO collectibles (name, type, rarity, description, image_url)
SELECT 'Forest Leaf', 'artwork', 'Common', 'A beautiful leaf from the Mystic Forest', null
WHERE NOT EXISTS (SELECT 1 FROM collectibles WHERE name = 'Forest Leaf');

INSERT INTO collectibles (name, type, rarity, description, image_url)
SELECT 'Desert Sand', 'stone', 'Uncommon', 'Magical sand from the Golden Desert', null
WHERE NOT EXISTS (SELECT 1 FROM collectibles WHERE name = 'Desert Sand');

-- Create sample quests with valid types
INSERT INTO quests (name, description, type, requirements, rewards)
SELECT 'Welcome to Xenopets', 'Complete your first pet interaction', 'exploration', '{"pet_interactions": 1}', '{"xenocoins": 50}'
WHERE NOT EXISTS (SELECT 1 FROM quests WHERE name = 'Welcome to Xenopets');

INSERT INTO quests (name, description, type, requirements, rewards)
SELECT 'Forest Explorer', 'Visit the Mystic Forest', 'exploration', '{"locations_visited": 1}', '{"xenocoins": 100}'
WHERE NOT EXISTS (SELECT 1 FROM quests WHERE name = 'Forest Explorer');

INSERT INTO quests (name, description, type, requirements, rewards)
SELECT 'First Delivery', 'Deliver an item to an NPC', 'delivery', '{"items_delivered": 1}', '{"xenocoins": 75}'
WHERE NOT EXISTS (SELECT 1 FROM quests WHERE name = 'First Delivery');

INSERT INTO quests (name, description, type, requirements, rewards)
SELECT 'Puzzle Master', 'Complete your first puzzle minigame', 'minigame', '{"puzzles_completed": 1}', '{"xenocoins": 125}'
WHERE NOT EXISTS (SELECT 1 FROM quests WHERE name = 'Puzzle Master');

INSERT INTO quests (name, description, type, requirements, rewards)
SELECT 'Ancient Riddle', 'Solve the riddle of the Elder Tree', 'riddle', '{"riddles_solved": 1}', '{"xenocoins": 200}'
WHERE NOT EXISTS (SELECT 1 FROM quests WHERE name = 'Ancient Riddle');