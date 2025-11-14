-- Add attendance count to profiles for badges
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS events_attended INTEGER DEFAULT 0;

-- Create function to update attendance count
CREATE OR REPLACE FUNCTION update_user_attendance_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the events_attended count for the user
  UPDATE public.profiles
  SET events_attended = (
    SELECT COUNT(*)
    FROM public.event_registrations
    WHERE user_id = NEW.user_id
    AND attended = true
  )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update attendance count
DROP TRIGGER IF EXISTS update_attendance_count_trigger ON public.event_registrations;
CREATE TRIGGER update_attendance_count_trigger
AFTER UPDATE OF attended ON public.event_registrations
FOR EACH ROW
WHEN (OLD.attended IS DISTINCT FROM NEW.attended)
EXECUTE FUNCTION update_user_attendance_count();

-- Allow users to delete their own registrations
CREATE POLICY "Users can delete own registrations"
ON public.event_registrations
FOR DELETE
USING (auth.uid() = user_id);

-- Allow admins to update registration attendance
CREATE POLICY "Admins can update registrations"
ON public.event_registrations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));