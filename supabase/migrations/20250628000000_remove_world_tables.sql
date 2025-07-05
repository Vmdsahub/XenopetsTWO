/*
  # Remove World-Related Tables
  
  This migration removes all tables and data related to world/continent features:
  - continents
  - pois (points of interest)
  - galaxy_worlds
  
  These features are being removed to start fresh with world functionality.
*/

-- Drop tables in the correct order due to foreign key constraints
DROP TABLE IF EXISTS pois CASCADE;
DROP TABLE IF EXISTS continents CASCADE;
DROP TABLE IF EXISTS galaxy_worlds CASCADE;

-- Drop any functions related to worlds
DROP FUNCTION IF EXISTS update_galaxy_worlds_updated_at() CASCADE;
