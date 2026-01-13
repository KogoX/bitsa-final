import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { FileText, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { projectId } from "../utils/supabase/info";

interface SubmitArticleProps {
  accessToken: string;
}

export function SubmitArticle({ accessToken }: SubmitArticleProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    image: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.content) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/articles/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...form,
            tags: form.tags.split(",").map(t => t.trim()).filter(t => t)
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Article submitted successfully! It will be reviewed by admins.");
        setForm({
          title: "",
          excerpt: "",
          content: "",
          tags: "",
          image: ""
        });
      } else {
        toast.error(data.error || "Failed to submit article");
      }
    } catch (error) {
      console.error("Error submitting article:", error);
      toast.error("Failed to submit article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-4 flex items-center justify-center gap-2 text-cyan-400 text-sm">
            <FileText className="w-5 h-5" />
            <span className="font-mono">SUBMIT_ARTICLE</span>
          </div>
          <h2 className="text-4xl md:text-5xl text-white mb-4">Share Your Knowledge</h2>
          <p className="text-gray-400">Submit an article to be featured on our blog</p>
        </div>

        {/* Submission Form */}
        <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white">Article Submission</CardTitle>
            <CardDescription className="text-gray-400">
              Your article will be reviewed by admins before being published
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="bg-gray-800/50 border-cyan-500/30 text-white"
                  placeholder="Enter article title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Excerpt</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="bg-gray-800/50 border-cyan-500/30 text-white resize-none"
                  placeholder="Brief summary of your article"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Content *</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="bg-gray-800/50 border-cyan-500/30 text-white resize-none"
                  placeholder="Write your article content here..."
                  rows={10}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Tags (comma separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="bg-gray-800/50 border-cyan-500/30 text-white"
                  placeholder="e.g., AI, Tutorial, Web Development"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Cover Image URL</Label>
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="bg-gray-800/50 border-cyan-500/30 text-white"
                  placeholder="https://..."
                />
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <p className="text-sm text-cyan-400">
                  <strong>Note:</strong> Your article will be reviewed by our admin team before publication. 
                  You'll be notified once it's approved or if any changes are needed.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Article
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
