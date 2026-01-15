import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, User, ArrowRight, Clock, Loader2, X } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  image: string;
  createdAt: string;
  readTime?: string;
}

export function Blog() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/blogs`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        // Calculate read time for each blog if not provided
        const blogsWithReadTime = data.blogs.map((blog: Blog) => ({
          ...blog,
          readTime: blog.readTime || calculateReadTime(blog.content),
        }));
        setBlogs(blogsWithReadTime);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate read time based on content (average reading speed: 200 words per minute)
  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleReadMore = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="mb-4 flex items-center justify-center gap-2 text-cyan-400 text-sm">
            <span className="opacity-50">{'<'}</span>
            <span className="font-mono">TECH_INSIGHTS</span>
            <span className="opacity-50">{'/>'}</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-4">Latest Articles</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore tutorials, insights, and knowledge shared by our community members
          </p>
        </div>

        {blogs.length === 0 ? (
          <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">No articles published yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((post) => (
              <Card
                key={post.id}
                className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-500/50 transition-all group overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  {post.image ? (
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <span className="text-4xl text-cyan-400/50">📝</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    {post.tags && post.tags.length > 0 && (
                      <Badge className="bg-cyan-500/90 text-black border-0">
                        {post.tags[0]}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-white group-hover:text-cyan-400 transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                      onClick={() => handleReadMore(post)}
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Blog Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 border-cyan-500/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedBlog && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl md:text-3xl text-white pr-8">
                  {selectedBlog.title}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {selectedBlog.excerpt}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Blog Image */}
                {selectedBlog.image ? (
                  <div className="relative h-64 md:h-96 overflow-hidden rounded-lg">
                    <ImageWithFallback
                      src={selectedBlog.image}
                      alt={selectedBlog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-64 md:h-96 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center rounded-lg">
                    <span className="text-6xl text-cyan-400/50">📝</span>
                  </div>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{selectedBlog.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedBlog.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{selectedBlog.readTime}</span>
                  </div>
                </div>

                {/* Tags */}
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedBlog.tags.map((tag, index) => (
                      <Badge key={index} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Blog Content */}
                <div className="prose prose-invert max-w-none">
                  <div 
                    className="text-gray-300 leading-relaxed whitespace-pre-wrap"
                    style={{ 
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  >
                    {selectedBlog.content}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}