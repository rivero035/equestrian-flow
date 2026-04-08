
-- Create level enum
CREATE TYPE public.horse_level AS ENUM ('principiante', 'intermedio', 'avanzado');

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('confirmada', 'pendiente', 'cancelada');

-- Horses table
CREATE TABLE public.horses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  level horse_level NOT NULL DEFAULT 'principiante',
  available BOOLEAN NOT NULL DEFAULT true,
  image TEXT NOT NULL DEFAULT '🐴',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  horse_id UUID NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  status booking_status NOT NULL DEFAULT 'confirmada',
  paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(horse_id, date, time)
);

-- Waitlist table
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (permissive for now - no auth)
ALTER TABLE public.horses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (no auth implemented yet)
CREATE POLICY "Allow all access to horses" ON public.horses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to waitlist" ON public.waitlist FOR ALL USING (true) WITH CHECK (true);
