import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  image_url: string;
  caption?: string;
  display_order: number;
}

interface GalleryManagerProps {
  eventId: string;
}

const GalleryManager = ({ eventId }: GalleryManagerProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadImages();
  }, [eventId]);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from("event_gallery")
        .select("*")
        .eq("event_id", eventId)
        .order("display_order");

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `gallery/${eventId}/${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleAddImage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const formData = new FormData(e.currentTarget);
    const imageFile = formData.get("image") as File;
    const caption = formData.get("caption") as string;
    const displayOrder = parseInt(formData.get("display_order") as string);

    try {
      if (!imageFile || imageFile.size === 0) {
        toast.error("Por favor selecciona una imagen");
        return;
      }

      toast.loading("Subiendo imagen...");

      const imageUrl = await uploadImage(imageFile);

      const { error } = await supabase.from("event_gallery").insert({
        event_id: eventId,
        image_url: imageUrl,
        caption: caption || null,
        display_order: displayOrder,
      });

      if (error) throw error;

      toast.dismiss();
      toast.success("Imagen agregada a la galería");
      await loadImages();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.dismiss();
      console.error("Error details:", error);
      toast.error("Error al agregar imagen: " + error.message);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm("¿Eliminar esta imagen de la galería?")) return;

    try {
      const { error } = await supabase
        .from("event_gallery")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Imagen eliminada");
      loadImages();
    } catch (error: any) {
      toast.error("Error al eliminar imagen");
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Cargando galería...</div>;
  }

  return (
    <div 
      className="space-y-6" 
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <form 
        onSubmit={handleAddImage} 
        className="space-y-4 p-4 border rounded-lg" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold">Agregar Imagen a la Galería</h3>
        <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <Label htmlFor={`image-${eventId}`}>Imagen</Label>
          <Input 
            id={`image-${eventId}`} 
            name="image" 
            type="file" 
            accept="image/*" 
            required 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
        <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <Label htmlFor={`caption-${eventId}`}>Descripción (opcional)</Label>
          <Textarea 
            id={`caption-${eventId}`} 
            name="caption"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
        <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <Label htmlFor={`display_order-${eventId}`}>Orden</Label>
          <Input 
            id={`display_order-${eventId}`} 
            name="display_order" 
            type="number" 
            defaultValue={images.length} 
            required
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Imagen
        </Button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div 
            key={image.id} 
            className="relative group border rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <img 
              src={image.image_url} 
              alt={image.caption || ""} 
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteImage(image.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {image.caption && (
              <div className="p-2 bg-card text-xs truncate">
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No hay imágenes en la galería
        </p>
      )}
    </div>
  );
};

export default GalleryManager;
