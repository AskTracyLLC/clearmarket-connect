-- Fix the search_type constraint to allow 'search' as a valid type
ALTER TABLE public.saved_local_news_searches 
DROP CONSTRAINT saved_local_news_searches_search_type_check;

ALTER TABLE public.saved_local_news_searches 
ADD CONSTRAINT saved_local_news_searches_search_type_check 
CHECK (search_type IN ('county', 'city', 'zipcode', 'search'));