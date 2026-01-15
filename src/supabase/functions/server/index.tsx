// Deno types for Supabase Edge Functions
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

// Note: npm: and jsr: imports are Deno-specific and correct for Supabase Edge Functions
// TypeScript may show errors locally, but these work correctly when deployed to Supabase
// @ts-ignore - Deno-specific import protocol
import { Hono, Context } from "npm:hono";
// @ts-ignore - Deno-specific import protocol
import { cors } from "npm:hono/cors";
// @ts-ignore - Deno-specific import protocol
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
// @ts-ignore - Deno-specific import protocol (jsr:)
import { createClient } from "jsr:@supabase/supabase-js@2";
import { isAdmin } from "./admin.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-430e8b93/health", (c: Context) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-430e8b93/signup", async (c: Context) => {
  try {
    const { name, email, password, studentId } = await c.req.json();
    
    if (!name || !email || !password || !studentId) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Require email confirmation before login to prevent fake email registrations
      email_confirm: false
    });

    if (authError) {
      console.log("Authorization error while signing up user:", authError);
      return c.json({ error: authError.message }, 400);
    }

    // Store additional profile data in KV store
    const userId = authData.user.id;
    await kv.set(`profile:${userId}`, {
      name,
      email,
      studentId,
      bio: "",
      major: "",
      year: "",
      interests: [],
      github: "",
      linkedin: "",
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      user: { 
        id: userId, 
        email, 
        name 
      } 
    });
  } catch (error) {
    console.log("Error during signup:", error);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Google OAuth signup endpoint - creates profile for Google users
app.post("/make-server-430e8b93/google-signup", async (c: Context) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log("Authorization error while creating Google user profile:", error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { name, email } = await c.req.json();
    
    if (!name || !email) {
      return c.json({ error: "Name and email are required" }, 400);
    }

    // Check if profile already exists
    const existingProfile = await kv.get(`profile:${user.id}`);
    if (existingProfile) {
      return c.json({ success: true, profile: existingProfile });
    }

    // Create profile for Google user (no student ID required for OAuth)
    const profile = {
      name,
      email,
      studentId: "", // Empty for Google users - can be filled later in profile settings
      bio: "",
      major: "",
      year: "",
      interests: [],
      github: "",
      linkedin: "",
      createdAt: new Date().toISOString()
    };

    await kv.set(`profile:${user.id}`, profile);

    return c.json({ success: true, profile });
  } catch (error) {
    console.log("Error creating Google user profile:", error);
    return c.json({ error: "Failed to create profile" }, 500);
  }
});

// Sign in endpoint (handled by Supabase client, but we can add server validation if needed)
app.post("/make-server-430e8b93/signin", async (c: Context) => {
  try {
    const { email, password } = await c.req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log("Authorization error while signing in user:", error);
      return c.json({ error: error.message }, 400);
    }

    // Get profile data
    const profile = await kv.get(`profile:${data.user.id}`);

    return c.json({ 
      success: true,
      user: data.user,
      session: data.session,
      profile
    });
  } catch (error) {
    console.log("Error during signin:", error);
    return c.json({ error: "Failed to sign in" }, 500);
  }
});

// Get user profile
app.get("/make-server-430e8b93/profile", async (c: Context) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log("Authorization error while getting user profile:", error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`profile:${user.id}`);
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json({ success: true, profile });
  } catch (error) {
    console.log("Error fetching profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Update user profile
app.put("/make-server-430e8b93/profile", async (c: Context) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log("Authorization error while updating user profile:", error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const updates = await c.req.json();
    const currentProfile = await kv.get(`profile:${user.id}`);
    
    if (!currentProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    // Merge updates with current profile
    const updatedProfile = {
      ...currentProfile,
      ...updates,
      email: currentProfile.email, // Don't allow email changes
      studentId: currentProfile.studentId, // Don't allow student ID changes
      updatedAt: new Date().toISOString()
    };

    await kv.set(`profile:${user.id}`, updatedProfile);

    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.log("Error updating profile:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Helper function to verify admin access
async function verifyAdmin(c: Context) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return { error: "Unauthorized - No token provided", status: 401 };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log("Auth error:", error);
    return { error: "Unauthorized", status: 401 };
  }

  const userEmail = user.email || "";
  console.log(`[verifyAdmin] User email from Supabase: "${userEmail}"`);
  console.log(`[verifyAdmin] User object:`, JSON.stringify({ 
    id: user.id, 
    email: user.email, 
    email_confirmed_at: user.email_confirmed_at 
  }));
  
  if (!isAdmin(userEmail)) {
    console.log(`[verifyAdmin] ❌ Access denied for email: ${userEmail}`);
    return { error: "Forbidden - Admin access required", status: 403 };
  }
  
  console.log(`[verifyAdmin] ✅ Access granted for admin email: ${userEmail}`);

  return { user };
}

// Check if user is admin
app.get("/make-server-430e8b93/admin/check", async (c: Context) => {
  try {
    const result = await verifyAdmin(c);
    
    if (result.error || !result.user) {
      return c.json({ isAdmin: false }, result.status || 403);
    }

    return c.json({ isAdmin: true, email: result.user.email });
  } catch (error) {
    console.log("Error checking admin status:", error);
    return c.json({ isAdmin: false }, 500);
  }
});

// ==================== BLOG ENDPOINTS ====================

// Get all approved blogs (for public view)
app.get("/make-server-430e8b93/blogs", async (c: Context) => {
  try {
    const allBlogs = await kv.getByPrefix("blog:");
    // Filter only approved blogs for public view
    const blogs = allBlogs.filter((blog: any) => blog.status === "approved");
    const sortedBlogs = blogs.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json({ success: true, blogs: sortedBlogs });
  } catch (error) {
    console.log("Error fetching blogs:", error);
    return c.json({ error: "Failed to fetch blogs" }, 500);
  }
});

// Get all blogs including pending (admin only)
app.get("/make-server-430e8b93/admin/all-blogs", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const blogs = await kv.getByPrefix("blog:");
    const sortedBlogs = blogs.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json({ success: true, blogs: sortedBlogs });
  } catch (error) {
    console.log("Error fetching all blogs:", error);
    return c.json({ error: "Failed to fetch blogs" }, 500);
  }
});

// Submit article (members - requires approval)
app.post("/make-server-430e8b93/articles/submit", async (c: Context) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log("Authorization error while submitting article:", error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { title, excerpt, content, tags, image, readTime } = await c.req.json();
    
    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    // Get user profile for author name
    const profile = await kv.get(`profile:${user.id}`);
    const authorName = profile?.name || user.email?.split('@')[0] || "Anonymous";

    // Calculate read time if not provided
    const calculatedReadTime = readTime || (() => {
      const wordsPerMinute = 200;
      const wordCount = content.trim().split(/\s+/).length;
      const minutes = Math.ceil(wordCount / wordsPerMinute);
      return `${minutes} min read`;
    })();

    const blogId = `blog:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const blog = {
      id: blogId,
      title,
      excerpt: excerpt || "",
      content,
      author: authorName,
      authorId: user.id,
      authorEmail: user.email,
      tags: tags || [],
      image: image || "",
      readTime: calculatedReadTime,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(blogId, blog);

    return c.json({ success: true, blog });
  } catch (error) {
    console.log("Error submitting article:", error);
    return c.json({ error: "Failed to submit article" }, 500);
  }
});

// Create blog (admin only - auto approved)
app.post("/make-server-430e8b93/admin/blogs", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const { title, excerpt, content, author, tags, image } = await c.req.json();
    
    if (!title || !content || !author) {
      return c.json({ error: "Title, content, and author are required" }, 400);
    }

    const blogId = `blog:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const blog = {
      id: blogId,
      title,
      excerpt: excerpt || "",
      content,
      author,
      tags: tags || [],
      image: image || "",
      status: "approved",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(blogId, blog);

    return c.json({ success: true, blog });
  } catch (error) {
    console.log("Error creating blog:", error);
    return c.json({ error: "Failed to create blog" }, 500);
  }
});

// Approve article (admin only)
app.put("/make-server-430e8b93/admin/blogs/:id/approve", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const blogId = c.req.param('id');
    const currentBlog = await kv.get(blogId);

    if (!currentBlog) {
      return c.json({ error: "Blog not found" }, 404);
    }

    const updatedBlog = {
      ...currentBlog,
      status: "approved",
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(blogId, updatedBlog);

    return c.json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.log("Error approving blog:", error);
    return c.json({ error: "Failed to approve blog" }, 500);
  }
});

// Reject article (admin only)
app.put("/make-server-430e8b93/admin/blogs/:id/reject", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const blogId = c.req.param('id');
    const currentBlog = await kv.get(blogId);

    if (!currentBlog) {
      return c.json({ error: "Blog not found" }, 404);
    }

    const updatedBlog = {
      ...currentBlog,
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(blogId, updatedBlog);

    return c.json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.log("Error rejecting blog:", error);
    return c.json({ error: "Failed to reject blog" }, 500);
  }
});

// Update blog (admin only)
app.put("/make-server-430e8b93/admin/blogs/:id", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const blogId = c.req.param('id');
    const updates = await c.req.json();
    const currentBlog = await kv.get(blogId);

    if (!currentBlog) {
      return c.json({ error: "Blog not found" }, 404);
    }

    const updatedBlog = {
      ...currentBlog,
      ...updates,
      id: blogId,
      status: currentBlog.status || "approved", // Preserve or default to approved
      updatedAt: new Date().toISOString()
    };

    await kv.set(blogId, updatedBlog);

    return c.json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.log("Error updating blog:", error);
    return c.json({ error: "Failed to update blog" }, 500);
  }
});

// Delete blog (admin only)
app.delete("/make-server-430e8b93/admin/blogs/:id", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const blogId = c.req.param('id');
    await kv.del(blogId);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting blog:", error);
    return c.json({ error: "Failed to delete blog" }, 500);
  }
});

// ==================== EVENT ENDPOINTS ====================

// Get all events
app.get("/make-server-430e8b93/events", async (c: Context) => {
  try {
    const events = await kv.getByPrefix("event:");
    const sortedEvents = events.sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return c.json({ success: true, events: sortedEvents });
  } catch (error) {
    console.log("Error fetching events:", error);
    return c.json({ error: "Failed to fetch events" }, 500);
  }
});

// Create event (admin only)
app.post("/make-server-430e8b93/admin/events", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const { title, description, date, time, location, image } = await c.req.json();
    
    if (!title || !date || !time || !location) {
      return c.json({ error: "Title, date, time, and location are required" }, 400);
    }

    const eventId = `event:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const event = {
      id: eventId,
      title,
      description: description || "",
      date,
      time,
      location,
      image: image || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(eventId, event);

    return c.json({ success: true, event });
  } catch (error) {
    console.log("Error creating event:", error);
    return c.json({ error: "Failed to create event" }, 500);
  }
});

// Update event (admin only)
app.put("/make-server-430e8b93/admin/events/:id", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const eventId = c.req.param('id');
    const updates = await c.req.json();
    const currentEvent = await kv.get(eventId);

    if (!currentEvent) {
      return c.json({ error: "Event not found" }, 404);
    }

    const updatedEvent = {
      ...currentEvent,
      ...updates,
      id: eventId,
      updatedAt: new Date().toISOString()
    };

    await kv.set(eventId, updatedEvent);

    return c.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.log("Error updating event:", error);
    return c.json({ error: "Failed to update event" }, 500);
  }
});

// Delete event (admin only)
app.delete("/make-server-430e8b93/admin/events/:id", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const eventId = c.req.param('id');
    await kv.del(eventId);

    // Also delete all registrations for this event
    const registrations = await kv.getByPrefix(`registration:${eventId}`);
    for (const reg of registrations) {
      await kv.del(reg.id);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting event:", error);
    return c.json({ error: "Failed to delete event" }, 500);
  }
});

// ==================== EVENT REGISTRATION ENDPOINTS ====================

// Register for event
app.post("/make-server-430e8b93/events/:id/register", async (c: Context) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized - No token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      console.log("Authorization error while registering for event:", error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const eventId = c.req.param('id');
    const event = await kv.get(eventId);

    if (!event) {
      return c.json({ error: "Event not found" }, 404);
    }

    // Get user profile
    const profile = await kv.get(`profile:${user.id}`);
    
    // Check if already registered
    const existingReg = await kv.get(`registration:${eventId}:${user.id}`);
    if (existingReg) {
      return c.json({ error: "You are already registered for this event" }, 400);
    }

    const registrationId = `registration:${eventId}:${user.id}`;
    const registration = {
      id: registrationId,
      eventId,
      eventTitle: event.title,
      userId: user.id,
      userName: profile?.name || user.email?.split('@')[0] || "Anonymous",
      userEmail: user.email,
      studentId: profile?.studentId || "",
      registeredAt: new Date().toISOString()
    };

    await kv.set(registrationId, registration);

    return c.json({ success: true, registration });
  } catch (error) {
    console.log("Error registering for event:", error);
    return c.json({ error: "Failed to register for event" }, 500);
  }
});

// Check if user is registered for event
app.get("/make-server-430e8b93/events/:id/check-registration", async (c: Context) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ isRegistered: false });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return c.json({ isRegistered: false });
    }

    const eventId = c.req.param('id');
    const registration = await kv.get(`registration:${eventId}:${user.id}`);

    return c.json({ isRegistered: !!registration, registration });
  } catch (error) {
    console.log("Error checking registration:", error);
    return c.json({ isRegistered: false });
  }
});

// Get event registrations (admin only)
app.get("/make-server-430e8b93/admin/events/:id/registrations", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const eventId = c.req.param('id');
    const registrations = await kv.getByPrefix(`registration:${eventId}`);

    return c.json({ success: true, registrations, count: registrations.length });
  } catch (error) {
    console.log("Error fetching registrations:", error);
    return c.json({ error: "Failed to fetch registrations" }, 500);
  }
});

// ==================== GALLERY ENDPOINTS ====================

// Get all gallery photos
app.get("/make-server-430e8b93/gallery", async (c: Context) => {
  try {
    const photos = await kv.getByPrefix("photo:");
    const sortedPhotos = photos.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json({ success: true, photos: sortedPhotos });
  } catch (error) {
    console.log("Error fetching gallery:", error);
    return c.json({ error: "Failed to fetch gallery" }, 500);
  }
});

// Add photo to gallery (admin only)
app.post("/make-server-430e8b93/admin/gallery", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const { url, caption, category } = await c.req.json();
    
    if (!url) {
      return c.json({ error: "Image URL is required" }, 400);
    }

    const photoId = `photo:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const photo = {
      id: photoId,
      url,
      caption: caption || "",
      category: category || "general",
      createdAt: new Date().toISOString()
    };

    await kv.set(photoId, photo);

    return c.json({ success: true, photo });
  } catch (error) {
    console.log("Error adding photo:", error);
    return c.json({ error: "Failed to add photo" }, 500);
  }
});

// Delete photo from gallery (admin only)
app.delete("/make-server-430e8b93/admin/gallery/:id", async (c: Context) => {
  try {
    const adminCheck = await verifyAdmin(c);
    if (adminCheck.error) {
      return c.json({ error: adminCheck.error }, adminCheck.status);
    }

    const photoId = c.req.param('id');
    await kv.del(photoId);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting photo:", error);
    return c.json({ error: "Failed to delete photo" }, 500);
  }
});

// ==================== STATS ENDPOINTS ====================

// Get members count
app.get("/make-server-430e8b93/stats/members", async (c: Context) => {
  try {
    const profiles = await kv.getByPrefix("profile:");
    return c.json({ success: true, count: profiles.length });
  } catch (error) {
    console.log("Error fetching members count:", error);
    return c.json({ error: "Failed to fetch members count", count: 0 }, 500);
  }
});

Deno.serve(app.fetch);