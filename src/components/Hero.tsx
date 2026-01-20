import { useState, useEffect } from "react";
import { Code2, Users, Rocket, Trophy, Calendar, BookOpen, Image as ImageIcon, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface HeroProps {
  onNavigate: (section: string) => void;
  isLoggedIn: boolean;
}

interface Stats {
  activeMembers: number;
  projects: number;
  hackathons: number;
  workshops: number;
}

export function Hero({ onNavigate, isLoggedIn }: HeroProps) {
  const [stats, setStats] = useState<Stats>({
    activeMembers: 0,
    projects: 0,
    hackathons: 0,
    workshops: 0,
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<any[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
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
      
      // Fetch photos
      const photosResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/gallery`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const photosData = await photosResponse.json();

      // Fetch members count
      const membersResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/stats/members`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const membersData = await membersResponse.json();

      if (eventsData.success) {
        const events = eventsData.events;
        
        // Count event types by category
        const projectsList = events.filter((e: any) => 
          (e.category || "event").toLowerCase() === "project"
        );
        const hackathonsList = events.filter((e: any) => 
          (e.category || "event").toLowerCase() === "hackathon"
        );
        const workshopsList = events.filter((e: any) => 
          (e.category || "event").toLowerCase() === "workshop"
        );

        setStats({
          activeMembers: membersData.count || 0,
          projects: projectsList.length,
          hackathons: hackathonsList.length,
          workshops: workshopsList.length,
        });

        // Get upcoming events (limit to 3)
        const now = new Date();
        const upcoming = events
          .filter((e: any) => {
            const eventDateTime = new Date(`${e.date}T${e.time}`);
            return eventDateTime >= now;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 3);
        
        setRecentEvents(upcoming);

        // Get recent projects (limit to 3)
        const recentProjects = projectsList
          .sort((a: any, b: any) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 3);
        setProjects(recentProjects);

        // Get recent workshops (limit to 3)
        const recentWorkshops = workshopsList
          .sort((a: any, b: any) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 3);
        setWorkshops(recentWorkshops);
      }

      if (blogsData.success) {
        setRecentBlogs(blogsData.blogs.slice(0, 3));
      }

      if (photosData.success) {
        setRecentPhotos(photosData.photos.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsDisplay = [
    { icon: Users, label: "Active Members", value: stats.activeMembers, color: "text-cyan-400" },
    { icon: Rocket, label: "Projects", value: stats.projects, color: "text-purple-400" },
    { icon: Trophy, label: "Hackathons", value: stats.hackathons, color: "text-green-400" },
    { icon: Code2, label: "Workshops", value: stats.workshops, color: "text-orange-400" },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black dark:from-black dark:via-gray-900 dark:to-black light:from-gray-50 light:via-white light:to-gray-100">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Code-like decoration */}
            <div className="mb-6 flex items-center justify-center gap-2 text-cyan-400 dark:text-cyan-400 light:text-cyan-600 text-sm">
              <span className="opacity-50">{'<'}</span>
              <span className="font-mono">WELCOME_TO</span>
              <span className="opacity-50">{'/>'}</span>
            </div>

            <h1 className="text-5xl md:text-7xl mb-6 text-white dark:text-white light:text-gray-900">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                Bitsa Club
              </span>
            </h1>

            <p className="text-xl text-gray-300 dark:text-gray-300 light:text-gray-700 mb-8 max-w-2xl mx-auto">
              Join our community of passionate developers, innovators, and tech enthusiasts. 
              Learn, build, and grow together.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
              {!isLoggedIn && (
                <Button
                  onClick={() => onNavigate("auth")}
                  className="bg-cyan-500 hover:bg-cyan-600 text-black px-8 py-6 text-lg"
                >
                  Join the Club
                </Button>
              )}
              <Button
                onClick={() => onNavigate("events")}
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8 py-6 text-lg"
              >
                View Events
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {statsDisplay.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/50 transition-all"
                  >
                    <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                    <div className="text-2xl text-white mb-1">
                      {loading ? "..." : stat.value}
                    </div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Content Preview Sections */}
      <div className="container mx-auto px-4 py-20">
        {/* Upcoming Events Preview */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-400 text-sm">
                <span className="opacity-50">{'<'}</span>
                <span className="font-mono">UPCOMING_EVENTS</span>
                <span className="opacity-50">{'/>'}</span>
              </div>
              <h2 className="text-3xl md:text-4xl text-white">Next Events</h2>
            </div>
            <Button
              onClick={() => onNavigate("events")}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : recentEvents.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {recentEvents.map((event) => (
                <Card
                  key={event.id}
                  className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-500/50 transition-all group overflow-hidden cursor-pointer"
                  onClick={() => onNavigate("events")}
                >
                  {event.image && (
                    <div className="relative h-40 overflow-hidden">
                      <ImageWithFallback
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-green-500/90 text-black border-0">
                          Upcoming
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white group-hover:text-cyan-400 transition-colors">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No upcoming events at the moment.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Blog Posts Preview */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-400 text-sm">
                <span className="opacity-50">{'<'}</span>
                <span className="font-mono">LATEST_ARTICLES</span>
                <span className="opacity-50">{'/>'}</span>
              </div>
              <h2 className="text-3xl md:text-4xl text-white">Recent Articles</h2>
            </div>
            <Button
              onClick={() => onNavigate("blog")}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : recentBlogs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {recentBlogs.map((blog) => (
                <Card
                  key={blog.id}
                  className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-500/50 transition-all group overflow-hidden cursor-pointer"
                  onClick={() => onNavigate("blog")}
                >
                  {blog.image && (
                    <div className="relative h-40 overflow-hidden">
                      <ImageWithFallback
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {blog.tags && blog.tags[0] && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-cyan-500/90 text-black border-0">
                            {blog.tags[0]}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 line-clamp-2">
                      {blog.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{blog.author}</span>
                      <span>{blog.readTime || "5 min read"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No articles published yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Projects Preview */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-400 text-sm">
                <span className="opacity-50">{'<'}</span>
                <span className="font-mono">ACTIVE_PROJECTS</span>
                <span className="opacity-50">{'/>'}</span>
              </div>
              <h2 className="text-3xl md:text-4xl text-white">Our Projects</h2>
            </div>
            <Button
              onClick={() => onNavigate("events")}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : projects.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-gray-900/50 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/50 transition-all group overflow-hidden cursor-pointer"
                  onClick={() => onNavigate("events")}
                >
                  {project.image && (
                    <div className="relative h-40 overflow-hidden">
                      <ImageWithFallback
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-purple-500/90 text-white border-0">
                          Project
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>{new Date(project.date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-900/50 backdrop-blur-sm border-purple-500/20">
              <CardContent className="py-12 text-center">
                <Rocket className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No projects available yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Workshops Preview */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-400 text-sm">
                <span className="opacity-50">{'<'}</span>
                <span className="font-mono">UPCOMING_WORKSHOPS</span>
                <span className="opacity-50">{'/>'}</span>
              </div>
              <h2 className="text-3xl md:text-4xl text-white">Workshops</h2>
            </div>
            <Button
              onClick={() => onNavigate("events")}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : workshops.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {workshops.map((workshop) => (
                <Card
                  key={workshop.id}
                  className="bg-gray-900/50 backdrop-blur-sm border-orange-500/20 hover:border-orange-500/50 transition-all group overflow-hidden cursor-pointer"
                  onClick={() => onNavigate("events")}
                >
                  {workshop.image && (
                    <div className="relative h-40 overflow-hidden">
                      <ImageWithFallback
                        src={workshop.image}
                        alt={workshop.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-orange-500/90 text-black border-0">
                          Workshop
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white group-hover:text-orange-400 transition-colors">
                      {workshop.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400 line-clamp-2">
                      {workshop.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      <span>{new Date(workshop.date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-900/50 backdrop-blur-sm border-orange-500/20">
              <CardContent className="py-12 text-center">
                <Code2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No workshops scheduled yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Gallery Preview */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="mb-2 flex items-center gap-2 text-cyan-400 text-sm">
                <span className="opacity-50">{'<'}</span>
                <span className="font-mono">PHOTO_GALLERY</span>
                <span className="opacity-50">{'/>'}</span>
              </div>
              <h2 className="text-3xl md:text-4xl text-white">Recent Photos</h2>
            </div>
            <Button
              onClick={() => onNavigate("gallery")}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
          ) : recentPhotos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square bg-gray-900/50 border border-cyan-500/20 hover:border-cyan-500/50 transition-all"
                  onClick={() => onNavigate("gallery")}
                >
                  <ImageWithFallback
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-sm truncate">{photo.caption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
              <CardContent className="py-12 text-center">
                <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No photos available yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}