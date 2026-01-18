import { useState, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { Auth } from "./components/Auth";
import { Blog } from "./components/Blog";
import { Events } from "./components/Events";
import { Gallery } from "./components/Gallery";
import { Contact } from "./components/Contact";
import { Profile } from "./components/Profile";
import { AdminDashboard } from "./components/AdminDashboard";
import { SubmitArticle } from "./components/SubmitArticle";
import { Toaster } from "./components/ui/sonner";
import { supabase } from "./utils/supabase/client";
import { projectId } from "./utils/supabase/info";
import { ThemeProvider } from "./context/ThemeContext";
import { Heart, Home, BookOpen, Calendar, Image as ImageIcon, Mail } from "lucide-react";

function App() {
  const [currentSection, setCurrentSection] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const checkAuthStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsLoggedIn(true);
        setAccessToken(session.access_token);

        // Fetch profile to get username
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/profile`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          if (response.ok) {
            const profileData = await response.json();
            setUsername(profileData.profile?.name || session.user.email?.split('@')[0] || "User");
          } else {
            // Profile not found - user might be signing in with Google for first time
            // Create a basic profile
            const userMetadata = session.user.user_metadata;
            const userName = userMetadata?.full_name || userMetadata?.name || session.user.email?.split('@')[0] || "User";
            
            try {
              const createProfileResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/google-signup`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({
                    name: userName,
                    email: session.user.email,
                  }),
                }
              );
              
              if (createProfileResponse.ok) {
                setUsername(userName);
              } else {
                setUsername(session.user.email?.split('@')[0] || "User");
              }
            } catch (error) {
              console.log("Error creating Google user profile:", error);
              setUsername(session.user.email?.split('@')[0] || "User");
            }
          }
        } catch (error) {
          console.log("Error fetching profile:", error);
          setUsername(session.user.email?.split('@')[0] || "User");
        }
        
        // Check if user is admin (always check, regardless of profile fetch result)
        try {
          console.log("Checking admin status for user:", session.user.email);
          const adminResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/check`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );
          
          console.log("Admin check response status:", adminResponse.status);
          
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            console.log("Admin check response data:", adminData);
            if (adminData.isAdmin === true) {
              console.log("User is admin, setting isAdmin to true");
              setIsAdmin(true);
            } else {
              console.log("User is not admin");
              setIsAdmin(false);
            }
          } else {
            const errorData = await adminResponse.json().catch(() => ({}));
            console.log("Admin check failed:", adminResponse.status, errorData);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      }
    };

    checkAuthStatus();

    // Listen for auth state changes (for OAuth redirects)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsLoggedIn(true);
        setAccessToken(session.access_token);
        
        // Fetch or create profile
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/profile`,
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            }
          );

          if (response.ok) {
            const profileData = await response.json();
            setUsername(profileData.profile?.name || session.user.email?.split('@')[0] || "User");
          } else {
            // Create profile for Google user
            const userMetadata = session.user.user_metadata;
            const userName = userMetadata?.full_name || userMetadata?.name || session.user.email?.split('@')[0] || "User";
            
            const createProfileResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/google-signup`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  name: userName,
                  email: session.user.email,
                }),
              }
            );
            
            if (createProfileResponse.ok) {
              setUsername(userName);
            } else {
              setUsername(session.user.email?.split('@')[0] || "User");
            }
          }
          
          // Check admin status (always check, regardless of profile fetch result)
          try {
            console.log("Checking admin status for user:", session.user.email);
            const adminResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/check`,
              {
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              }
            );
            
            console.log("Admin check response status:", adminResponse.status);
            
            if (adminResponse.ok) {
              const adminData = await adminResponse.json();
              console.log("Admin check response data:", adminData);
              if (adminData.isAdmin === true) {
                console.log("User is admin, setting isAdmin to true");
                setIsAdmin(true);
              } else {
                console.log("User is not admin");
                setIsAdmin(false);
              }
            } else {
              const errorData = await adminResponse.json().catch(() => ({}));
              console.log("Admin check failed:", adminResponse.status, errorData);
              setIsAdmin(false);
            }
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          }
          
          setCurrentSection("home");
        } catch (error) {
          console.log("Error handling OAuth sign-in:", error);
          setUsername(session.user.email?.split('@')[0] || "User");
        }
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUsername("");
        setAccessToken("");
        setIsAdmin(false);
        setCurrentSection("home");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigate = (section: string) => {
    setCurrentSection(section);
  };

  const handleLogin = async (username: string, accessToken: string, userId: string) => {
    setUsername(username);
    setAccessToken(accessToken);
    setIsLoggedIn(true);
    
    // Check if user is admin
    try {
      console.log("Checking admin status after login for token:", accessToken.substring(0, 20) + "...");
      const adminResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/admin/check`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      console.log("Admin check response status:", adminResponse.status);
      
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log("Admin check response data:", adminData);
        if (adminData.isAdmin === true) {
          console.log("User is admin, setting isAdmin to true");
          setIsAdmin(true);
        } else {
          console.log("User is not admin");
          setIsAdmin(false);
        }
      } else {
        const errorData = await adminResponse.json().catch(() => ({}));
        console.log("Admin check failed:", adminResponse.status, errorData);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
    
    // Navigate to home after successful login
    setCurrentSection("home");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUsername("");
    setAccessToken("");
    setIsAdmin(false);
    setCurrentSection("home");
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black dark:from-black dark:via-gray-900 dark:to-black light:from-gray-50 light:via-white light:to-gray-100">
        <Navigation
          currentSection={currentSection}
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          username={username}
          isAdmin={isAdmin}
        />

        <div className="pt-16">
          {currentSection === "home" && (
            <Hero onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
          )}
          {currentSection === "auth" && <Auth onLogin={handleLogin} />}
          {currentSection === "blog" && <Blog />}
          {currentSection === "events" && <Events accessToken={accessToken} isLoggedIn={isLoggedIn} />}
          {currentSection === "gallery" && <Gallery />}
          {currentSection === "contact" && <Contact />}
          {currentSection === "profile" && isLoggedIn && <Profile accessToken={accessToken} />}
          {currentSection === "submit-article" && isLoggedIn && <SubmitArticle accessToken={accessToken} />}
          {currentSection === "admin" && isLoggedIn && <AdminDashboard accessToken={accessToken} />}
        </div>

        {/* Footer */}
        <footer className="border-t border-cyan-500/20 bg-black/50 dark:bg-black/50 light:bg-white/50 backdrop-blur-sm mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Quick Links */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-cyan-400">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleNavigate("home")}
                      className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      <span>Home</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigate("blog")}
                      className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Blog</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigate("events")}
                      className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Events</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigate("gallery")}
                      className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Gallery</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigate("contact")}
                      className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-cyan-400">Connect With Us</h3>
                <div className="flex flex-wrap gap-4">
                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/company/bitsa-club"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#0077B5] transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://www.youtube.com/@bitsaclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#FF0000] transition-colors"
                    aria-label="YouTube"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>

                  {/* X.com (Twitter) */}
                  <a
                    href="https://x.com/bitsaclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#000000] dark:hover:text-white transition-colors"
                    aria-label="X (Twitter)"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/bitsaclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#E4405F] transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>

                  {/* TikTok */}
                  <a
                    href="https://www.tiktok.com/@bitsaclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#000000] dark:hover:text-white transition-colors"
                    aria-label="TikTok"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* About */}
              <div>
                <h3 className="text-white font-semibold mb-4 text-cyan-400">About Bitsa Club</h3>
                <p className="text-gray-400 text-sm mb-4">
                  A community of passionate developers, innovators, and tech enthusiasts. Learn, build, and grow together.
                </p>
              </div>
            </div>

            <div className="border-t border-cyan-500/20 pt-6 text-center">
              <p className="text-gray-400 dark:text-gray-400 light:text-gray-600 mb-2">
                © 2024 Bitsa Club. All rights reserved.
              </p>
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <span>Built with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>by Bitsa Club members</span>
              </p>
            </div>
          </div>
        </footer>

        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;