-- Add embed customization settings to site_settings table
INSERT INTO public.site_settings (setting_key, setting_value, setting_type)
VALUES 
  ('og_title', 'Infinity Team', 'text'),
  ('og_description', 'Infinity Team organiza eventos épicos de Minecraft. Survival Games, eventos personalizados y experiencias únicas para la comunidad.', 'text'),
  ('og_image', 'https://storage.googleapis.com/gpt-engineer-file-uploads/iV48OAp7K1XXXFmI95rrhCiBxlJ3/social-images/social-1763905044505-IMG_0962.jpeg', 'url')
ON CONFLICT (setting_key) DO NOTHING;