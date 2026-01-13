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
            <div className="text-center text-gray-400 dark:text-gray-400 light:text-gray-600">
              <p className="mb-2">© 2024 Bitsa Club. All rights reserved.</p>
              <p className="text-sm">Built with ❤️ by Bitsa Club members</p>
            </div>
          </div>
        </footer>

        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;