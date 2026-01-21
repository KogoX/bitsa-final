import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Shield, BookOpen, Calendar, Image as ImageIcon, Trash2, Edit, Plus, Loader2, Save, X, CheckCircle, XCircle, Users, Clock, MapPin, Bell } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AdminDashboardProps {
  accessToken: string;
}

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorEmail?: string;
  tags: string[];
  image: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

interface Photo {
  id: string;
  url: string;
  caption: string;
  category: string;
  createdAt: string;
}

interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  studentId: string;
  registeredAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  readBy?: string[];
}

export function AdminDashboard({ accessToken }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Blog form state
  const [blogForm, setBlogForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    tags: "",
    image: ""
  });
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    image: "",
    category: "event"
  });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  // Photo form state
  const [photoForm, setPhotoForm] = useState({
    url: "",
    caption: "",
    category: ""
  });
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "info"
  });
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [accessToken]);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/check`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.isAdmin) {
        setIsAdmin(true);
        await Promise.all([fetchBlogs(), fetchEvents(), fetchPhotos(), fetchNotifications()]);
      } else {
        setIsAdmin(false);
        toast.error("Access Denied: Admin privileges required");
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/all-blogs`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setBlogs(data.blogs);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/events`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchPhotos = async () => {
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
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/events/${eventId}/registrations`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.registrations);
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/notifications`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleCreateNotification = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(notificationForm),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Notification sent successfully!");
        setNotificationDialogOpen(false);
        setNotificationForm({ title: "", message: "", type: "info" });
        fetchNotifications();
      } else {
        toast.error(data.error || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Failed to send notification");
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Notification deleted successfully!");
        fetchNotifications();
      } else {
        toast.error(data.error || "Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  // Blog CRUD operations
  const handleCreateBlog = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/blogs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...blogForm,
            tags: blogForm.tags.split(",").map(t => t.trim()).filter(t => t)
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Blog created successfully!");
        setBlogDialogOpen(false);
        resetBlogForm();
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to create blog");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Failed to create blog");
    }
  };

  const handleUpdateBlog = async () => {
    if (!editingBlog) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/blogs/${editingBlog.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...blogForm,
            tags: blogForm.tags.split(",").map(t => t.trim()).filter(t => t)
          }),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Blog updated successfully!");
        setBlogDialogOpen(false);
        setEditingBlog(null);
        resetBlogForm();
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to update blog");
      }
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("Failed to update blog");
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/blogs/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Blog deleted successfully!");
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  const handleApproveBlog = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/blogs/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Article approved successfully!");
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to approve article");
      }
    } catch (error) {
      console.error("Error approving article:", error);
      toast.error("Failed to approve article");
    }
  };

  const handleRejectBlog = async (id: string) => {
    if (!confirm("Are you sure you want to reject this article?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/blogs/${id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Article rejected");
        fetchBlogs();
      } else {
        toast.error(data.error || "Failed to reject article");
      }
    } catch (error) {
      console.error("Error rejecting article:", error);
      toast.error("Failed to reject article");
    }
  };

  // Event CRUD operations
  const handleCreateEvent = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(eventForm),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Event created successfully!");
        setEventDialogOpen(false);
        resetEventForm();
        fetchEvents();
      } else {
        toast.error(data.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };

  const handleUpdateEvent = async () => {
    if (!editingEvent) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/events/${editingEvent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(eventForm),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Event updated successfully!");
        setEventDialogOpen(false);
        setEditingEvent(null);
        resetEventForm();
        fetchEvents();
      } else {
        toast.error(data.error || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/events/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Event deleted successfully!");
        fetchEvents();
      } else {
        toast.error(data.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  // Gallery operations
  const handleAddPhoto = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/gallery`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(photoForm),
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Photo added successfully!");
        setPhotoDialogOpen(false);
        resetPhotoForm();
        fetchPhotos();
      } else {
        toast.error(data.error || "Failed to add photo");
      }
    } catch (error) {
      console.error("Error adding photo:", error);
      toast.error("Failed to add photo");
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/gallery/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        toast.success("Photo deleted successfully!");
        fetchPhotos();
      } else {
        toast.error(data.error || "Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Failed to delete photo");
    }
  };

  const resetBlogForm = () => {
    setBlogForm({
      title: "",
      excerpt: "",
      content: "",
      author: "",
      tags: "",
      image: ""
    });
    setEditingBlog(null);
  };

  const resetEventForm = () => {
    setEventForm({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      image: "",
      category: "event"
    });
    setEditingEvent(null);
  };

  const resetPhotoForm = () => {
    setPhotoForm({
      url: "",
      caption: "",
      category: ""
    });
    setSelectedPhotoFile(null);
  };

  const openEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      author: blog.author,
      tags: blog.tags.join(", "),
      image: blog.image
    });
    setBlogDialogOpen(true);
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      image: event.image,
      category: (event as any).category || "event"
    });
    setEventDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="bg-gray-900/50 backdrop-blur-sm border-red-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-400">
              You do not have admin privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-4 flex items-center justify-center gap-2 text-cyan-400 text-sm">
            <Shield className="w-5 h-5" />
            <span className="font-mono">ADMIN_DASHBOARD</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-4">Admin Control Panel</h2>
          <p className="text-gray-400">Manage all club content and activities</p>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="blogs" className="space-y-6">
          <TabsList className="flex flex-wrap w-full bg-gray-800/50 gap-1 p-1 h-auto">
            <TabsTrigger value="blogs" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 flex-1 min-w-[120px]">
              <BookOpen className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">Blogs</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 flex-1 min-w-[120px]">
              <Calendar className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">Events</span>
            </TabsTrigger>
            <TabsTrigger value="registrations" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 flex-1 min-w-[120px]">
              <Users className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">Registrations</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 flex-1 min-w-[120px]">
              <ImageIcon className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 flex-1 min-w-[120px]">
              <Bell className="w-4 h-4 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm">Alerts</span>
            </TabsTrigger>
          </TabsList>

          {/* Blogs Tab */}
          <TabsContent value="blogs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl text-white">Blog Management</h3>
              <Dialog open={blogDialogOpen} onOpenChange={(open) => {
                setBlogDialogOpen(open);
                if (!open) resetBlogForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    New Blog Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-cyan-500/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {editingBlog ? "Update the blog post details" : "Fill in the details to create a new blog post"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white"
                        placeholder="Blog post title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Author</Label>
                      <Input
                        value={blogForm.author}
                        onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white"
                        placeholder="Author name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Excerpt</Label>
                      <Textarea
                        value={blogForm.excerpt}
                        onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white resize-none"
                        placeholder="Short summary"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea
                        value={blogForm.content}
                        onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white resize-none"
                        placeholder="Full blog content"
                        rows={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tags (comma separated)</Label>
                      <Input
                        value={blogForm.tags}
                        onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white"
                        placeholder="e.g., AI, Machine Learning, Tutorial"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={blogForm.image}
                        onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={editingBlog ? handleUpdateBlog : handleCreateBlog}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingBlog ? "Update" : "Create"} Blog
                    </Button>
                    <Button
                      onClick={() => {
                        setBlogDialogOpen(false);
                        resetBlogForm();
                      }}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Pending Articles Section */}
            {blogs.filter(b => b.status === "pending").length > 0 && (
              <div className="space-y-3">
                <h4 className="text-lg text-yellow-400 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Approval ({blogs.filter(b => b.status === "pending").length})
                </h4>
                <div className="grid gap-4">
                  {blogs.filter(b => b.status === "pending").map((blog) => (
                    <Card key={blog.id} className="bg-yellow-500/10 backdrop-blur-sm border-yellow-500/30">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                Pending Review
                              </Badge>
                            </div>
                            <h4 className="text-xl text-white mb-2">{blog.title}</h4>
                            <p className="text-gray-400 text-sm mb-3">{blog.excerpt}</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {blog.tags.map((tag, i) => (
                                <Badge key={i} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">
                              By {blog.author} {blog.authorEmail && `(${blog.authorEmail})`} • {new Date(blog.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => handleApproveBlog(blog.id)}
                              size="sm"
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRejectBlog(blog.id)}
                              size="sm"
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Published/Approved Articles Section */}
            <div className="space-y-3">
              <h4 className="text-lg text-cyan-400">Published Articles ({blogs.filter(b => b.status === "approved").length})</h4>
              <div className="grid gap-4">
                {blogs.filter(b => b.status === "approved").length === 0 ? (
                  <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
                    <CardContent className="py-12 text-center">
                      <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No published articles yet. Create your first one!</p>
                    </CardContent>
                  </Card>
                ) : (
                  blogs.filter(b => b.status === "approved").map((blog) => (
                    <Card key={blog.id} className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="text-xl text-white mb-2">{blog.title}</h4>
                            <p className="text-gray-400 text-sm mb-3">{blog.excerpt}</p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {blog.tags.map((tag, i) => (
                                <Badge key={i} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openEditBlog(blog)}
                              size="sm"
                              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteBlog(blog.id)}
                              size="sm"
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Rejected Articles Section */}
            {blogs.filter(b => b.status === "rejected").length > 0 && (
              <div className="space-y-3">
                <h4 className="text-lg text-red-400">Rejected Articles ({blogs.filter(b => b.status === "rejected").length})</h4>
                <div className="grid gap-4">
                  {blogs.filter(b => b.status === "rejected").map((blog) => (
                    <Card key={blog.id} className="bg-red-500/10 backdrop-blur-sm border-red-500/30">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h4 className="text-xl text-white mb-2">{blog.title}</h4>
                            <p className="text-gray-400 text-sm mb-3">{blog.excerpt}</p>
                            <p className="text-xs text-gray-500">By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleDeleteBlog(blog.id)}
                              size="sm"
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl text-white">Event Management</h3>
              <Dialog open={eventDialogOpen} onOpenChange={(open) => {
                setEventDialogOpen(open);
                if (!open) resetEventForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-cyan-500/20 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {editingEvent ? "Update the event details" : "Fill in the details to create a new event"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Event Title</Label>
                      <Input
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white"
                        placeholder="Event name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={eventForm.description}
                        onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white resize-none"
                        placeholder="Event description"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={eventForm.date}
                          onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                          className="bg-gray-800/50 border-cyan-500/30 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={eventForm.time}
                          onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                          className="bg-gray-800/50 border-cyan-500/30 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white"
                        placeholder="Event location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select
                        value={eventForm.category}
                        onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                        className="w-full bg-gray-800/50 border border-cyan-500/30 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      >
                        <option value="event">Event</option>
                        <option value="project">Project</option>
                        <option value="workshop">Workshop</option>
                        <option value="hackathon">Hackathon</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={eventForm.image}
                        onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingEvent ? "Update" : "Create"} Event
                    </Button>
                    <Button
                      onClick={() => {
                        setEventDialogOpen(false);
                        resetEventForm();
                      }}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {events.length === 0 ? (
                <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No events yet. Create your first one!</p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => (
                  <Card key={event.id} className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl text-white mb-2">{event.title}</h4>
                          <p className="text-gray-400 text-sm mb-3">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => openEditEvent(event)}
                            size="sm"
                            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteEvent(event.id)}
                            size="sm"
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl text-white">Gallery Management</h3>
              <Dialog open={photoDialogOpen} onOpenChange={(open) => {
                setPhotoDialogOpen(open);
                if (!open) resetPhotoForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Photo
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-cyan-500/20 text-white">
                  <DialogHeader>
                    <DialogTitle>Add Photo to Gallery</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Upload a new photo to the club gallery
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={photoForm.url}
                        onChange={(e) => setPhotoForm({ ...photoForm, url: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Caption</Label>
                      <Input
                        value={photoForm.caption}
                        onChange={(e) => setPhotoForm({ ...photoForm, caption: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white"
                        placeholder="Photo caption"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        value={photoForm.category}
                        onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white"
                        placeholder="e.g., Hackathon, Workshop, Social"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddPhoto}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Add Photo
                    </Button>
                    <Button
                      onClick={() => {
                        setPhotoDialogOpen(false);
                        resetPhotoForm();
                      }}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.length === 0 ? (
                <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20 col-span-full">
                  <CardContent className="py-12 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No photos yet. Add your first one!</p>
                  </CardContent>
                </Card>
              ) : (
                photos.map((photo) => (
                  <Card key={photo.id} className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20 overflow-hidden group">
                    <div className="relative aspect-video">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          onClick={() => handleDeletePhoto(photo.id)}
                          size="sm"
                          className="bg-red-500/90 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-white text-sm mb-1">{photo.caption || "No caption"}</p>
                      {photo.category && (
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                          {photo.category}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Registrations Tab */}
          <TabsContent value="registrations" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-2xl text-white">Event Registrations</h3>
              
              {/* Event Selector */}
              <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
                <CardContent className="p-6">
                  <Label className="text-gray-300 mb-2 block">Select Event</Label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value);
                      if (e.target.value) {
                        fetchRegistrations(e.target.value);
                      } else {
                        setRegistrations([]);
                      }
                    }}
                    className="w-full bg-gray-800/50 border border-cyan-500/30 text-white rounded-md px-3 py-2"
                  >
                    <option value="">-- Select an event --</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.title} - {new Date(event.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              {/* Registrations List */}
              {selectedEventId && (
                <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Registered Attendees</span>
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {registrations.length} {registrations.length === 1 ? 'person' : 'people'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {registrations.length === 0 ? (
                      <div className="py-12 text-center">
                        <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No registrations yet for this event</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {registrations.map((reg, index) => (
                          <div
                            key={reg.id}
                            className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400">
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-white">{reg.userName}</p>
                                <p className="text-sm text-gray-400">{reg.userEmail}</p>
                                {reg.studentId && (
                                  <p className="text-xs text-gray-500">ID: {reg.studentId}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">
                                {new Date(reg.registeredAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-600">
                                {new Date(reg.registeredAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl text-white">Notification Management</h3>
              <Dialog open={notificationDialogOpen} onOpenChange={(open) => {
                setNotificationDialogOpen(open);
                if (!open) {
                  setNotificationForm({ title: "", message: "", type: "info" });
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-cyan-500/20 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Notification to All Users</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Create a notification that will be visible to all users
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white"
                        placeholder="Notification title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                        className="bg-gray-800/50 border-cyan-500/30 text-white resize-none"
                        placeholder="Notification message"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <select
                        value={notificationForm.type}
                        onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                        className="w-full bg-gray-800/50 border border-cyan-500/30 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      >
                        <option value="info">Info</option>
                        <option value="success">Success</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCreateNotification}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
                      disabled={!notificationForm.title || !notificationForm.message}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Send Notification
                    </Button>
                    <Button
                      onClick={() => {
                        setNotificationDialogOpen(false);
                        setNotificationForm({ title: "", message: "", type: "info" });
                      }}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {notifications.length === 0 ? (
                <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
                  <CardContent className="py-12 text-center">
                    <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No notifications sent yet.</p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notification) => {
                  const getTypeColor = (type: string) => {
                    switch (type) {
                      case "success":
                        return "border-green-500/30 bg-green-500/10";
                      case "warning":
                        return "border-yellow-500/30 bg-yellow-500/10";
                      case "error":
                        return "border-red-500/30 bg-red-500/10";
                      default:
                        return "border-cyan-500/30 bg-cyan-500/10";
                    }
                  };

                  const getTypeText = (type: string) => {
                    switch (type) {
                      case "success":
                        return "Success";
                      case "warning":
                        return "Warning";
                      case "error":
                        return "Error";
                      default:
                        return "Info";
                    }
                  };

                  return (
                    <Card key={notification.id} className={`bg-gray-900/50 backdrop-blur-sm border-l-4 ${getTypeColor(notification.type)}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${getTypeColor(notification.type)} text-white border-0`}>
                                {getTypeText(notification.type)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <h4 className="text-xl text-white mb-2">{notification.title}</h4>
                            <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                              Read by {notification.readBy?.length || 0} user(s)
                            </p>
                          </div>
                          <Button
                            onClick={() => handleDeleteNotification(notification.id)}
                            size="sm"
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}