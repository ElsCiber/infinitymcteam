-- Create site_settings table for customization
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL, -- 'color', 'image', 'video', 'text'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Admins can view settings
CREATE POLICY "Admins can view site settings"
ON public.site_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update settings
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert settings
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view public settings
CREATE POLICY "Everyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type) VALUES
('primary_color', '189 94% 43%', 'color'),
('secondary_color', '0 0% 15%', 'color'),
('hero_video', '/hero-video.mp4', 'video'),
('logo_url', '/src/assets/infinity-logo-transparent.png', 'image')
ON CONFLICT (setting_key) DO NOTHING;