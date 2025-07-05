/*
  # Fix Profile Creation Issue
  
  1. Problem
    - Users are not being properly saved during registration
    - Multiple handle_new_user functions may be conflicting
    - The trigger might not be properly creating profiles with all required fields
    
  2. Changes
    - Drop existing trigger and function
    - Recreate with complete profile creation logic
    - Ensure all default values are properly set
    - Handle the "Vitoca" admin case correctly
*/

-- Drop existing trigger and function to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the complete function to handle new user profile creation
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
    1000, -- xenocoins starting amount
    10, -- cash starting amount
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.notifications TO supabase_auth_admin;
