-- Create coverage request responses table to track interested reps
CREATE TABLE public.coverage_request_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL,
  field_rep_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'interested', -- 'interested', 'passed', 'hired'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, field_rep_id)
);

-- Create coverage request messages table for vendor-rep conversations  
CREATE TABLE public.coverage_request_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  message_content TEXT NOT NULL,
  is_bulk_message BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create coverage request passes table to track passed reps with reasons
CREATE TABLE public.coverage_request_passes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL,
  field_rep_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  pass_reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(request_id, field_rep_id)
);

-- Create vendor rep comments table for private vendor notes
CREATE TABLE public.vendor_rep_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  field_rep_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, field_rep_id)
);

-- Create coverage requests table (if not exists) to store the actual requests
CREATE TABLE IF NOT EXISTS public.coverage_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_monthly_volume TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  selected_state TEXT NOT NULL,
  selected_counties TEXT[] DEFAULT '{}',
  selected_cities TEXT[] DEFAULT '{}',
  selected_platforms TEXT[] DEFAULT '{}',
  selected_inspection_types TEXT[] DEFAULT '{}',
  abc_required BOOLEAN NULL,
  hud_key_required BOOLEAN NULL,
  years_experience_required TEXT,
  hide_from_all_network BOOLEAN NOT NULL DEFAULT false,
  hide_from_current_network BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'completed', 'expired'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Enable RLS on all tables
ALTER TABLE public.coverage_request_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coverage_request_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coverage_request_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_rep_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coverage_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coverage_request_responses
CREATE POLICY "Vendors can view responses to their requests"
ON public.coverage_request_responses
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.coverage_requests cr 
  WHERE cr.id = request_id AND cr.vendor_id = auth.uid()
));

CREATE POLICY "Field reps can create responses"
ON public.coverage_request_responses
FOR INSERT
WITH CHECK (auth.uid() = field_rep_id);

CREATE POLICY "Vendors can update responses to their requests"
ON public.coverage_request_responses
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.coverage_requests cr 
  WHERE cr.id = request_id AND cr.vendor_id = auth.uid()
));

-- RLS Policies for coverage_request_messages
CREATE POLICY "Users can view messages they sent or received"
ON public.coverage_request_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create messages"
ON public.coverage_request_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update read status"
ON public.coverage_request_messages
FOR UPDATE
USING (auth.uid() = recipient_id);

-- RLS Policies for coverage_request_passes
CREATE POLICY "Vendors can view their pass records"
ON public.coverage_request_passes
FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create pass records"
ON public.coverage_request_passes
FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

-- RLS Policies for vendor_rep_comments
CREATE POLICY "Vendors can view their own comments"
ON public.vendor_rep_comments
FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create their own comments"
ON public.vendor_rep_comments
FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own comments"
ON public.vendor_rep_comments
FOR UPDATE
USING (auth.uid() = vendor_id);

-- RLS Policies for coverage_requests
CREATE POLICY "Vendors can view their own requests"
ON public.coverage_requests
FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create their own requests"
ON public.coverage_requests
FOR INSERT
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own requests"
ON public.coverage_requests
FOR UPDATE
USING (auth.uid() = vendor_id);

CREATE POLICY "Field reps can view active requests"
ON public.coverage_requests
FOR SELECT
USING (status = 'active');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coverage_request_responses_updated_at
  BEFORE UPDATE ON public.coverage_request_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_rep_comments_updated_at
  BEFORE UPDATE ON public.vendor_rep_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coverage_requests_updated_at
  BEFORE UPDATE ON public.coverage_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();