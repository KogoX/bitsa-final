import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { X, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  category: string;
  createdAt: string;
}

export function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/gallery`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setGalleryImages(data.photos);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from photos
  const getCategories = () => {
    const uniqueCategories = Array.from(
      new Set(galleryImages.map((img) => img.category).filter(Boolean))
    );
    return ["all", ...uniqueCategories];
  };

  const categories = getCategories();
  const filteredImages =
    filter === "all"
      ? galleryImages
      : galleryImages.filter((img) => img.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="mb-4 flex items-center justify-center gap-2 text-cyan-400 text-sm">
            <span className="opacity-50">{'<'}</span>
            <span className="font-mono">PHOTO_GALLERY</span>
            <span className="opacity-50">{'/>'}</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-4">Gallery</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Moments captured from our events, workshops, and community gatherings
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-md text-sm transition-all ${
                  filter === category
                    ? "bg-cyan-500 text-black"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-cyan-500/20"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {galleryImages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No photos in the gallery yet. Check back soon!
            </p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              No photos found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className="relative group cursor-zoom-in overflow-hidden rounded-lg aspect-square bg-gray-900/50 border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
              >
                <ImageWithFallback
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white mb-2">{image.caption}</h3>
                    <Badge className="bg-cyan-500/90 text-black border-0">
                      {image.category}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-cyan-400 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="max-w-5xl max-h-[90vh] relative">
              <ImageWithFallback
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="max-w-full max-h-[80vh] object-contain cursor-zoom-out"
              />
              <div className="text-center mt-4">
                <h3 className="text-white text-xl mb-2">{selectedImage.caption}</h3>
                <Badge className="bg-cyan-500 text-black border-0">
                  {selectedImage.category}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
