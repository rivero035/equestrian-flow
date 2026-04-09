
-- 1. Create centers table
CREATE TABLE public.centers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mi Centro Ecuestre',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_id)
);

ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own center"
  ON public.centers FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can update their own center"
  ON public.centers FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own center"
  ON public.centers FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- 2. Helper function to get current user's center_id
CREATE OR REPLACE FUNCTION public.get_my_center_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.centers WHERE owner_id = auth.uid() LIMIT 1;
$$;

-- 3. Auto-create center on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.centers (owner_id, name)
  VALUES (NEW.id, 'Mi Centro Ecuestre');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Add center_id to horses
ALTER TABLE public.horses ADD COLUMN center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE;

-- 5. Add center_id to students
ALTER TABLE public.students ADD COLUMN center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE;

-- 6. Add center_id to bookings
ALTER TABLE public.bookings ADD COLUMN center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE;

-- 7. Add center_id to waitlist
ALTER TABLE public.waitlist ADD COLUMN center_id UUID REFERENCES public.centers(id) ON DELETE CASCADE;

-- 8. Drop old permissive policies
DROP POLICY IF EXISTS "Allow all access to horses" ON public.horses;
DROP POLICY IF EXISTS "Allow all access to students" ON public.students;
DROP POLICY IF EXISTS "Allow all access to bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow all access to waitlist" ON public.waitlist;

-- 9. New RLS policies for horses
CREATE POLICY "Users manage own horses"
  ON public.horses FOR ALL
  TO authenticated
  USING (center_id = public.get_my_center_id())
  WITH CHECK (center_id = public.get_my_center_id());

-- 10. New RLS policies for students
CREATE POLICY "Users manage own students"
  ON public.students FOR ALL
  TO authenticated
  USING (center_id = public.get_my_center_id())
  WITH CHECK (center_id = public.get_my_center_id());

-- 11. New RLS policies for bookings
CREATE POLICY "Users manage own bookings"
  ON public.bookings FOR ALL
  TO authenticated
  USING (center_id = public.get_my_center_id())
  WITH CHECK (center_id = public.get_my_center_id());

-- 12. New RLS policies for waitlist
CREATE POLICY "Users manage own waitlist"
  ON public.waitlist FOR ALL
  TO authenticated
  USING (center_id = public.get_my_center_id())
  WITH CHECK (center_id = public.get_my_center_id());
