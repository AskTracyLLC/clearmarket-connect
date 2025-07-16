-- Create saved_local_news_searches table for field reps to save their local news search preferences
CREATE TABLE IF NOT EXISTS public.saved_local_news_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('county', 'city', 'zipcode')),
  location_value TEXT NOT NULL,
  location_display TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_local_news_searches ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own saved searches
CREATE POLICY "Users can create their own saved local news searches" 
ON public.saved_local_news_searches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own saved local news searches" 
ON public.saved_local_news_searches 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved local news searches" 
ON public.saved_local_news_searches 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved local news searches" 
ON public.saved_local_news_searches 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_saved_local_news_searches_updated_at
BEFORE UPDATE ON public.saved_local_news_searches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();