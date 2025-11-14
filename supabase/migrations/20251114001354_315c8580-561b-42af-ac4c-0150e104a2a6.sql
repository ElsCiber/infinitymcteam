-- Add registration_status column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS registration_status text DEFAULT 'open' CHECK (registration_status IN ('open', 'closed', 'paused'));