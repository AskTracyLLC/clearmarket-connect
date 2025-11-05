-- Fix sync_coverage_areas_v2 to properly set user_id
CREATE OR REPLACE FUNCTION sync_coverage_areas_v2(
  p_username TEXT,
  p_payload JSONB
)
RETURNS TABLE(inserted INT, updated INT, deleted INT) AS $$
DECLARE
  v_user_id UUID;
  v_inserted INT := 0;
  v_updated INT := 0;
  v_deleted INT := 0;
  v_area JSONB;
  v_existing_id UUID;
  v_county_array TEXT[];
BEGIN
  -- Look up the user_id from the anonymous_username
  SELECT id INTO v_user_id
  FROM users
  WHERE anonymous_username = p_username;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with anonymous_username: %', p_username;
  END IF;

  -- Delete coverage areas not in the new payload
  DELETE FROM coverage_areas
  WHERE user_id = v_user_id
  AND anonymous_username = p_username
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_payload) AS new_area
    WHERE 
      (new_area->>'state_code') = coverage_areas.state_code
      AND (new_area->'counties')::jsonb = to_jsonb(coverage_areas.counties)
  );

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  -- Process each coverage area in the payload
  FOR v_area IN SELECT * FROM jsonb_array_elements(p_payload)
  LOOP
    -- Convert JSON array of counties to TEXT array
    SELECT ARRAY(SELECT jsonb_array_elements_text(v_area->'counties')) INTO v_county_array;

    -- Check if this coverage area already exists
    SELECT id INTO v_existing_id
    FROM coverage_areas
    WHERE user_id = v_user_id
    AND state_code = (v_area->>'state_code')
    AND counties = v_county_array;

    IF v_existing_id IS NOT NULL THEN
      -- Update existing coverage area
      UPDATE coverage_areas
      SET
        state_name = v_area->>'state_name',
        is_all_counties = (v_area->>'is_all_counties')::BOOLEAN,
        standard_price = (v_area->>'standard_price')::NUMERIC,
        rush_price = (v_area->>'rush_price')::NUMERIC,
        inspection_types = v_area->'inspection_types',
        updated_at = NOW()
      WHERE id = v_existing_id;

      v_updated := v_updated + 1;
    ELSE
      -- Insert new coverage area with user_id
      INSERT INTO coverage_areas (
        user_id,
        anonymous_username,
        state_code,
        state_name,
        counties,
        is_all_counties,
        standard_price,
        rush_price,
        inspection_types
      ) VALUES (
        v_user_id,  -- Now properly setting user_id
        p_username,
        v_area->>'state_code',
        v_area->>'state_name',
        v_county_array,
        (v_area->>'is_all_counties')::BOOLEAN,
        (v_area->>'standard_price')::NUMERIC,
        (v_area->>'rush_price')::NUMERIC,
        v_area->'inspection_types'
      );

      v_inserted := v_inserted + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_inserted, v_updated, v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;