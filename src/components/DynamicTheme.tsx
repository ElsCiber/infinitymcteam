import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const DynamicTheme = () => {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    if (settings.primary_color) {
      root.style.setProperty('--primary', settings.primary_color);
      root.style.setProperty('--accent', settings.primary_color);
      root.style.setProperty('--ring', settings.primary_color);
    }

    if (settings.secondary_color) {
      root.style.setProperty('--secondary', settings.secondary_color);
    }
  }, [settings]);

  return null;
};

export default DynamicTheme;
