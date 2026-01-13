import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Code2, Mail, Lock, User, Loader2, KeyRound } from "lucide-react";
import { supabase } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner";

interface AuthProps {
  onLogin: (username: string, accessToken: string, userId: string) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerStudentId, setRegisterStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Password reset
  const [resetEmail, setResetEmail] = useState("");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Google Sign-In
  const [googleLoading, setGoogleLoading] = useState(false);

  // Resend confirmation email
  const [resendEmail, setResendEmail] = useState("");
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        }
      });

      if (error) {
        console.error("Google sign-in error:", error);
        toast.error(error.message || "Failed to sign in with Google");
        setGoogleLoading(false);
      }
      // User will be redirected to Google, loading state will persist
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google");
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        console.error("Sign in error:", error);
        
        // Check if error is due to unconfirmed email
        if (error.message.includes("Email not confirmed") || error.message.includes("email_not_confirmed")) {
          toast.error("Please confirm your email address before logging in. Check your inbox for the confirmation link.");
        } else {
          toast.error(error.message || "Failed to sign in");
        }
        return;
      }

      if (data.session && data.user) {
        // Fetch profile to get name
        let username = loginEmail.split('@')[0];
        
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/profile`,
            {
              headers: {
                Authorization: `Bearer ${data.session.access_token}`,
              },
            }
          );

          if (response.ok) {
            const profileData = await response.json();
            username = profileData.profile?.name || username;
          }
        } catch (error) {
          console.log("Could not fetch profile, using email as username");
          // Continue with email-based username
        }
        
        toast.success("Welcome back!");
        onLogin(username, data.session.access_token, data.user.id);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail || !registerPassword || !registerStudentId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-430e8b93/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name: registerName,
            email: registerEmail,
            password: registerPassword,
            studentId: registerStudentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Signup error:", data.error);
        toast.error(data.error || "Failed to create account");
        return;
      }

      // Account created successfully - inform user to check email
      toast.success("Account created! Please check your email to confirm your address before logging in.");
      
      // Clear registration form
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterStudentId("");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        console.error("Password reset error:", error);
        toast.error(error.message || "Failed to send reset email");
        return;
      }

      toast.success("Password reset instructions sent! Please check your email inbox and spam folder.");
      setResetDialogOpen(false);
      setResetEmail("");
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to send reset email");
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendConfirmationEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: resendEmail });

      if (error) {
        console.error("Resend confirmation email error:", error);
        toast.error(error.message || "Failed to resend confirmation email");
        return;
      }

      toast.success("Confirmation email sent! Please check your email inbox and spam folder.");
      setResendDialogOpen(false);
      setResendEmail("");
    } catch (error) {
      console.error("Resend confirmation email error:", error);
      toast.error("Failed to resend confirmation email");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="relative">
              <Code2 className="w-12 h-12 text-cyan-400" />
              <div className="absolute inset-0 blur-md bg-cyan-400/50"></div>
            </div>
          </div>
          <h1 className="text-3xl text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Access your CS Club account</p>
        </div>

        <Card className="bg-gray-900/50 backdrop-blur-sm border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white">Authentication</CardTitle>
            <CardDescription className="text-gray-400">
              Login to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="student@university.edu"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                  
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-700"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-900/50 px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  {/* Google Sign-In Button */}
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in with Google...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                  
                  {/* Forgot Password Dialog */}
                  <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="link"
                        className="w-full text-cyan-400 hover:text-cyan-300"
                      >
                        <KeyRound className="w-4 h-4 mr-2" />
                        Forgot Password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-cyan-500/20 text-white">
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Enter your email address and we'll send you a link to reset your password
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email" className="text-gray-300">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="student@university.edu"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="pl-10 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                              required
                            />
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={resetLoading} 
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
                        >
                          {resetLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Send Reset Link"
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Resend Confirmation Email Dialog */}
                  <Dialog open={resendDialogOpen} onOpenChange={setResendDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="link"
                        className="w-full text-purple-400 hover:text-purple-300"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Didn't receive confirmation email?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-cyan-500/20 text-white">
                      <DialogHeader>
                        <DialogTitle>Resend Confirmation Email</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Enter your email address and we'll send you a new confirmation link
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleResendConfirmationEmail} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="resend-email" className="text-gray-300">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              id="resend-email"
                              type="email"
                              placeholder="student@university.edu"
                              value={resendEmail}
                              onChange={(e) => setResendEmail(e.target.value)}
                              className="pl-10 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                              required
                            />
                          </div>
                        </div>
                        <Button 
                          type="submit" 
                          disabled={resendLoading} 
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
                        >
                          {resendLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Resend Confirmation Email"
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-gray-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="John Doe"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="pl-10 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-student-id" className="text-gray-300">Student ID</Label>
                    <div className="relative">
                      <Code2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-student-id"
                        type="text"
                        placeholder="CS123456"
                        value={registerStudentId}
                        onChange={(e) => setRegisterStudentId(e.target.value)}
                        className="pl-10 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="student@university.edu"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="pl-10 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">You'll need to confirm your email address</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-10 bg-gray-800/50 border-cyan-500/30 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-700"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-900/50 px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  {/* Google Sign-In Button */}
                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-100 text-gray-900 border-gray-300"
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in with Google...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}