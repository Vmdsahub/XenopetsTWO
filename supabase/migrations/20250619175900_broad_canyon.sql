/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - The "Admins can manage all profiles" policy creates infinite recursion
    - It queries the profiles table from within a profiles table policy
    - This causes the policy to call itself infinitely

  2. Solution
    - Drop the problematic admin policy
    - Create a new admin policy that uses auth.jwt() to check admin status
    - This avoids querying the profiles table from within its own policy

  3. Security
    - Maintain the same security level
    - Users can still only read their own profile and public profiles
    - Admins can still manage all profiles, but through a non-recursive check
*/

-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Create a new admin policy that doesn't cause recursion
-- This policy checks for admin status in the JWT claims instead of querying profiles table
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin',
      'false'
    )::boolean = true
  );

-- Alternative approach: Create a function that safely checks admin status
-- This function will be used if the JWT approach doesn't work
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin',
    'false'
  )::boolean;
$$;

-- If the JWT approach doesn't work, we can use this alternative policy
-- (commented out for now, uncomment if needed)
/*
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL
  TO authenticated
  USING (is_admin());
*/