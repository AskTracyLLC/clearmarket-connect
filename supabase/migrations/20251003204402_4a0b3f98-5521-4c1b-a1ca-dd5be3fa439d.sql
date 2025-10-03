-- Remove existing beta tester NDA documents
DELETE FROM public.user_documents 
WHERE document_type = 'nda';