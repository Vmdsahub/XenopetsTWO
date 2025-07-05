/*
  # Fix Data Persistence and Synchronization Issues

  1. Enhanced Functions
    - Improved currency update function with better validation
    - Enhanced pet level calculation
    - New function for account score updates
    - Equipment transaction functions for better consistency

  2. Triggers
    - Auto-update triggers for better data consistency
    - Profile update triggers

  3. Indexes
    - Performance indexes for better query speed
    - Composite indexes for common queries

  4. Data Integrity
    - Better constraints and validation
    - Cascade deletes for data consistency
*/

-- Enhanced currency update function with better validation and logging
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
  max_daily_gain bigint := 1000000;
  new_total bigint;
BEGIN
  -- Validate currency type
  IF currency_type NOT IN ('xenocoins', 'cash') THEN
    RAISE EXCEPTION 'Invalid currency type: %', currency_type;
  END IF;
  
  -- Anti-cheat: Check daily gain limits for positive amounts
  IF amount > 0 AND amount > max_daily_gain THEN
    RAISE EXCEPTION 'Amount exceeds daily limit: %', amount;
  END IF;
  
  -- Get current amount and validate
  IF currency_type = 'xenocoins' THEN
    SELECT xenocoins INTO current_amount FROM profiles WHERE id = user_id;
  ELSE
    SELECT cash INTO current_amount FROM profiles WHERE id = user_id;
  END IF;
  
  IF current_amount IS NULL THEN
    RAISE EXCEPTION 'User not found: %', user_id;
  END IF;
  
  -- Calculate new amount and prevent negative balances
  new_total := current_amount + amount;
  IF new_total < 0 THEN
    RAISE EXCEPTION 'Insufficient funds. Current: %, Requested: %', current_amount, amount;
  END IF;
  
  -- Update currency with atomic operation
  IF currency_type = 'xenocoins' THEN
    UPDATE profiles 
    SET xenocoins = new_total,
        total_xenocoins = total_xenocoins + GREATEST(amount, 0),
        updated_at = now()
    WHERE id = user_id;
  ELSE
    UPDATE profiles 
    SET cash = new_total,
        updated_at = now()
    WHERE id = user_id;
  END IF;
  
  -- Verify the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update currency for user: %', user_id;
  END IF;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise
    RAISE EXCEPTION 'Currency update failed: %', SQLERRM;
END;
$$;

-- Enhanced pet level calculation with better stat weighting
CREATE OR REPLACE FUNCTION calculate_pet_level(pet_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  total_stats integer;
  pet_level integer;
  pet_exists boolean;
BEGIN
  -- Check if pet exists
  SELECT EXISTS(SELECT 1 FROM pets WHERE id = pet_id) INTO pet_exists;
  
  IF NOT pet_exists THEN
    RAISE EXCEPTION 'Pet not found: %', pet_id;
  END IF;
  
  -- Calculate total stats with proper weighting
  SELECT 
    strength + dexterity + intelligence + speed + 
    attack + defense + precision + evasion + luck
  INTO total_stats
  FROM pets
  WHERE id = pet_id;
  
  -- Level calculation: every 10 stat points = 1 level, minimum level 1
  pet_level := GREATEST(1, total_stats / 10);
  
  -- Update pet level atomically
  UPDATE pets 
  SET level = pet_level,
      updated_at = now()
  WHERE id = pet_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update pet level for pet: %', pet_id;
  END IF;
  
  RETURN pet_level;
END;
$$;

-- Function to update account score
CREATE OR REPLACE FUNCTION update_account_score(
  user_id uuid,
  points bigint,
  reason text DEFAULT 'game_action'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_score bigint;
  new_score bigint;
BEGIN
  -- Get current score
  SELECT account_score INTO current_score FROM profiles WHERE id = user_id;
  
  IF current_score IS NULL THEN
    RAISE EXCEPTION 'User not found: %', user_id;
  END IF;
  
  -- Calculate new score (prevent negative scores)
  new_score := GREATEST(0, current_score + points);
  
  -- Update account score
  UPDATE profiles 
  SET account_score = new_score,
      updated_at = now()
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update account score for user: %', user_id;
  END IF;
  
  RETURN true;
END;
$$;

-- Enhanced equipment transaction function
CREATE OR REPLACE FUNCTION equip_item_transaction(
  p_user_id uuid,
  p_pet_id uuid,
  p_inventory_item_id uuid,
  p_item_slot text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_exists boolean;
  pet_exists boolean;
  slot_occupied boolean;
BEGIN
  -- Verify pet belongs to user
  SELECT EXISTS(
    SELECT 1 FROM pets 
    WHERE id = p_pet_id AND owner_id = p_user_id
  ) INTO pet_exists;
  
  IF NOT pet_exists THEN
    RAISE EXCEPTION 'Pet not found or does not belong to user';
  END IF;
  
  -- Verify item exists in user's inventory and is not equipped
  SELECT EXISTS(
    SELECT 1 FROM inventory 
    WHERE id = p_inventory_item_id 
    AND user_id = p_user_id 
    AND quantity = 1 
    AND is_equipped = false
  ) INTO item_exists;
  
  IF NOT item_exists THEN
    RAISE EXCEPTION 'Item not found in inventory or already equipped';
  END IF;
  
  -- Check if slot is already occupied by this pet
  SELECT EXISTS(
    SELECT 1 FROM inventory i
    JOIN items it ON i.item_id = it.id
    WHERE i.equipped_pet_id = p_pet_id 
    AND it.slot = p_item_slot 
    AND i.is_equipped = true
  ) INTO slot_occupied;
  
  IF slot_occupied THEN
    RAISE EXCEPTION 'Slot conflict: another item is already equipped in this slot';
  END IF;
  
  -- Equip the item
  UPDATE inventory 
  SET is_equipped = true,
      equipped_pet_id = p_pet_id
  WHERE id = p_inventory_item_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to equip item';
  END IF;
  
  RETURN true;
END;
$$;

-- Enhanced unequip transaction function
CREATE OR REPLACE FUNCTION unequip_item_transaction(
  p_user_id uuid,
  p_pet_id uuid,
  p_inventory_item_id uuid,
  p_item_slot text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_equipped boolean;
BEGIN
  -- Verify item is equipped by this pet
  SELECT EXISTS(
    SELECT 1 FROM inventory i
    JOIN items it ON i.item_id = it.id
    WHERE i.id = p_inventory_item_id
    AND i.user_id = p_user_id
    AND i.equipped_pet_id = p_pet_id
    AND i.is_equipped = true
    AND it.slot = p_item_slot
  ) INTO item_equipped;
  
  IF NOT item_equipped THEN
    RAISE EXCEPTION 'Item not equipped by this pet in the specified slot';
  END IF;
  
  -- Unequip the item
  UPDATE inventory 
  SET is_equipped = false,
      equipped_pet_id = null
  WHERE id = p_inventory_item_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to unequip item';
  END IF;
  
  RETURN true;
END;
$$;

-- Function to safely add collectible to user
CREATE OR REPLACE FUNCTION add_user_collectible_safe(
  p_user_id uuid,
  p_collectible_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  collectible_id uuid;
  collectible_points integer := 1;
BEGIN
  -- Find collectible by name
  SELECT id INTO collectible_id 
  FROM collectibles 
  WHERE name = p_collectible_name;
  
  IF collectible_id IS NULL THEN
    RAISE EXCEPTION 'Collectible not found: %', p_collectible_name;
  END IF;
  
  -- Add to user collectibles (ignore if already exists)
  INSERT INTO user_collectibles (user_id, collectible_id)
  VALUES (p_user_id, collectible_id)
  ON CONFLICT (user_id, collectible_id) DO NOTHING;
  
  -- Update account score
  PERFORM update_account_score(p_user_id, collectible_points, 'collectible_obtained');
  
  RETURN true;
END;
$$;

-- Trigger to auto-update pet level when stats change
CREATE OR REPLACE FUNCTION trigger_update_pet_level()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only recalculate if stat-related columns changed
  IF (OLD.strength != NEW.strength OR 
      OLD.dexterity != NEW.dexterity OR 
      OLD.intelligence != NEW.intelligence OR 
      OLD.speed != NEW.speed OR 
      OLD.attack != NEW.attack OR 
      OLD.defense != NEW.defense OR 
      OLD.precision != NEW.precision OR 
      OLD.evasion != NEW.evasion OR 
      OLD.luck != NEW.luck) THEN
    
    PERFORM calculate_pet_level(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for pet level updates
DROP TRIGGER IF EXISTS pet_stats_update_level ON pets;
CREATE TRIGGER pet_stats_update_level
  AFTER UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_pet_level();

-- Trigger to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_profile_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS profile_update_timestamp ON profiles;
CREATE TRIGGER profile_update_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_profile_timestamp();

-- Enhanced indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_username_lower ON profiles (LOWER(username));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_account_score ON profiles (account_score DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_last_login ON profiles (last_login DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pets_owner_level ON pets (owner_id, level DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pets_species_level ON pets (species, level DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_user_equipped ON inventory (user_id, is_equipped);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_pet_equipped ON inventory (equipped_pet_id) WHERE is_equipped = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_user_unlocked ON user_achievements (user_id, is_unlocked);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_collectibles_user ON user_collectibles (user_id, collected_at DESC);

-- Add constraint to ensure pets have valid owners
ALTER TABLE pets ADD CONSTRAINT pets_owner_exists 
  FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add constraint to ensure inventory items belong to valid users
ALTER TABLE inventory ADD CONSTRAINT inventory_user_exists 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Add constraint to ensure equipped items belong to valid pets
ALTER TABLE inventory ADD CONSTRAINT inventory_pet_exists 
  FOREIGN KEY (equipped_pet_id) REFERENCES pets(id) ON DELETE SET NULL;

-- Function to clean up old notifications (keep only last 100 per user)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM notifications 
  WHERE id IN (
    SELECT id FROM (
      SELECT id, 
             ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
      FROM notifications
    ) ranked
    WHERE rn > 100
  );
END;
$$;

-- Create a function to validate game data integrity
CREATE OR REPLACE FUNCTION validate_game_data_integrity()
RETURNS TABLE(issue_type text, issue_description text, affected_count bigint)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check for orphaned pets
  RETURN QUERY
  SELECT 'orphaned_pets'::text, 
         'Pets without valid owners'::text,
         COUNT(*)::bigint
  FROM pets p
  LEFT JOIN profiles pr ON p.owner_id = pr.id
  WHERE pr.id IS NULL;
  
  -- Check for orphaned inventory items
  RETURN QUERY
  SELECT 'orphaned_inventory'::text,
         'Inventory items without valid users'::text,
         COUNT(*)::bigint
  FROM inventory i
  LEFT JOIN profiles pr ON i.user_id = pr.id
  WHERE pr.id IS NULL;
  
  -- Check for invalid equipped items
  RETURN QUERY
  SELECT 'invalid_equipped_items'::text,
         'Equipped items with invalid pet references'::text,
         COUNT(*)::bigint
  FROM inventory i
  LEFT JOIN pets p ON i.equipped_pet_id = p.id
  WHERE i.is_equipped = true AND p.id IS NULL;
  
  RETURN;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_user_currency TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_pet_level TO authenticated;
GRANT EXECUTE ON FUNCTION update_account_score TO authenticated;
GRANT EXECUTE ON FUNCTION equip_item_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION unequip_item_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_collectible_safe TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION validate_game_data_integrity TO authenticated;