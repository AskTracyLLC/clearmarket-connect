-- Create vendor organizations table
CREATE TABLE public.vendor_organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor staff members table
CREATE TABLE public.vendor_staff_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vendor_org_id UUID NOT NULL REFERENCES public.vendor_organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'manager')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, vendor_org_id)
);

-- Create message threads table
CREATE TABLE public.message_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_rep_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vendor_org_id UUID NOT NULL REFERENCES public.vendor_organizations(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(field_rep_id, vendor_org_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  file_url TEXT,
  is_read_by JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vendor_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_organizations
CREATE POLICY "Vendor staff can view their organization"
ON public.vendor_organizations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_staff_members vsm
    WHERE vsm.vendor_org_id = id
    AND vsm.user_id = auth.uid()
    AND vsm.is_active = true
  )
);

CREATE POLICY "Admins can manage vendor organizations"
ON public.vendor_organizations
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for vendor_staff_members
CREATE POLICY "Vendor staff can view their organization's staff"
ON public.vendor_staff_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_staff_members vsm
    WHERE vsm.vendor_org_id = vendor_staff_members.vendor_org_id
    AND vsm.user_id = auth.uid()
    AND vsm.is_active = true
  )
);

CREATE POLICY "Vendor admins can manage their organization's staff"
ON public.vendor_staff_members
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_staff_members vsm
    WHERE vsm.vendor_org_id = vendor_staff_members.vendor_org_id
    AND vsm.user_id = auth.uid()
    AND vsm.role = 'admin'
    AND vsm.is_active = true
  )
);

CREATE POLICY "Admins can manage all vendor staff"
ON public.vendor_staff_members
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for message_threads
CREATE POLICY "Field reps can access their threads"
ON public.message_threads
FOR ALL
TO authenticated
USING (field_rep_id = auth.uid());

CREATE POLICY "Vendor staff can access their organization's threads"
ON public.message_threads
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vendor_staff_members vsm
    WHERE vsm.vendor_org_id = message_threads.vendor_org_id
    AND vsm.user_id = auth.uid()
    AND vsm.is_active = true
  )
);

-- RLS Policies for messages
CREATE POLICY "Users can access messages in their threads"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.message_threads mt
    WHERE mt.id = thread_id
    AND (
      mt.field_rep_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.vendor_staff_members vsm
        WHERE vsm.vendor_org_id = mt.vendor_org_id
        AND vsm.user_id = auth.uid()
        AND vsm.is_active = true
      )
    )
  )
);

CREATE POLICY "Users can create messages in their threads"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.message_threads mt
    WHERE mt.id = thread_id
    AND (
      mt.field_rep_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.vendor_staff_members vsm
        WHERE vsm.vendor_org_id = mt.vendor_org_id
        AND vsm.user_id = auth.uid()
        AND vsm.is_active = true
      )
    )
  )
);

CREATE POLICY "Users can update messages they sent"
ON public.messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid());

-- Create function to update last_message_at in threads
CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.message_threads
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_message_at
CREATE TRIGGER update_thread_last_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thread_last_message();

-- Create indexes for better performance
CREATE INDEX idx_vendor_staff_members_user_id ON public.vendor_staff_members(user_id);
CREATE INDEX idx_vendor_staff_members_vendor_org_id ON public.vendor_staff_members(vendor_org_id);
CREATE INDEX idx_message_threads_field_rep_id ON public.message_threads(field_rep_id);
CREATE INDEX idx_message_threads_vendor_org_id ON public.message_threads(vendor_org_id);
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Enable realtime for all messaging tables
ALTER TABLE public.vendor_organizations REPLICA IDENTITY FULL;
ALTER TABLE public.vendor_staff_members REPLICA IDENTITY FULL;
ALTER TABLE public.message_threads REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_organizations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_staff_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;