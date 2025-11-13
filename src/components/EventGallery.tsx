import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GalleryImage {
  id: string;
  image_url: string;
  caption?: string;
}

interface EventGalleryProps {
  images: GalleryImage[];
}

const EventGallery = ({ images }: EventGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedImage(null), 300);
  };

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all duration-300 cursor-pointer"
            onClick={() => openLightbox(image)}
          >
            <img
              src={image.image_url}
              alt={image.caption || "Event image"}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
              <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center p-4">
                <p className="text-sm font-semibold">Ver imagen</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 bg-black/95 border-primary/30">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {selectedImage && (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.caption || "Event image"}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg"
                />
                {selectedImage.caption && (
                  <p className="mt-4 text-lg text-white text-center max-w-2xl">
                    {selectedImage.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventGallery;
