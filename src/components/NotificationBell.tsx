import * as React from "react";
import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { supabase } from "../utils/supabase/client";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  readBy?: string[];
}

interface NotificationBellProps {
  isLoggedIn: boolean;
  accessToken?: string;
}

export function NotificationBell({ isLoggedIn, accessToken }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && accessToken) {
      const getUser = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser(accessToken);
          if (user) {
            setCurrentUserId(user.id);
          }
        } catch (error) {
          console.error("Error getting user:", error);
        }
      };
      getUser();
    }
  }, [isLoggedIn, accessToken]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, accessToken]);

  useEffect(() => {
    // Check unread count properly
    if (notifications.length > 0 && currentUserId) {
      const unread = notifications.filter((n) => 
        !n.readBy || !n.readBy.includes(currentUserId)
      ).length;
      setUnreadCount(unread);
    } else {
      setUnreadCount(0);
    }
  }, [notifications, currentUserId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
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
        setNotifications(data.notifications || []);
        // Count unread notifications for current user
        if (accessToken) {
          const { data: { user } } = await supabase.auth.getUser(accessToken);
          if (user) {
            const unread = data.notifications.filter((n: Notification) => 
              !n.readBy || !n.readBy.includes(user.id)
            ).length;
            setUnreadCount(unread);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!accessToken) return;

    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-400 border-green-500/20";
      case "warning":
        return "text-yellow-400 border-yellow-500/20";
      case "error":
        return "text-red-400 border-red-500/20";
      default:
        return "text-cyan-400 border-cyan-500/20";
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10";
      case "warning":
        return "bg-yellow-500/10";
      case "error":
        return "bg-red-500/10";
      default:
        return "bg-cyan-500/10";
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-black/95 dark:bg-black/95 border border-cyan-500/20 text-gray-300 max-h-[400px] overflow-y-auto"
      >
        <div className="px-3 py-2 border-b border-cyan-500/20 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {loading ? (
          <div className="px-3 py-6 text-center text-sm text-gray-400">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-gray-400">
            No notifications
          </div>
        ) : (
          <div className="py-1">
            {notifications.map((notification) => {
              // Check if notification is unread for current user
              const isUnread = currentUserId 
                ? !notification.readBy || !notification.readBy.includes(currentUserId)
                : true;
              
              return (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer border-l-2 ${getNotificationColor(notification.type)} ${isUnread ? getNotificationBg(notification.type) : ""} focus:bg-opacity-20`}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{notification.message}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
