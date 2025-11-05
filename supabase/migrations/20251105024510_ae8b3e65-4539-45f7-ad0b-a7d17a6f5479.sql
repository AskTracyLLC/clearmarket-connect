-- Drop the old unique constraint that prevents multiple coverage areas per state
ALTER TABLE coverage_areas 
DROP CONSTRAINT IF EXISTS coverage_areas_user_state_uidx;

-- Add a new unique constraint that allows multiple states but prevents duplicate county combinations
-- This allows: WI-Milwaukee County AND WI-Racine County, but prevents duplicate WI-Milwaukee County entries
CREATE UNIQUE INDEX coverage_areas_user_state_counties_uidx 
ON coverage_areas (user_id, state_code, counties);

-- Add a comment explaining the constraint
COMMENT ON INDEX coverage_areas_user_state_counties_uidx IS 
'Allows multiple coverage areas per state with different county combinations. Prevents duplicate state+county entries for the same user.';