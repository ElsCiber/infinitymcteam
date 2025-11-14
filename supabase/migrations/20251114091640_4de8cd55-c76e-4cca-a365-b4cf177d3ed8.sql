-- Fix PUBLIC_DATA_EXPOSURE: Restrict event_registrations access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view event registrations" ON public.event_registrations;

-- Create a more restrictive policy that only allows users to view their own registrations
CREATE POLICY "Users can view own registrations"
ON public.event_registrations
FOR SELECT
USING (auth.uid() = user_id);

-- The existing "Admins can view all registrations" policy already provides admin access