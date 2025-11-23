import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  primary_color?: string;
  secondary_color?: string;
  hero_video?: string;
  logo_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();

    // Subscribe to changes
    const channel = supabase
      .channel('site-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings'
        },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) throw error;

      const settingsMap: SiteSettings = {};
      data?.forEach((setting: any) => {
        settingsMap[setting.setting_key as keyof SiteSettings] = setting.setting_value;
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error("Error loading site settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
};
