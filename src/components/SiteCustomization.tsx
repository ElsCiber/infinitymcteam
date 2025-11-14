import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
    } catch (error: any) {
      toast.error("Error al cargar la configuración");
      console.error(error);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("site_settings")
        .update({ setting_value: value })
        .eq("setting_key", key);

      if (error) throw error;

      setSettings({ ...settings, [key]: value });
      toast.success("Configuración actualizada");
      
      // Reload page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, { upsert: true });

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
            Personaliza los colores principales del sitio (formato HSL: "189 94% 43%")
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Color Primario</Label>
            <div className="flex gap-2">
              <Input
                id="primary_color"
                value={settings.primary_color || ""}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                placeholder="189 94% 43%"
              />
              <Button
                onClick={() => updateSetting("primary_color", settings.primary_color)}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
              </Button>
            </div>
            <div
              className="h-10 rounded-md border"
              style={{ backgroundColor: `hsl(${settings.primary_color})` }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_color">Color Secundario</Label>
            <div className="flex gap-2">
              <Input
                id="secondary_color"
                value={settings.secondary_color || ""}
                onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                placeholder="0 0% 15%"
              />
              <Button
                onClick={() => updateSetting("secondary_color", settings.secondary_color)}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
              </Button>
            </div>
            <div
              className="h-10 rounded-md border"
              style={{ backgroundColor: `hsl(${settings.secondary_color})` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video del Hero</CardTitle>
          <CardDescription>
            Sube un nuevo video para la sección principal (formatos: MP4, WebM)
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
