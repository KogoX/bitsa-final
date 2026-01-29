import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Mail, MessageSquare, User, Send, MapPin, Phone, Globe } from "lucide-react";
import { toast } from "sonner";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Location",
      content: "Library Building, Bitsa Club Room\nUniversity Campus"
    },
    {
      icon: Mail,
      title: "Email",
      content: "bitsaclub@ueab.ac.ke"
    },
    {
      icon: Phone,
      title: "Phone",
      content: "0708 898 899/0725 486 687"
    },
    {
      icon: Globe,
      title: "Social Media",
      content: "LinkedIn: BITSA CLUB"
    }
  ];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="mb-4 flex items-center justify-center gap-2 text-cyan-400 text-sm">
            <span className="opacity-50">{'<'}</span>
            <span className="font-mono">GET_IN_TOUCH</span>
            <span className="opacity-50">{'/>'}</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-4">Contact Us</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have questions? Want to join? We'd love to hear from you!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">Send us a Message</CardTitle>
              <CardDescription className="text-gray-400">
                Fill out the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-10 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="yourname@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="subject"
                      type="text"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="pl-10 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-300">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="min-h-[150px] bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500 resize-none"
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-black">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6 mt-8 md:mt-0">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20 ">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
                <CardDescription className="text-gray-400">
                  Reach out to us through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg border border-cyan-500/10">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-white mb-1">{info.title}</h4>
                        <p className="text-gray-400 text-sm whitespace-pre-line">{info.content}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-white">Office Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-gray-300">
                <div className="flex justify-between py-2 border-b border-cyan-500/20">
                  <span>Monday - Thursday</span>
                  <span className="text-cyan-400">3:00 PM - 6:00 PM</span>
                </div>
                <div className="flex justify-between py-2 border-b border-cyan-500/20">
                  <span>Friday</span>
                  <span className="text-cyan-400">2:00 PM - 5:00 PM</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Weekend</span>
                  <span className="text-gray-500">Closed</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <Card className="mt-8 bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              Find Us at Baraton University
            </CardTitle>
            <CardDescription className="text-gray-400">
              Visit us at the Library Building, Bitsa Club Room on the University of Eastern Africa, Baraton campus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[400px] rounded-lg overflow-hidden border border-cyan-500/20">
              <iframe
                src={`https://www.google.com/maps?q=0.257821,35.086557&hl=en&z=15&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Baraton University Location"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm">
                <span className="text-cyan-400 font-semibold">Address:</span> P.O. Box 2500, 30100 Eldoret, Uasin Gishu County, Kenya
              </p>
              <p className="text-gray-400 text-sm mt-1">
                <span className="text-cyan-400 font-semibold">Coordinates:</span> 0.257821°N, 35.086557°E
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
