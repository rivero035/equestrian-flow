
-- 1. User roles
CREATE TYPE public.app_role AS ENUM ('manager', 'student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Users can read their own roles
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own role (during onboarding)
CREATE POLICY "Users can insert own role"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 2. Centers: add logo_url
ALTER TABLE public.centers ADD COLUMN logo_url text;

-- 3. Horses: new status enum replacing boolean
CREATE TYPE public.horse_status AS ENUM ('available', 'resting', 'injured');

ALTER TABLE public.horses ADD COLUMN status public.horse_status NOT NULL DEFAULT 'available';
ALTER TABLE public.horses ADD COLUMN max_daily_hours integer NOT NULL DEFAULT 4;

-- Migrate existing data: available=true → 'available', available=false → 'resting'
UPDATE public.horses SET status = CASE WHEN available THEN 'available'::horse_status ELSE 'resting'::horse_status END;

-- Drop old column
ALTER TABLE public.horses DROP COLUMN available;

-- 4. Students: link to auth user + approval status
CREATE TYPE public.student_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.students ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.students ADD COLUMN status public.student_status NOT NULL DEFAULT 'approved';

-- Index for fast lookup
CREATE INDEX idx_students_user_id ON public.students(user_id);

-- 5. Storage bucket for center logos
INSERT INTO storage.buckets (id, name, public) VALUES ('center-logos', 'center-logos', true);

CREATE POLICY "Anyone can view center logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'center-logos');

CREATE POLICY "Center owners can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'center-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Center owners can update logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'center-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Center owners can delete logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'center-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Update RLS for students: allow student users to read their center's data

-- Students can view horses in their center
CREATE POLICY "Students can view center horses"
  ON public.horses FOR SELECT
  TO authenticated
  USING (
    center_id IN (
      SELECT s.center_id FROM public.students s
      WHERE s.user_id = auth.uid() AND s.status = 'approved'
    )
  );

-- Students can view bookings in their center (only their own)
CREATE POLICY "Students can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM public.students s
      WHERE s.user_id = auth.uid() AND s.status = 'approved'
    )
  );

-- Students can create bookings (pending approval)
CREATE POLICY "Students can create bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT s.id FROM public.students s
      WHERE s.user_id = auth.uid() AND s.status = 'approved'
    )
  );

-- Students can cancel their own bookings
CREATE POLICY "Students can cancel own bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM public.students s
      WHERE s.user_id = auth.uid() AND s.status = 'approved'
    )
  );

-- Students can view their own student record
CREATE POLICY "Students can view own record"
  ON public.students FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow students to view center info (for search + display)
CREATE POLICY "Anyone authenticated can search centers"
  ON public.centers FOR SELECT
  TO authenticated
  USING (true);

-- Update handle_new_user to assign manager role by default (can be changed during onboarding)
-- We'll handle role assignment in app code instead
