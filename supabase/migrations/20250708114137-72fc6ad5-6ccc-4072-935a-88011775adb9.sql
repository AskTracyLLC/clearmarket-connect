-- Calendar events for both field reps and vendors
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'unavailable', 'office_closure', 'pay_date'
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  description TEXT,
  notify_network BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bulk messages sent to vendor networks
CREATE TABLE public.bulk_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_template TEXT NOT NULL, -- 'availability', 'emergency'
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  area TEXT, -- for availability messages
  dates_mentioned DATE[], -- for date-specific messages
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipients of bulk messages
CREATE TABLE public.bulk_message_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_message_id UUID NOT NULL REFERENCES public.bulk_messages(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bulk_message_id, recipient_id)
);

-- Auto-reply settings for users
CREATE TABLE public.auto_reply_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT false,
  message_template TEXT,
  active_from DATE,
  active_until DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_reply_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendar_events
CREATE POLICY "Users can view own calendar events" ON public.calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calendar events" ON public.calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events" ON public.calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" ON public.calendar_events
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Network members can view shared events" ON public.calendar_events
  FOR SELECT USING (
    notify_network = true AND 
    EXISTS (
      SELECT 1 FROM public.contact_unlocks 
      WHERE (unlocker_id = auth.uid() AND unlocked_user_id = user_id)
         OR (unlocked_user_id = auth.uid() AND unlocker_id = user_id)
    )
  );

-- RLS Policies for bulk_messages
CREATE POLICY "Users can view own bulk messages" ON public.bulk_messages
  FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Users can create bulk messages" ON public.bulk_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can view messages sent to them" ON public.bulk_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bulk_message_recipients 
      WHERE bulk_message_id = id AND recipient_id = auth.uid()
    )
  );

-- RLS Policies for bulk_message_recipients
CREATE POLICY "Users can view own received messages" ON public.bulk_message_recipients
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Senders can view message recipients" ON public.bulk_message_recipients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bulk_messages 
      WHERE id = bulk_message_id AND sender_id = auth.uid()
    )
  );

CREATE POLICY "System can insert message recipients" ON public.bulk_message_recipients
  FOR INSERT WITH CHECK (true);

-- RLS Policies for auto_reply_settings
CREATE POLICY "Users can view own auto-reply settings" ON public.auto_reply_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own auto-reply settings" ON public.auto_reply_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own auto-reply settings" ON public.auto_reply_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own auto-reply settings" ON public.auto_reply_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_auto_reply_settings_updated_at
  BEFORE UPDATE ON public.auto_reply_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_dates ON public.calendar_events(start_date, end_date);
CREATE INDEX idx_calendar_events_type ON public.calendar_events(event_type);
CREATE INDEX idx_bulk_messages_sender_id ON public.bulk_messages(sender_id);
CREATE INDEX idx_bulk_message_recipients_bulk_message_id ON public.bulk_message_recipients(bulk_message_id);
CREATE INDEX idx_bulk_message_recipients_recipient_id ON public.bulk_message_recipients(recipient_id);
CREATE INDEX idx_auto_reply_settings_user_id ON public.auto_reply_settings(user_id);
CREATE INDEX idx_auto_reply_settings_dates ON public.auto_reply_settings(active_from, active_until);