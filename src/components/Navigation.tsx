import * as React from "react";
import { Code2, Home, BookOpen, Calendar, Image, Mail, LogOut, User, Shield, FileText, Sun, Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "../context/ThemeContext";

interface NavigationProps {
  currentSection: string;
  onNavigate: (section: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  username?: string;
  isAdmin?: boolean;
}

export function Navigation({ currentSection, onNavigate, isLoggedIn, onLogout, username, isAdmin }: NavigationProps) {
  // Debug logging
  console.log("Navigation - isAdmin prop:", isAdmin, "type:", typeof isAdmin);
  
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "blog", label: "Blog", icon: BookOpen },
    { id: "events", label: "Events", icon: Calendar },
    { id: "gallery", label: "Gallery", icon: Image },
    { id: "contact", label: "Contact", icon: Mail },
  ];

  const userNavItems = isLoggedIn 
    ? [
        { id: "profile", label: "Profile", icon: User },
        { id: "submit-article", label: "Submit Article", icon: FileText }
      ]
    : [];

  const adminNavItems = isAdmin === true
    ? [{ id: "admin", label: "Admin", icon: Shield }]
    : [];
    
  console.log("Navigation - adminNavItems:", adminNavItems);

  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 dark:bg-black/80 light:bg-white/90 backdrop-blur-md border-b border-cyan-500/20 dark:border-cyan-500/20 light:border-cyan-500/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
            <div className="relative">
              <Code2 className="w-8 h-8 text-cyan-400" />
              <div className="absolute inset-0 blur-md bg-cyan-400/50"></div>
            </div>
            <img 
                src="/assets/blogo.svg" 
                alt="Bitsa Logo" 
                className="h-10 w-auto group-hover:scale-105 transition-transform"
              />
          </div>

          <div className="hidden md:flex items-center gap-1">
            {[...navItems, ...userNavItems, ...adminNavItems].map((item) => {
              const Icon = item.icon;
              const isAdminItem = item.id === "admin";
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    currentSection === item.id
                      ? isAdminItem 
                        ? "bg-purple-500/20 text-purple-400" 
                        : "bg-cyan-500/20 text-cyan-400 dark:text-cyan-400 light:text-cyan-600"
                      : isAdminItem
                        ? "text-purple-300 hover:text-purple-400 hover:bg-purple-500/10"
                        : "text-gray-300 dark:text-gray-300 light:text-gray-700 hover:text-cyan-400 dark:hover:text-cyan-400 light:hover:text-cyan-600 hover:bg-cyan-500/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {isLoggedIn ? (
              <>
                <button
                  onClick={() => onNavigate("profile")}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 rounded-md border border-cyan-500/30 hover:bg-cyan-500/20 transition-all"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-cyan-400">{username}</span>
                </button>
                <Button
                  onClick={onLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => onNavigate("auth")}
                className="bg-cyan-500 hover:bg-cyan-600 text-black"
              >
                Login / Register
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto pb-3 scrollbar-hide">
          {[...navItems, ...userNavItems, ...adminNavItems].map((item) => {
            const Icon = item.icon;
            const isAdminItem = item.id === "admin";
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md whitespace-nowrap transition-all text-sm ${
                  currentSection === item.id
                    ? isAdminItem
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-cyan-500/20 text-cyan-400"
                    : isAdminItem
                      ? "text-purple-300 hover:text-purple-400"
                      : "text-gray-300 hover:text-cyan-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}