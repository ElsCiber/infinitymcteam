-- Create audit_logs table for tracking role changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id uuid NOT NULL,
  action text NOT NULL,
  old_role app_role,
  new_role app_role,
  admin_email text,
  target_email text
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for event and team images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow everyone to view images
CREATE POLICY "Anyone can view images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

-- Allow authenticated users to update their own images
CREATE POLICY "Authenticated users can update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Update RLS policies for events table to allow admins to manage
CREATE POLICY "Admins can insert events"
ON public.events
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Update RLS policies for team_members table to allow admins to manage
CREATE POLICY "Admins can insert team members"
ON public.team_members
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team members"
ON public.team_members
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team members"
ON public.team_members
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));