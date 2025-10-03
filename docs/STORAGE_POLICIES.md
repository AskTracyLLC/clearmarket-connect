# Storage Policies for user-documents Bucket

Run these SQL commands in the Supabase SQL Editor to configure read-only NDA storage:

```sql
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all documents" ON storage.objects;

-- Allow authenticated users to upload documents to their own folder
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own documents (READ ONLY)
CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents' AND
  public.has_role(auth.uid(), 'admin')
);

-- NOTE: No DELETE policy - NDAs are permanent and cannot be deleted by users
```

## Key Changes:
- ✅ Users can **upload** documents to their folder
- ✅ Users can **view** their own documents
- ❌ Users **cannot delete** documents (no DELETE policy)
- ✅ Admins can view all documents
