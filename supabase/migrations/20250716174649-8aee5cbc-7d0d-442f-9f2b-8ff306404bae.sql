-- Create storage bucket for field rep credentials
INSERT INTO storage.buckets (id, name, public)
VALUES ('field-rep-credentials', 'field-rep-credentials', true);

-- Create policies for field rep credential uploads
CREATE POLICY "Field reps can upload their own credentials" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'field-rep-credentials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Field reps can view their own credentials" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'field-rep-credentials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Field reps can update their own credentials" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'field-rep-credentials' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Field reps can delete their own credentials" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'field-rep-credentials' AND auth.uid()::text = (storage.foldername(name))[1]);