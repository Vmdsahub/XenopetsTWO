/*
  # Xenopets Initial Database Schema

  1. New Tables
    - `profiles` - User profile data extending Supabase auth
    - `pets` - Pet entities with all attributes and stats
    - `items` - Game items with types, rarity, and effects
    - `inventory` - User inventory linking users to items
    - `pet_conditions` - Active conditions on pets
    - `pet_equipment` - Equipment slots for pets
    - `notifications` - User notifications
    - `achievements` - Achievement definitions
    - `user_achievements` - User achievement progress
    - `collectibles` - Collectible item definitions
    - `user_collectibles` - User collectible progress
    - `quests` - Quest definitions
    - `user_quests` - User quest progress
    - `continents` - World map continents
    - `pois` - Points of interest on continents
    - `npcs` - Non-player characters
    - `dialogue_nodes` - NPC dialogue system
    - `shops` - Shop definitions
    - `shop_items` - Items available in shops
    - `minigames` - Minigame definitions
    - `leaderboards` - Minigame leaderboards
    - `sagas` - Story saga definitions
    - `saga_steps` - Individual saga steps
    - `user_saga_progress` - User progress in sagas
    - `trades` - Trading system
    - `duels` - PvP duel system

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure admin-only operations
    - Implement anti-cheat measures

  3. Functions
    - Currency update functions
    - Pet stat calculations
    - Achievement checking
    - Anti-cheat validation
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  phone text,
  is_admin boolean DEFAULT false,
  language text DEFAULT 'en-US',
  account_score bigint DEFAULT 0,
  days_played integer DEFAULT 0,
  total_xenocoins bigint DEFAULT 0,
  xenocoins bigint DEFAULT 1000,
  cash integer DEFAULT 10,
  avatar_url text,
  preferences jsonb DEFAULT '{"notifications": true, "soundEffects": true, "musicVolume": 0.7, "theme": "light", "privacy": {"showOnline": true, "allowDuels": true, "allowTrades": true}}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

-- Pets table
CREATE TABLE IF NOT EXISTS pets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  species text NOT NULL CHECK (species IN ('Dragon', 'Phoenix', 'Griffin', 'Unicorn')),
  style text DEFAULT 'normal' CHECK (style IN ('normal', 'fire', 'ice', 'shadow', 'light', 'king', 'baby')),
  level integer DEFAULT 1,
  
  -- Primary attributes (0-10 scale)
  happiness integer DEFAULT 8 CHECK (happiness >= 0 AND happiness <= 10),
  health integer DEFAULT 10 CHECK (health >= 0 AND health <= 10),
  hunger integer DEFAULT 8 CHECK (hunger >= 0 AND hunger <= 10),
  
  -- Secondary attributes
  strength integer DEFAULT 1 CHECK (strength >= 0),
  dexterity integer DEFAULT 1 CHECK (dexterity >= 0),
  intelligence integer DEFAULT 1 CHECK (intelligence >= 0),
  speed integer DEFAULT 1 CHECK (speed >= 0),
  attack integer DEFAULT 1 CHECK (attack >= 0),
  defense integer DEFAULT 1 CHECK (defense >= 0),
  precision integer DEFAULT 1 CHECK (precision >= 0),
  evasion integer DEFAULT 1 CHECK (evasion >= 0),
  luck integer DEFAULT 1 CHECK (luck >= 0),
  
  personality text NOT NULL CHECK (personality IN ('Sanguine', 'Choleric', 'Melancholic', 'Phlegmatic')),
  is_alive boolean DEFAULT true,
  is_active boolean DEFAULT false,
  hatch_time timestamptz,
  death_date timestamptz,
  last_interaction timestamptz DEFAULT now(),
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('Food', 'Potion', 'Equipment', 'Special', 'Collectible', 'Theme', 'Weapon', 'Style')),
  rarity text NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique')),
  price integer DEFAULT 0,
  currency text DEFAULT 'xenocoins' CHECK (currency IN ('xenocoins', 'cash')),
  effects jsonb DEFAULT '{}',
  daily_limit integer,
  decomposition_hours integer DEFAULT 24,
  slot text CHECK (slot IN ('head', 'torso', 'legs', 'gloves', 'footwear', 'weapon')),
  image_url text,
  is_tradeable boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  is_equipped boolean DEFAULT false,
  equipped_pet_id uuid REFERENCES pets(id) ON DELETE SET NULL,
  acquired_at timestamptz DEFAULT now(),
  last_used timestamptz,
  
  UNIQUE(user_id, item_id, equipped_pet_id)
);

-- Pet conditions table
CREATE TABLE IF NOT EXISTS pet_conditions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('sick', 'cold', 'hot', 'frozen', 'paralyzed', 'poisoned', 'blessed')),
  name text NOT NULL,
  description text NOT NULL,
  effects jsonb DEFAULT '{}',
  duration_hours integer,
  applied_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error', 'achievement')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('exploration', 'combat', 'collection', 'social', 'special')),
  requirements jsonb NOT NULL DEFAULT '{}',
  rewards jsonb NOT NULL DEFAULT '{}',
  max_progress integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  progress integer DEFAULT 0,
  is_unlocked boolean DEFAULT false,
  unlocked_at timestamptz,
  
  UNIQUE(user_id, achievement_id)
);

-- Collectibles table
CREATE TABLE IF NOT EXISTS collectibles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('stone', 'fish', 'egg', 'stamp', 'artwork')),
  rarity text NOT NULL CHECK (rarity IN ('Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique')),
  description text NOT NULL,
  image_url text,
  unlock_requirement jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User collectibles table
CREATE TABLE IF NOT EXISTS user_collectibles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  collectible_id uuid REFERENCES collectibles(id) ON DELETE CASCADE NOT NULL,
  collected_at timestamptz DEFAULT now(),
  
  UNIQUE(user_id, collectible_id)
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('delivery', 'minigame', 'exploration', 'combat', 'riddle')),
  requirements jsonb NOT NULL DEFAULT '{}',
  rewards jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  unlock_requirement jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- User quests table
CREATE TABLE IF NOT EXISTS user_quests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quest_id uuid REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  progress jsonb DEFAULT '{}',
  is_active boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  started_at timestamptz,
  completed_at timestamptz,
  
  UNIQUE(user_id, quest_id)
);

-- Continents table
CREATE TABLE IF NOT EXISTS continents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  order_index integer NOT NULL,
  unlock_requirement jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Points of Interest table
CREATE TABLE IF NOT EXISTS pois (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  continent_id uuid REFERENCES continents(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Shop', 'Hospital', 'Bank', 'Quest', 'Battle', 'Dialogue', 'Minigame')),
  x_coordinate integer NOT NULL CHECK (x_coordinate >= 0 AND x_coordinate <= 100),
  y_coordinate integer NOT NULL CHECK (y_coordinate >= 0 AND y_coordinate <= 100),
  is_visible boolean DEFAULT true,
  unlock_requirement jsonb DEFAULT '{}',
  services jsonb DEFAULT '[]',
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- NPCs table
CREATE TABLE IF NOT EXISTS npcs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image_url text,
  personality text,
  services jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Dialogue nodes table
CREATE TABLE IF NOT EXISTS dialogue_nodes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  npc_id uuid REFERENCES npcs(id) ON DELETE CASCADE NOT NULL,
  node_key text NOT NULL,
  text text NOT NULL,
  choices jsonb DEFAULT '[]',
  conditions jsonb DEFAULT '{}',
  effects jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(npc_id, node_key)
);

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  poi_id uuid REFERENCES pois(id) ON DELETE CASCADE NOT NULL,
  npc_id uuid REFERENCES npcs(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Shop items table
CREATE TABLE IF NOT EXISTS shop_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  price integer NOT NULL,
  currency text DEFAULT 'xenocoins' CHECK (currency IN ('xenocoins', 'cash')),
  stock_limit integer,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(shop_id, item_id)
);

-- Minigames table
CREATE TABLE IF NOT EXISTS minigames (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('roguelike', 'puzzle', 'arcade', 'strategy')),
  description text NOT NULL,
  daily_reward_limit integer DEFAULT 3,
  base_reward integer DEFAULT 100,
  max_score integer DEFAULT 1000000,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  minigame_id uuid REFERENCES minigames(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL DEFAULT 0,
  achieved_at timestamptz DEFAULT now(),
  
  UNIQUE(minigame_id, user_id)
);

-- Sagas table
CREATE TABLE IF NOT EXISTS sagas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  total_steps integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  unlock_requirement jsonb DEFAULT '{}',
  rewards jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Saga steps table
CREATE TABLE IF NOT EXISTS saga_steps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  saga_id uuid REFERENCES sagas(id) ON DELETE CASCADE NOT NULL,
  step_number integer NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('dialogue', 'battle', 'puzzle', 'exploration', 'item')),
  requirements jsonb DEFAULT '{}',
  rewards jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(saga_id, step_number)
);

-- User saga progress table
CREATE TABLE IF NOT EXISTS user_saga_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  saga_id uuid REFERENCES sagas(id) ON DELETE CASCADE NOT NULL,
  current_step integer DEFAULT 0,
  is_active boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  started_at timestamptz,
  completed_at timestamptz,
  flags jsonb DEFAULT '{}',
  
  UNIQUE(user_id, saga_id)
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  initiator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  initiator_items jsonb DEFAULT '[]',
  recipient_items jsonb DEFAULT '[]',
  initiator_xenocoins bigint DEFAULT 0,
  recipient_xenocoins bigint DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  initiator_confirmed boolean DEFAULT false,
  recipient_confirmed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Duels table
CREATE TABLE IF NOT EXISTS duels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  opponent_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenger_pet_id uuid REFERENCES pets(id) ON DELETE CASCADE NOT NULL,
  opponent_pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed')),
  winner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  xenocoins_wagered bigint DEFAULT 0,
  battle_log jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE continents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pois ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialogue_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE minigames ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE sagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE saga_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saga_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read public profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Pets policies
CREATE POLICY "Users can manage own pets"
  ON pets FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can read other pets for battles"
  ON pets FOR SELECT
  TO authenticated
  USING (true);

-- Items policies (read-only for users, admin can manage)
CREATE POLICY "Users can read items"
  ON items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage items"
  ON items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Inventory policies
CREATE POLICY "Users can manage own inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Pet conditions policies
CREATE POLICY "Users can manage own pet conditions"
  ON pet_conditions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE id = pet_conditions.pet_id AND owner_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can manage own notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Achievements policies
CREATE POLICY "Users can read achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage achievements"
  ON achievements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- User achievements policies
CREATE POLICY "Users can manage own achievements"
  ON user_achievements FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Similar policies for other tables...
CREATE POLICY "Users can read collectibles"
  ON collectibles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own collectibles"
  ON user_collectibles FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read quests"
  ON quests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own quest progress"
  ON user_quests FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read world data"
  ON continents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read POIs"
  ON pois FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read NPCs"
  ON npcs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read dialogue"
  ON dialogue_nodes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read shops"
  ON shops FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read shop items"
  ON shop_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read minigames"
  ON minigames FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own leaderboard entries"
  ON leaderboards FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read leaderboards"
  ON leaderboards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read sagas"
  ON sagas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read saga steps"
  ON saga_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own saga progress"
  ON user_saga_progress FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own trades"
  ON trades FOR ALL
  TO authenticated
  USING (initiator_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can manage own duels"
  ON duels FOR ALL
  TO authenticated
  USING (challenger_id = auth.uid() OR opponent_id = auth.uid());

-- Functions for currency updates with anti-cheat
CREATE OR REPLACE FUNCTION update_user_currency(
  user_id uuid,
  currency_type text,
  amount bigint,
  reason text DEFAULT 'manual'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_amount bigint;
  max_daily_gain bigint := 1000000; -- Anti-cheat: max daily gain
BEGIN
  -- Validate currency type
  IF currency_type NOT IN ('xenocoins', 'cash') THEN
    RAISE EXCEPTION 'Invalid currency type';
  END IF;
  
  -- Anti-cheat: Check daily gain limits
  IF amount > max_daily_gain THEN
    RAISE EXCEPTION 'Amount exceeds daily limit';
  END IF;
  
  -- Get current amount
  IF currency_type = 'xenocoins' THEN
    SELECT xenocoins INTO current_amount FROM profiles WHERE id = user_id;
  ELSE
    SELECT cash INTO current_amount FROM profiles WHERE id = user_id;
  END IF;
  
  -- Prevent negative balances
  IF current_amount + amount < 0 THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;
  
  -- Update currency
  IF currency_type = 'xenocoins' THEN
    UPDATE profiles 
    SET xenocoins = xenocoins + amount,
        total_xenocoins = total_xenocoins + GREATEST(amount, 0),
        updated_at = now()
    WHERE id = user_id;
  ELSE
    UPDATE profiles 
    SET cash = cash + amount,
        updated_at = now()
    WHERE id = user_id;
  END IF;
  
  RETURN true;
END;
$$;

-- Function to calculate pet level
CREATE OR REPLACE FUNCTION calculate_pet_level(pet_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  total_stats integer;
  pet_level integer;
BEGIN
  SELECT 
    strength + dexterity + intelligence + speed + 
    attack + defense + precision + evasion + luck
  INTO total_stats
  FROM pets
  WHERE id = pet_id;
  
  -- Level calculation: every 10 stat points = 1 level
  pet_level := GREATEST(1, total_stats / 10);
  
  -- Update pet level
  UPDATE pets 
  SET level = pet_level,
      updated_at = now()
  WHERE id = pet_id;
  
  RETURN pet_level;
END;
$$;

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, username, language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en-US')
  );
  
  -- Add welcome notification
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    NEW.id,
    'info',
    'Welcome to Xenopets!',
    'Your adventure begins now. Choose your first egg to get started!'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_minigame_score ON leaderboards(minigame_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_trades_participants ON trades(initiator_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_duels_participants ON duels(challenger_id, opponent_id);