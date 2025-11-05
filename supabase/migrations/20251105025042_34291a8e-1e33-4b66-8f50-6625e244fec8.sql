-- Remove legacy unique index that blocks multiple areas per state
DROP INDEX IF EXISTS coverage_areas_user_state_uidx;