import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Search, BookOpen, Calendar, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface SearchDialogProps {
  onNavigate: (section: string) => void;
}

interface SearchResult {
  id: string;
  type: "blog" | "event" | "gallery";
  title: string;
  description?: string;
  subtitle?: string;
  icon: React.ElementType;
}

export function SearchDialog({ onNavigate }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch all data when dialog opens
  useEffect(() => {
    if (open && !dataLoaded) {
      fetchAllData();
    }
  }, [open, dataLoaded]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch blogs
      const blogsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/blogs`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const blogsData = await blogsResponse.json();
      if (blogsData.success) {
        setBlogs(blogsData.blogs);
      }

      // Fetch events
      const eventsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/events`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const eventsData = await eventsResponse.json();
      if (eventsData.success) {
        setEvents(eventsData.events);
      }

      // Fetch gallery
      const galleryResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/gallery`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const galleryData = await galleryResponse.json();
      if (galleryData.success) {
        setPhotos(galleryData.photos);
      }

      setDataLoaded(true);
    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when dialog opens (to get latest content)
  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      // Refresh data to ensure we have the latest content
      fetchAllData();
    } else {
      setSearchQuery("");
    }
  }, []);

  // Search function
  const searchItems = useCallback((query: string): SearchResult[] => {
    if (!query.trim()) return [];

    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search blogs
    blogs.forEach((blog) => {
      const matchesTitle = blog.title?.toLowerCase().includes(queryLower);
      const matchesExcerpt = blog.excerpt?.toLowerCase().includes(queryLower);
      const matchesTags = blog.tags?.some((tag: string) =>
        tag.toLowerCase().includes(queryLower)
      );
      const matchesAuthor = blog.author?.toLowerCase().includes(queryLower);

      if (matchesTitle || matchesExcerpt || matchesTags || matchesAuthor) {
        results.push({
          id: blog.id,
          type: "blog",
          title: blog.title,
          description: blog.excerpt,
          subtitle: `By ${blog.author}`,
          icon: BookOpen,
        });
      }
    });

    // Search events
    events.forEach((event) => {
      const matchesTitle = event.title?.toLowerCase().includes(queryLower);
      const matchesDescription = event.description?.toLowerCase().includes(queryLower);
      const matchesLocation = event.location?.toLowerCase().includes(queryLower);

      if (matchesTitle || matchesDescription || matchesLocation) {
        const eventDate = event.date
          ? new Date(event.date).toLocaleDateString()
          : "";
        results.push({
          id: event.id,
          type: "event",
          title: event.title,
          description: event.description,
          subtitle: `${eventDate} • ${event.location}`,
          icon: Calendar,
        });
      }
    });

    // Search gallery
    photos.forEach((photo) => {
      const matchesCaption = photo.caption?.toLowerCase().includes(queryLower);
      const matchesCategory = photo.category?.toLowerCase().includes(queryLower);

      if (matchesCaption || matchesCategory) {
        results.push({
          id: photo.id,
          type: "gallery",
          title: photo.caption || "Untitled Photo",
          description: photo.category,
          subtitle: photo.category,
          icon: ImageIcon,
        });
      }
    });

    return results;
  }, [blogs, events, photos]);

  const filteredResults = searchItems(searchQuery);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setSearchQuery("");
    
    // Navigate to the appropriate section
    if (result.type === "blog") {
      onNavigate("blog");
      // You could also scroll to the specific blog if needed
    } else if (result.type === "event") {
      onNavigate("events");
    } else if (result.type === "gallery") {
      onNavigate("gallery");
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Group results by type
  const blogResults = filteredResults.filter((r) => r.type === "blog");
  const eventResults = filteredResults.filter((r) => r.type === "event");
  const galleryResults = filteredResults.filter((r) => r.type === "gallery");

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="ghost"
        size="sm"
        className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search"
        description="Search blogs, events, and gallery"
      >
        <CommandInput
          placeholder="Search blogs, events, gallery..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList className="max-h-[400px]">
          {loading && !dataLoaded ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              <span className="ml-2 text-gray-400">Loading...</span>
            </div>
          ) : filteredResults.length === 0 && searchQuery.trim() ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : searchQuery.trim() === "" ? (
            <div className="py-6 text-center text-sm text-gray-400">
              Start typing to search...
            </div>
          ) : (
            <>
              {blogResults.length > 0 && (
                <CommandGroup heading="Blog Posts">
                  {blogResults.map((result) => {
                    const Icon = result.icon;
                    return (
                      <CommandItem
                        key={`blog-${result.id}`}
                        value={`blog-${result.id}`}
                        onSelect={() => handleSelect(result)}
                        className="cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-white truncate">{result.title}</span>
                          {result.subtitle && (
                            <span className="text-xs text-gray-400 truncate">
                              {result.subtitle}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {eventResults.length > 0 && (
                <CommandGroup heading="Events">
                  {eventResults.map((result) => {
                    const Icon = result.icon;
                    return (
                      <CommandItem
                        key={`event-${result.id}`}
                        value={`event-${result.id}`}
                        onSelect={() => handleSelect(result)}
                        className="cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-purple-400" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-white truncate">{result.title}</span>
                          {result.subtitle && (
                            <span className="text-xs text-gray-400 truncate">
                              {result.subtitle}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {galleryResults.length > 0 && (
                <CommandGroup heading="Gallery">
                  {galleryResults.map((result) => {
                    const Icon = result.icon;
                    return (
                      <CommandItem
                        key={`gallery-${result.id}`}
                        value={`gallery-${result.id}`}
                        onSelect={() => handleSelect(result)}
                        className="cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-green-400" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-white truncate">{result.title}</span>
                          {result.subtitle && (
                            <span className="text-xs text-gray-400 truncate">
                              {result.subtitle}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
