import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { User, Mail, Code2, BookOpen, Calendar, Github, Linkedin, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface ProfileData {
  name: string;
  email: string;
  studentId: string;
  bio: string;
  major: string;
  year: string;
  interests: string[];
  github: string;
  linkedin: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProfileProps {
  accessToken: string;
}

export function Profile({ accessToken }: ProfileProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    major: "",
    year: "",
    interests: "",
    github: "",
    linkedin: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [accessToken]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (response.ok && data.profile) {
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || "",
          bio: data.profile.bio || "",
          major: data.profile.major || "",
          year: data.profile.year || "",
          interests: data.profile.interests?.join(", ") || "",
          github: data.profile.github || "",
          linkedin: data.profile.linkedin || "",
        });
      } else {
        console.error("Failed to fetch profile:", data.error);
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: formData.name,
            bio: formData.bio,
            major: formData.major,
            year: formData.year,
            interests: formData.interests.split(",").map(i => i.trim()).filter(i => i),
            github: formData.github,
            linkedin: formData.linkedin,
          }),
        }
      );

      const data = await response.json();
      
      if (response.ok && data.profile) {
        setProfile(data.profile);
        setEditMode(false);
        toast.success("Profile updated successfully!");
      } else {
        console.error("Failed to update profile:", data.error);
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        major: profile.major || "",
        year: profile.year || "",
        interests: profile.interests?.join(", ") || "",
        github: profile.github || "",
        linkedin: profile.linkedin || "",
      });
    }
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Profile Not Found</CardTitle>
            <CardDescription className="text-gray-400">
              Unable to load your profile
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const memberSince = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "Recently";

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="mb-4 flex items-center justify-center gap-2 text-cyan-400 text-sm">
            <span className="opacity-50">{'<'}</span>
            <span className="font-mono">USER_PROFILE</span>
            <span className="opacity-50">{'/>'}</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-4">My Profile</h2>
          <p className="text-gray-400">Manage your club membership information</p>
        </div>

        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border-cyan-500/30">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-cyan-400/50">
                  <AvatarFallback className="bg-cyan-500 text-black text-2xl">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl text-white mb-2">{profile.name}</h3>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                    <Badge className="bg-cyan-500/90 text-black border-0">
                      {profile.studentId}
                    </Badge>
                    {profile.major && (
                      <Badge className="bg-purple-500/90 text-white border-0">
                        {profile.major}
                      </Badge>
                    )}
                    {profile.year && (
                      <Badge className="bg-gray-700 text-white border-0">
                        {profile.year}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">Member since {memberSince}</p>
                </div>
                <Button
                  onClick={() => setEditMode(!editMode)}
                  className={editMode ? "bg-gray-600 hover:bg-gray-700" : "bg-cyan-500 hover:bg-cyan-600"}
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details Card */}
          <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-gray-400">
                {editMode ? "Update your profile details" : "Your membership information"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    Full Name
                  </Label>
                  {editMode ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-gray-800/50 border-cyan-500/30 text-white"
                    />
                  ) : (
                    <p className="text-white py-2">{profile.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    Email
                  </Label>
                  <p className="text-white py-2">{profile.email}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    Student ID
                  </Label>
                  <p className="text-white py-2">{profile.studentId}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    Year
                  </Label>
                  {editMode ? (
                    <Input
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g., Sophomore, Junior"
                      className="bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                    />
                  ) : (
                    <p className="text-white py-2">{profile.year || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Major
                  </Label>
                  {editMode ? (
                    <Input
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      placeholder="e.g., Computer Science"
                      className="bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                    />
                  ) : (
                    <p className="text-white py-2">{profile.major || "Not specified"}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-gray-300">Bio</Label>
                {editMode ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px] bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500 resize-none"
                  />
                ) : (
                  <p className="text-white py-2">{profile.bio || "No bio yet"}</p>
                )}
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <Label className="text-gray-300">Interests</Label>
                {editMode ? (
                  <Input
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    placeholder="e.g., AI/ML, Web Dev, Cybersecurity (comma separated)"
                    className="bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2 py-2">
                    {profile.interests && profile.interests.length > 0 ? (
                      profile.interests.map((interest, index) => (
                        <Badge key={index} className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-400">No interests specified</p>
                    )}
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Github className="w-4 h-4 text-cyan-400" />
                    GitHub Username
                  </Label>
                  {editMode ? (
                    <Input
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="username"
                      className="bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                    />
                  ) : (
                    <p className="text-white py-2">
                      {profile.github ? (
                        <a 
                          href={`https://github.com/${profile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          @{profile.github}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-cyan-400" />
                    LinkedIn Username
                  </Label>
                  {editMode ? (
                    <Input
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="username"
                      className="bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                    />
                  ) : (
                    <p className="text-white py-2">
                      {profile.linkedin ? (
                        <a 
                          href={`https://linkedin.com/in/${profile.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          @{profile.linkedin}
                        </a>
                      ) : (
                        "Not specified"
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Save Button */}
              {editMode && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    disabled={saving}
                    variant="outline"
                    className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
