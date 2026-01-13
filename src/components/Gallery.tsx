import * as React from "react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { X } from "lucide-react";
import { Badge } from "./ui/badge";

const galleryImages = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1640163561346-7778a2edf353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjBzdHVkZW50c3xlbnwxfHx8fDE3NjIzMDIyMjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Hackathon 2023",
    category: "Events"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjB0ZWFtfGVufDF8fHx8MTc2MjM1MDEwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Team Collaboration",
    category: "Community"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1700936655767-7049129f1995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwZXZlbnQlMjBjb25mZXJlbmNlfGVufDF8fHx8MTc2MjMzMzA3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Tech Conference",
    category: "Events"
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1565229284535-2cbbe3049123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBwcm9ncmFtbWluZ3xlbnwxfHx8fDE3NjIyMzQ3MTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Workshop Session",
    category: "Workshops"
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1623715537851-8bc15aa8c145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwd29ya3NwYWNlfGVufDF8fHx8MTc2MjMxNTk5Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Study Sessions",
    category: "Community"
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1673885831398-9581891a3155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wdXRlciUyMHNjaWVuY2UlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2MjI2NTgyM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "AI Workshop",
    category: "Workshops"
  },
  {
    id: 7,
    url: "https://images.unsplash.com/photo-1640163561346-7778a2edf353?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWNrYXRob24lMjBzdHVkZW50c3xlbnwxfHx8fDE3NjIzMDIyMjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Code Review",
    category: "Community"
  },
  {
    id: 8,
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjB0ZWFtfGVufDF8fHx8MTc2MjM1MDEwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Project Showcase",
    category: "Events"
  },
  {
    id: 9,
    url: "https://images.unsplash.com/photo-1700936655767-7049129f1995?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwZXZlbnQlMjBjb25mZXJlbmNlfGVufDF8fHx8MTc2MjMzMzA3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Guest Speaker",
    category: "Events"
  }
];

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<typeof galleryImages[0] | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const categories = ["all", "Events", "Workshops", "Community"];
  const filteredImages = filter === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === filter);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square bg-gray-900/50 border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
            >
              <ImageWithFallback
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white mb-2">{image.title}</h3>
                  <Badge className="bg-cyan-500/90 text-black border-0">
                    {image.category}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] object-contain"
              />
              <div className="text-center mt-4">
                <h3 className="text-white text-xl mb-2">{selectedImage.title}</h3>
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
