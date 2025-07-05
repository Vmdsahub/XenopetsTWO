/*
  # Fix Initial Currency Values
  
  This migration fixes the initial currency values for new users to be 0 instead of 1000 Xenocoins and 10 Cash.
  
  1. Changes
    - Update the handle_new_user function to set initial currencies to 0
    - Update the default values in the profiles table schema for future consistency
    
  2. Security
    - Function is marked as SECURITY DEFINER and owned by supabase_auth_admin
*/

-- Drop and recreate the handle_new_user function with correct initial values
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with 0 initial currency values
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
    0, -- account_score
    0, -- days_played  
    0, -- total_xenocoins
    0, -- xenocoins starting amount (changed from 1000 to 0)
    0, -- cash starting amount (changed from 10 to 0)
    COALESCE(
      NEW.raw_user_meta_data->>'preferences',
      '{"notifications": true, "soundEffects": true, "musicVolume": 0.7, "language": "en-US", "theme": "light", "privacy": {"showOnline": true, "allowDuels": true, "allowTrades": true}}'
    )::jsonb,
    now(),
    now(),
    now()
  );
  
  -- Add welcome notification
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    NEW.id,
    'info',
    'Bem-vindo aos Xenopets!',
    'Sua aventura começa agora. Escolha seu primeiro ovo para começar!'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the default values in the profiles table for consistency
-- (This won't affect existing users, only new users if the trigger fails)
ALTER TABLE public.profiles 
  ALTER COLUMN xenocoins SET DEFAULT 0,
  ALTER COLUMN cash SET DEFAULT 0;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.notifications TO supabase_auth_admin;
