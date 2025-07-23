-- Remove duplicate field-rep-signup-beta template (keeping the newer one)
DELETE FROM email_templates 
WHERE name = 'field-rep-signup-beta' 
AND created_at = '2025-07-18 23:42:40.373115+00';