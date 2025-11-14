import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { HslColorPicker } from "react-colorful";

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
}

const SiteCustomization = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewColors, setPreviewColors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((setting: SiteSetting) => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });
      setSettings(settingsMap);
      setPreviewColors(settingsMap);
    } catch (error: any) {
      toast.error("Error al cargar la configuración");
      console.error(error);
    }
  };

  const hslToColor = (hsl: string) => {
    if (!hsl) return { h: 0, s: 0, l: 0 };
    const parts = hsl.split(' ');
    return {
      h: parseInt(parts[0]) || 0,
      s: parseInt(parts[1]) || 0,
      l: parseInt(parts[2]?.replace('%', '')) || 0
    };
  };

  const colorToHsl = (color: { h: number; s: number; l: number }) => {
    return `${Math.round(color.h)} ${Math.round(color.s)}% ${Math.round(color.l)}%`;
  };

  useEffect(() => {
    if (previewColors.primary_color || previewColors.secondary_color) {
      const root = document.documentElement;
      if (previewColors.primary_color) {
        root.style.setProperty('--primary', previewColors.primary_color);
        root.style.setProperty('--accent', previewColors.primary_color);
        root.style.setProperty('--ring', previewColors.primary_color);
      }
      if (previewColors.secondary_color) {
        root.style.setProperty('--secondary', previewColors.secondary_color);
      }
    }
  }, [previewColors]);

  const updateSetting = async (key: string, value: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("site_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);

      if (error) throw error;

      setSettings({ ...settings, [key]: value });
      setPreviewColors({ ...previewColors, [key]: value });
      toast.success("Configuración actualizada");
    } catch (error: any) {
      toast.error("Error al actualizar la configuración");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, settingKey: string) => {
    try {
      setUploading(settingKey);

      const fileExt = file.name.split(".").pop();
      const fileName = `${settingKey}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const uploadOptions: any = { upsert: true };
      
      // Set file size limit to 100MB for videos
      if (file.type.startsWith('video/')) {
        uploadOptions.contentType = file.type;
      }

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, uploadOptions);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      await updateSetting(settingKey, publicUrl);
    } catch (error: any) {
      toast.error("Error al subir el archivo");
      console.error(error);
    } finally {
      setUploading(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, settingKey: string) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file, settingKey);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Colores del Sitio</CardTitle>
          <CardDescription>
            Selecciona los colores principales del sitio con el selector visual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Color Primario</Label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <HslColorPicker
                  color={hslToColor(previewColors.primary_color || settings.primary_color || "189 94% 43%")}
                  onChange={(color) => {
                    const hslValue = colorToHsl(color);
                    setPreviewColors({ ...previewColors, primary_color: hslValue });
                  }}
                />
                <div className="mt-2 text-sm text-muted-foreground">
                  HSL: {previewColors.primary_color || settings.primary_color || "189 94% 43%"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div
                  className="w-32 h-32 rounded-md border"
                  style={{ backgroundColor: `hsl(${previewColors.primary_color || settings.primary_color})` }}
                />
                <Button
                  onClick={() => updateSetting("primary_color", previewColors.primary_color || settings.primary_color)}
                  disabled={loading}
                  className="w-32"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Color Secundario</Label>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <HslColorPicker
                  color={hslToColor(previewColors.secondary_color || settings.secondary_color || "0 0% 15%")}
                  onChange={(color) => {
                    const hslValue = colorToHsl(color);
                    setPreviewColors({ ...previewColors, secondary_color: hslValue });
                  }}
                />
                <div className="mt-2 text-sm text-muted-foreground">
                  HSL: {previewColors.secondary_color || settings.secondary_color || "0 0% 15%"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div
                  className="w-32 h-32 rounded-md border"
                  style={{ backgroundColor: `hsl(${previewColors.secondary_color || settings.secondary_color})` }}
                />
                <Button
                  onClick={() => updateSetting("secondary_color", previewColors.secondary_color || settings.secondary_color)}
                  disabled={loading}
                  className="w-32"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video del Hero</CardTitle>
          <CardDescription>
            Sube un nuevo video para la sección principal (formatos: MP4, WebM, hasta 100MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero_video">Video Actual</Label>
            {settings.hero_video && (
              <video
                src={settings.hero_video}
                className="w-full max-w-md rounded-md"
                controls
                muted
              />
            )}
            <Input
              id="hero_video"
              type="file"
              accept="video/mp4,video/webm"
              onChange={(e) => handleFileChange(e, "hero_video")}
              disabled={uploading === "hero_video"}
            />
            {uploading === "hero_video" && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo video...
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo del Sitio</CardTitle>
          <CardDescription>
            Sube un nuevo logo (formatos: PNG, JPG, SVG)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo Actual</Label>
            {settings.logo_url && (
              <img
                src={settings.logo_url}
                alt="Logo"
                className="w-32 h-32 object-contain rounded-md bg-muted"
              />
            )}
            <Input
              id="logo_url"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={(e) => handleFileChange(e, "logo_url")}
              disabled={uploading === "logo_url"}
            />
            {uploading === "logo_url" && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo logo...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteCustomization;
