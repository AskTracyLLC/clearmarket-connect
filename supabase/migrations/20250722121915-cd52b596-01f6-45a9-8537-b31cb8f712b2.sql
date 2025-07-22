
-- Add visibility and folder_category columns to user_documents table
ALTER TABLE public.user_documents 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'network_shared')),
ADD COLUMN IF NOT EXISTS folder_category TEXT DEFAULT 'general' CHECK (folder_category IN ('legal', 'profile', 'credentials', 'identity', 'general'));

-- Add default visibility and folder to document_type_config
ALTER TABLE public.document_type_config
ADD COLUMN IF NOT EXISTS default_visibility TEXT DEFAULT 'private' CHECK (default_visibility IN ('private', 'public', 'network_shared')),
ADD COLUMN IF NOT EXISTS default_folder_category TEXT DEFAULT 'general' CHECK (default_folder_category IN ('legal', 'profile', 'credentials', 'identity', 'general'));

-- Create legal_documents table for NDA and other legal document management
CREATE TABLE IF NOT EXISTS public.legal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL, -- 'nda', 'terms', 'privacy_policy', etc.
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  is_active BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on legal_documents
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for legal_documents
CREATE POLICY "Admins can manage legal documents" 
ON public.legal_documents 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Everyone can view active legal documents" 
ON public.legal_documents 
FOR SELECT 
USING (is_active = true);

-- Create document_access_log table for audit trail
CREATE TABLE IF NOT EXISTS public.document_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.user_documents(id) ON DELETE CASCADE,
  accessed_by UUID REFERENCES auth.users(id),
  access_type TEXT NOT NULL, -- 'view', 'download', 'share'
  ip_address INET,
  user_agent TEXT,
  shared_with UUID REFERENCES auth.users(id), -- if shared with someone
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on document_access_log
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_access_log
CREATE POLICY "Users can view own document access logs" 
ON public.document_access_log 
FOR SELECT 
USING (accessed_by = auth.uid() OR shared_with = auth.uid());

CREATE POLICY "Admins can view all document access logs" 
ON public.document_access_log 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "System can insert document access logs" 
ON public.document_access_log 
FOR INSERT 
WITH CHECK (true);

-- Update document_type_config with default settings for common document types
UPDATE public.document_type_config 
SET 
  default_visibility = 'private',
  default_folder_category = 'legal'
WHERE document_type = 'nda';

-- Insert additional document types for better organization
INSERT INTO public.document_type_config (
  document_type, display_name, description, default_visibility, default_folder_category,
  required_for_roles, requires_expiration, max_file_size, allowed_mime_types,
  verification_required, display_order, is_active
) VALUES 
(
  'profile_picture', 'Profile Picture', 'Professional profile photo for network sharing',
  'public', 'profile', ARRAY['field_rep', 'vendor'], false, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/jpg'], false, 10, true
),
(
  'aspen_proof', 'Aspen Grove ID Proof', 'Screenshot or photo of Aspen Grove credential',
  'public', 'credentials', ARRAY['field_rep'], false, 10485760,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'], false, 15, true
),
(
  'business_license', 'Business License', 'Professional business license certificate',
  'public', 'credentials', ARRAY['vendor'], true, 10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png'], true, 20, true
),
(
  'government_id', 'Government ID', 'Driver license, passport, or state ID (private)',
  'private', 'identity', ARRAY['field_rep', 'vendor'], true, 10485760,
  ARRAY['image/jpeg', 'image/png', 'application/pdf'], true, 25, true
)
ON CONFLICT (document_type) DO UPDATE SET
  default_visibility = EXCLUDED.default_visibility,
  default_folder_category = EXCLUDED.default_folder_category,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description;

-- Add updated_at trigger for legal_documents
CREATE TRIGGER update_legal_documents_updated_at
BEFORE UPDATE ON public.legal_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log document access
CREATE OR REPLACE FUNCTION public.log_document_access(
  doc_id UUID,
  access_type_param TEXT,
  shared_with_param UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.document_access_log (
    document_id, accessed_by, access_type, shared_with, ip_address
  ) VALUES (
    doc_id, auth.uid(), access_type_param, shared_with_param, 
    inet_client_addr()
  );
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Update RLS policies for user_documents to handle visibility
DROP POLICY IF EXISTS "Users can view own documents" ON public.user_documents;
CREATE POLICY "Users can view own documents" 
ON public.user_documents 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can view public documents" 
ON public.user_documents 
FOR SELECT 
USING (visibility = 'public');

CREATE POLICY "Network members can view shared documents" 
ON public.user_documents 
FOR SELECT 
USING (
  visibility = 'network_shared' AND
  EXISTS (
    SELECT 1 FROM public.contact_unlocks 
    WHERE (unlocker_id = auth.uid() AND unlocked_user_id = user_documents.user_id)
       OR (unlocked_user_id = auth.uid() AND unlocker_id = user_documents.user_id)
  )
);
