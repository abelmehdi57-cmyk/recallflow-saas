-- RecallFlow Phase 2 — run in Supabase SQL Editor
-- Business settings, appointment status, revenue tracking

-- Appointment status enum
DO $$ BEGIN
  CREATE TYPE public.appointment_status AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'no-show'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Business preferences
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS business_type text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS default_appointment_value numeric(10, 2) NOT NULL DEFAULT 75.00;

-- Appointment status + revenue
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS status public.appointment_status,
  ADD COLUMN IF NOT EXISTS amount numeric(10, 2);

-- Backfill status from legacy boolean columns
UPDATE public.appointments
SET status = CASE
  WHEN showed_up = true THEN 'completed'::public.appointment_status
  WHEN confirmed = true AND showed_up = false AND date < now() THEN 'no-show'::public.appointment_status
  WHEN confirmed = true THEN 'confirmed'::public.appointment_status
  ELSE 'pending'::public.appointment_status
END
WHERE status IS NULL;

UPDATE public.appointments SET status = 'pending'::public.appointment_status WHERE status IS NULL;

ALTER TABLE public.appointments
  ALTER COLUMN status SET DEFAULT 'pending'::public.appointment_status;

ALTER TABLE public.appointments
  ALTER COLUMN status SET NOT NULL;

-- Backfill amount for completed appointments
UPDATE public.appointments a
SET amount = b.default_appointment_value
FROM public.businesses b
WHERE a.business_id = b.id
  AND a.amount IS NULL
  AND a.status = 'completed'::public.appointment_status;

CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);
CREATE INDEX IF NOT EXISTS idx_appointments_business_status ON public.appointments (business_id, status);
