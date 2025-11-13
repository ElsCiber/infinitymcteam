-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update event_registrations to link to authenticated users
ALTER TABLE public.event_registrations
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policy for event_registrations to require authentication
DROP POLICY IF EXISTS "Anyone can register for events" ON public.event_registrations;

CREATE POLICY "Authenticated users can register for events"
ON public.event_registrations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view event registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (true);

-- Enable realtime for event_registrations
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_registrations;

-- Add role_color to team_members
ALTER TABLE public.team_members
ADD COLUMN role_color text DEFAULT '#ffffff';

-- Update event_gallery RLS policies for admin management
CREATE POLICY "Admins can insert gallery images"
ON public.event_gallery
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update gallery images"
ON public.event_gallery
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gallery images"
ON public.event_gallery
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));