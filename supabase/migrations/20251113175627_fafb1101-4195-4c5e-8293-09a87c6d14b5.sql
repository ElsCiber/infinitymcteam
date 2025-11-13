-- Tabla de eventos
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  detailed_description TEXT,
  players_count TEXT,
  event_date TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  organizer TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de miembros del equipo
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialty TEXT,
  avatar_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de registros de jugadores
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_email TEXT NOT NULL,
  minecraft_username TEXT NOT NULL,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de galería de eventos
CREATE TABLE public.event_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para events (lectura pública)
CREATE POLICY "Everyone can view events"
  ON public.events FOR SELECT
  USING (true);

-- Políticas RLS para team_members (lectura pública)
CREATE POLICY "Everyone can view team members"
  ON public.team_members FOR SELECT
  USING (true);

-- Políticas RLS para event_registrations (crear público, ver solo propios)
CREATE POLICY "Anyone can register for events"
  ON public.event_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own registrations"
  ON public.event_registrations FOR SELECT
  USING (true);

-- Políticas RLS para event_gallery (lectura pública)
CREATE POLICY "Everyone can view event gallery"
  ON public.event_gallery FOR SELECT
  USING (true);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insertar datos de ejemplo para eventos
INSERT INTO public.events (title, description, detailed_description, players_count, event_date, status, organizer, image_url, featured) VALUES
('Survival Games Championship', 'Competencia épica de supervivencia en Minecraft', 'Únete a la batalla definitiva donde 100 jugadores competirán por ser el último en pie. Mapas personalizados, kits únicos y premios increíbles esperan a los ganadores.', '100 jugadores', '2024-12-25T18:00:00Z', 'upcoming', 'Infinity Team', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80', true),
('Infinity Hardcore', 'Supervivencia hardcore extrema', 'Modo hardcore sin respawn. ¿Tienes lo necesario para sobrevivir? Un mundo personalizado con desafíos únicos y mobs mejorados. Solo los más valientes llegarán al final.', '50 jugadores', '2024-11-20T20:00:00Z', 'ongoing', 'Infinity Team', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80', false),
('Build Battle Tournament', 'Torneo de construcción creativa', 'Demuestra tu creatividad en este torneo de construcción. Temas sorpresa, tiempo limitado y votación de la comunidad. Los mejores builders se enfrentarán por el título de maestro constructor.', '64 jugadores', '2024-03-15T16:00:00Z', 'completed', 'Infinity Team', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80', false),
('Sky Wars League', 'Liga de combate en las nubes', 'Batalla en islas flotantes con recursos limitados. Sistema de ligas con promoción y descenso. Cada partida cuenta para tu ranking final.', '128 jugadores', '2024-02-10T19:00:00Z', 'completed', 'Infinity Team', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80', false);

-- Insertar datos de ejemplo para team members
INSERT INTO public.team_members (name, role, specialty, display_order) VALUES
('Steve', 'Fundador', 'Eventos & Administración', 1),
('Alex', 'Builder', 'Construcción & Mapas', 2),
('Herobrine', 'Developer', 'Plugins & Mods', 3),
('Enderman', 'Moderador', 'Comunidad', 4);

-- Insertar datos de ejemplo para galería
INSERT INTO public.event_gallery (event_id, image_url, caption, display_order)
SELECT 
  id,
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80',
  'Arena principal del evento',
  1
FROM public.events
WHERE title = 'Survival Games Championship'
LIMIT 1;

INSERT INTO public.event_gallery (event_id, image_url, caption, display_order)
SELECT 
  id,
  'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&q=80',
  'Construcciones de los participantes',
  2
FROM public.events
WHERE title = 'Survival Games Championship'
LIMIT 1;

INSERT INTO public.event_gallery (event_id, image_url, caption, display_order)
SELECT 
  id,
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80',
  'Batalla final',
  3
FROM public.events
WHERE title = 'Build Battle Tournament'
LIMIT 1;