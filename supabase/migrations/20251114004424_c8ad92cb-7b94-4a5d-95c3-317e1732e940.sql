-- Add attended column to event_registrations first
ALTER TABLE public.event_registrations
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT false;

-- Create event_reviews table for ratings and comments
CREATE TABLE IF NOT EXISTS public.event_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS for event_reviews
ALTER TABLE public.event_reviews ENABLE ROW LEVEL SECURITY;

-- Users can view all reviews
CREATE POLICY "Anyone can view reviews"
  ON public.event_reviews
  FOR SELECT
  USING (true);

-- Users can create reviews for events they attended
CREATE POLICY "Users can create reviews for attended events"
  ON public.event_reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.event_registrations
      WHERE event_registrations.event_id = event_reviews.event_id
      AND event_registrations.user_id = auth.uid()
      AND event_registrations.attended = true
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.event_reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON public.event_reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can create notifications
CREATE POLICY "Admins can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create trigger for updated_at on event_reviews
CREATE TRIGGER update_event_reviews_updated_at
  BEFORE UPDATE ON public.event_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_reviews_event_id ON public.event_reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reviews_user_id ON public.event_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);