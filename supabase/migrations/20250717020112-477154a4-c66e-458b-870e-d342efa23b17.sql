-- Add storage limit tracking to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS storage_limit_mb INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS storage_used_mb NUMERIC DEFAULT 0;

-- Update storage limits based on subscription tier
UPDATE public.users 
SET storage_limit_mb = CASE 
  WHEN subscription_tier = 'premium' THEN 500 
  ELSE 100 
END;

-- Create function to calculate user storage usage
CREATE OR REPLACE FUNCTION public.calculate_user_storage_usage(target_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_bytes NUMERIC := 0;
  total_mb NUMERIC := 0;
BEGIN
  -- Calculate total file size from user_documents
  SELECT COALESCE(SUM(file_size), 0) INTO total_bytes
  FROM public.user_documents
  WHERE user_id = target_user_id
  AND status != 'deleted';
  
  -- Convert bytes to MB
  total_mb := total_bytes / (1024.0 * 1024.0);
  
  -- Update user's storage usage
  UPDATE public.users
  SET storage_used_mb = total_mb
  WHERE id = target_user_id;
  
  RETURN total_mb;
END;
$$;

-- Create trigger to update storage usage when documents are added/removed
CREATE OR REPLACE FUNCTION public.update_user_storage_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update storage usage for the affected user
  IF TG_OP = 'DELETE' THEN
    PERFORM public.calculate_user_storage_usage(OLD.user_id);
    RETURN OLD;
  ELSE
    PERFORM public.calculate_user_storage_usage(NEW.user_id);
    RETURN NEW;
  END IF;
END;
$$;

-- Create triggers for storage usage tracking
DROP TRIGGER IF EXISTS trigger_update_storage_usage_insert ON public.user_documents;
DROP TRIGGER IF EXISTS trigger_update_storage_usage_delete ON public.user_documents;

CREATE TRIGGER trigger_update_storage_usage_insert
  AFTER INSERT ON public.user_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_storage_usage();

CREATE TRIGGER trigger_update_storage_usage_delete
  AFTER DELETE ON public.user_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_storage_usage();

-- Add NDA document type if not exists
INSERT INTO public.document_type_config (
  document_type,
  display_name,
  description,
  required_for_roles,
  requires_expiration,
  max_file_size,
  allowed_mime_types,
  verification_required,
  display_order,
  is_active
) VALUES (
  'nda',
  'Non-Disclosure Agreement',
  'Beta Tester NDA - automatically stored when signed',
  ARRAY['field_rep', 'vendor'],
  false,
  5242880, -- 5MB
  ARRAY['application/pdf'],
  false,
  1,
  true
) ON CONFLICT (document_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- Function to check if user has storage space available
CREATE OR REPLACE FUNCTION public.check_storage_available(target_user_id UUID, file_size_bytes BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_usage_mb NUMERIC;
  storage_limit_mb INTEGER;
  file_size_mb NUMERIC;
BEGIN
  -- Get current storage usage and limit
  SELECT storage_used_mb, u.storage_limit_mb
  INTO current_usage_mb, storage_limit_mb
  FROM public.users u
  WHERE id = target_user_id;
  
  -- Convert file size to MB
  file_size_mb := file_size_bytes / (1024.0 * 1024.0);
  
  -- Check if adding this file would exceed the limit
  RETURN (current_usage_mb + file_size_mb) <= storage_limit_mb;
END;
$$;