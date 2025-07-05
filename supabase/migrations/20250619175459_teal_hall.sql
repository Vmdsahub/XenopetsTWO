/*
  # Create automatic user profile creation trigger

  1. New Functions
    - `handle_new_user()` - Automatically creates a profile when a new user signs up
  
  2. New Triggers
    - Trigger on `auth.users` table to call `handle_new_user()` function
  
  3. Security
    - Ensures profiles are created with proper default values
    - Handles the "Vitoca" admin user case
*/

-- Create the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    phone,
    is_admin,
    language,
    account_score,
    days_played,
    total_xenocoins,
    xenocoins,
    cash,
    preferences,
    created_at,
    updated_at,
    last_login
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User'),
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN LOWER(COALESCE(NEW.raw_user_meta_data->>'username', '')) = 'vitoca' THEN true
      ELSE false
    END,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en-US'),
    0,
    0,
    0,
    1000,
    10,
    COALESCE(
      NEW.raw_user_meta_data->'preferences',
      '{"theme": "light", "privacy": {"allowDuels": true, "showOnline": true, "allowTrades": true}, "musicVolume": 0.7, "soundEffects": true, "notifications": true}'::jsonb
    ),
    NOW(),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;