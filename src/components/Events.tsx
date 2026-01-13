import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, MapPin, Clock, Users, Loader2, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
}

interface EventsProps {
  accessToken?: string;
  isLoggedIn?: boolean;
}

export function Events({ accessToken, isLoggedIn }: EventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<{ [key: string]: boolean }>({});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
    if (isLoggedIn && accessToken) {
      checkAllRegistrations();
    }
  }, [isLoggedIn, accessToken]);

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
    } finally {
      setLoading(false);
    }
  };

  const checkAllRegistrations = async () => {
    if (!accessToken) return;

    const regStatus: { [key: string]: boolean } = {};
    
    for (const event of events) {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/events/${event.id}/check-registration`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        const data = await response.json();
        regStatus[event.id] = data.isRegistered || false;
      } catch (error) {
        console.error(`Error checking registration for event ${event.id}:`, error);
      }
    }
    
    setRegistrations(regStatus);
  };

  const handleRegisterClick = (event: Event) => {
    if (!isLoggedIn) {
      toast.error("Please log in to register for events");
      return;
    }

    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleConfirmRegistration = async () => {
    if (!selectedEvent || !accessToken) return;

    setRegistering(selectedEvent.id);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/events/${selectedEvent.id}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Successfully registered for the event!");
        setRegistrations({ ...registrations, [selectedEvent.id]: true });
        setDialogOpen(false);
      } else {
        toast.error(data.error || "Failed to register for event");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Failed to register for event");
    } finally {
      setRegistering(null);
    }
  };

  // Separate events into upcoming and past
  const now = new Date();
  const upcomingEvents = events.filter(e => {
    const eventDateTime = new Date(`${e.date}T${e.time}`);
    return eventDateTime >= now;
  });
  const pastEvents = events.filter(e => {
    const eventDateTime = new Date(`${e.date}T${e.time}`);
    return eventDateTime < now;
  });

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
            <span className="font-mono">UPCOMING_EVENTS</span>
            <span className="opacity-50">{'/>'}</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-4">Events & Workshops</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join our exciting events, workshops, and networking sessions
          </p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-12">
          <h3 className="text-2xl text-white mb-6 flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            Upcoming Events
          </h3>
          {upcomingEvents.length === 0 ? (
            <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
              <CardContent className="py-12 text-center">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No upcoming events at the moment. Check back soon!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => (
                <Card
                  key={event.id}
                  className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-500/50 transition-all group overflow-hidden"
                >
                  {event.image && (
                    <div className="relative h-48 overflow-hidden">
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
                      {registrations[event.id] && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-cyan-500/90 text-black border-0 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Registered
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white group-hover:text-cyan-400 transition-colors">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                      <span>{event.location}</span>
                    </div>
                    
                    {registrations[event.id] ? (
                      <Button 
                        className="w-full bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 mt-4"
                        disabled
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Already Registered
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleRegisterClick(event)}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-black mt-4"
                      >
                        Register Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div>
            <h3 className="text-2xl text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              Past Events
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <Card
                  key={event.id}
                  className="bg-gray-900/30 backdrop-blur-sm border-gray-700/30 hover:border-gray-600/50 transition-all group overflow-hidden opacity-75"
                >
                  {event.image && (
                    <div className="relative h-40 overflow-hidden">
                      <ImageWithFallback
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gray-600/90 text-white border-0">
                          Past
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{event.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Registration Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-cyan-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Event Registration</DialogTitle>
            <DialogDescription className="text-gray-400">
              You are about to register for this event
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                <h4 className="text-white">{selectedEvent.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmRegistration}
                  disabled={!!registering}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
                >
                  {registering ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Confirm Registration"
                  )}
                </Button>
                <Button
                  onClick={() => setDialogOpen(false)}
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}