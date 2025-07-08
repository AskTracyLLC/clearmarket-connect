-- Create index for filtering visibility (if not exists)
CREATE INDEX IF NOT EXISTS idx_calendar_events_visibility ON public.calendar_events(event_visibility);

-- Backfill: promote existing shared events to network visibility
UPDATE public.calendar_events 
SET event_visibility = 'network' 
WHERE notify_network = true AND event_visibility = 'private';

-- Update RLS policy to use event_visibility instead of notify_network
DROP POLICY IF EXISTS "Network members can view shared events" ON public.calendar_events;

CREATE POLICY "Network members can view shared events" ON public.calendar_events
FOR SELECT USING (
  event_visibility = 'network' AND 
  EXISTS (
    SELECT 1 FROM public.contact_unlocks 
    WHERE (unlocker_id = auth.uid() AND unlocked_user_id = user_id)
       OR (unlocked_user_id = auth.uid() AND unlocker_id = user_id)
  )
);