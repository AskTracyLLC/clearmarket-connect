-- Add unique index for efficient lookups and prevent duplicate states per user
CREATE UNIQUE INDEX IF NOT EXISTS coverage_areas_user_state_uidx
ON public.coverage_areas (anonymous_username, state_code)
WHERE anonymous_username IS NOT NULL AND state_code IS NOT NULL;

-- Create trigger function for updated_at maintenance
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on coverage_areas
DROP TRIGGER IF EXISTS coverage_areas_set_updated_at ON public.coverage_areas;
CREATE TRIGGER coverage_areas_set_updated_at
BEFORE UPDATE ON public.coverage_areas
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.coverage_areas ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS ca_select ON public.coverage_areas;
DROP POLICY IF EXISTS ca_insert ON public.coverage_areas;
DROP POLICY IF EXISTS ca_update ON public.coverage_areas;
DROP POLICY IF EXISTS ca_delete ON public.coverage_areas;

-- Create RLS policies using JWT claim anonymous_username
CREATE POLICY ca_select ON public.coverage_areas
FOR SELECT USING (
  anonymous_username = current_setting('request.jwt.claims', true)::json->>'anonymous_username'
);

CREATE POLICY ca_insert ON public.coverage_areas
FOR INSERT WITH CHECK (
  anonymous_username = current_setting('request.jwt.claims', true)::json->>'anonymous_username'
);

CREATE POLICY ca_update ON public.coverage_areas
FOR UPDATE USING (
  anonymous_username = current_setting('request.jwt.claims', true)::json->>'anonymous_username'
);

CREATE POLICY ca_delete ON public.coverage_areas
FOR DELETE USING (
  anonymous_username = current_setting('request.jwt.claims', true)::json->>'anonymous_username'
);

-- Create the efficient diff-based sync RPC
CREATE OR REPLACE FUNCTION public.sync_coverage_areas_v2(
  p_username text,
  p_payload  jsonb
)
RETURNS TABLE(inserted int, updated int, deleted int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ins int := 0;
  v_upd int := 0;
  v_del int := 0;
BEGIN
  -- Guards
  IF p_username IS NULL OR length(p_username) = 0 THEN
    RAISE EXCEPTION 'anonymous_username required';
  END IF;
  IF p_username <> current_setting('request.jwt.claims', true)::json->>'anonymous_username' THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF p_payload IS NULL OR jsonb_typeof(p_payload) <> 'array' THEN
    RAISE EXCEPTION 'payload must be a jsonb array';
  END IF;

  -- Temp table to hold desired state
  CREATE TEMP TABLE _desired (
    state_code text PRIMARY KEY,
    state_name text,
    is_all_counties boolean,
    counties text[],
    standard_price text,
    rush_price text,
    inspection_types jsonb
  ) ON COMMIT DROP;

  INSERT INTO _desired (state_code, state_name, is_all_counties, counties, standard_price, rush_price, inspection_types)
  SELECT
    elem->>'state_code',
    elem->>'state_name',
    COALESCE((elem->>'is_all_counties')::boolean, false),
    CASE
      WHEN elem ? 'counties' THEN ARRAY(
        SELECT jsonb_array_elements_text(elem->'counties')
      )
      ELSE ARRAY[]::text[]
    END,
    elem->>'standard_price',
    elem->>'rush_price',
    COALESCE(elem->'inspection_types', '{}'::jsonb)
  FROM jsonb_array_elements(p_payload) AS elem;

  -- Delete states no longer desired
  WITH to_delete AS (
    SELECT ca.id
    FROM public.coverage_areas ca
    WHERE ca.anonymous_username = p_username
      AND NOT EXISTS (
        SELECT 1 FROM _desired d WHERE d.state_code = ca.state_code
      )
  )
  DELETE FROM public.coverage_areas ca
  USING to_delete td
  WHERE ca.id = td.id;
  
  GET DIAGNOSTICS v_del = ROW_COUNT;

  -- Insert missing states
  WITH missing AS (
    SELECT d.*
    FROM _desired d
    LEFT JOIN public.coverage_areas ca
      ON ca.anonymous_username = p_username
     AND ca.state_code = d.state_code
    WHERE ca.id IS NULL
  )
  INSERT INTO public.coverage_areas
    (id, anonymous_username, state_code, state_name, is_all_counties, counties, standard_price, rush_price, inspection_types, created_at, updated_at)
  SELECT
    gen_random_uuid(), p_username, state_code, state_name, is_all_counties, counties, standard_price, rush_price, inspection_types, now(), now()
  FROM missing;
  
  GET DIAGNOSTICS v_ins = ROW_COUNT;

  -- Update only changed states
  WITH existing AS (
    SELECT ca.id, ca.state_code,
           ca.state_name, ca.is_all_counties, ca.counties,
           ca.standard_price, ca.rush_price, ca.inspection_types
    FROM public.coverage_areas ca
    JOIN _desired d ON d.state_code = ca.state_code
    WHERE ca.anonymous_username = p_username
  ),
  changed AS (
    SELECT
      e.id,
      d.state_name,
      d.is_all_counties,
      d.counties,
      d.standard_price,
      d.rush_price,
      d.inspection_types
    FROM existing e
    JOIN _desired d USING (state_code)
    WHERE
      COALESCE(e.state_name,'')          <> COALESCE(d.state_name,'')
      OR COALESCE(e.is_all_counties,false) <> COALESCE(d.is_all_counties,false)
      OR COALESCE(e.counties, ARRAY[]::text[]) IS DISTINCT FROM COALESCE(d.counties, ARRAY[]::text[])
      OR COALESCE(e.standard_price,'')   <> COALESCE(d.standard_price,'')
      OR COALESCE(e.rush_price,'')       <> COALESCE(d.rush_price,'')
      OR COALESCE(e.inspection_types,'{}'::jsonb) IS DISTINCT FROM COALESCE(d.inspection_types,'{}'::jsonb)
  )
  UPDATE public.coverage_areas ca
  SET
    state_name       = c.state_name,
    is_all_counties  = c.is_all_counties,
    counties         = c.counties,
    standard_price   = c.standard_price,
    rush_price       = c.rush_price,
    inspection_types = c.inspection_types,
    updated_at       = now()
  FROM changed c
  WHERE ca.id = c.id;
  
  GET DIAGNOSTICS v_upd = ROW_COUNT;

  RETURN QUERY SELECT v_ins, v_upd, v_del;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_coverage_areas_v2(text, jsonb) TO authenticated;