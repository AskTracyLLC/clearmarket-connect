
-- Create vendor network alerts table
CREATE TABLE public.vendor_network_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message_body TEXT NOT NULL,
  filters_used JSONB,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  scheduled_send_date TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_outdated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track recipients (for logging, blind copied)
CREATE TABLE public.vendor_network_alert_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vendor_network_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_network_alert_recipients ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_network_alerts
CREATE POLICY "Vendors can view own alerts" 
ON public.vendor_network_alerts 
FOR SELECT 
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create own alerts" 
ON public.vendor_network_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update own alerts" 
ON public.vendor_network_alerts 
FOR UPDATE 
USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete own alerts" 
ON public.vendor_network_alerts 
FOR DELETE 
USING (auth.uid() = vendor_id);

-- RLS policies for vendor_network_alert_recipients
CREATE POLICY "Vendors can view recipients of own alerts" 
ON public.vendor_network_alert_recipients 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.vendor_network_alerts 
  WHERE id = alert_id AND vendor_id = auth.uid()
));

CREATE POLICY "System can insert recipients" 
ON public.vendor_network_alert_recipients 
FOR INSERT 
WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.vendor_network_alerts 
ADD CONSTRAINT fk_vendor_network_alerts_vendor_id 
FOREIGN KEY (vendor_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.vendor_network_alert_recipients 
ADD CONSTRAINT fk_vendor_network_alert_recipients_alert_id 
FOREIGN KEY (alert_id) REFERENCES public.vendor_network_alerts(id) ON DELETE CASCADE;

ALTER TABLE public.vendor_network_alert_recipients 
ADD CONSTRAINT fk_vendor_network_alert_recipients_recipient_id 
FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_vendor_network_alerts_updated_at
BEFORE UPDATE ON public.vendor_network_alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
