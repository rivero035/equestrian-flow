
-- Enable unaccent extension for accent-insensitive search
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA public;

-- Create immutable wrapper for use in indexes
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE STRICT
AS $$ SELECT public.unaccent('public.unaccent', $1) $$;

-- Create index for faster center name search
CREATE INDEX IF NOT EXISTS idx_centers_name_unaccent ON public.centers (public.f_unaccent(lower(name)));
