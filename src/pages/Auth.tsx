import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceShow, setForceShow] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestEmail, setRequestEmail] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  // Timeout fallback - don't stay in loading forever
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Auth loading timeout - forcing display');
        setForceShow(true);
        toast({
          title: "Session issue detected",
          description: "Please try logging in again.",
          variant: "destructive",
        });
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loading, toast]);

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const email = requestEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setRequestSubmitting(true);
    try {
      const { error } = await supabase
        .from('access_requests')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already requested",
            description: "This email has already been submitted for access.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Request submitted",
          description: "Your access request has been sent to the admin.",
        });
        setRequestEmail("");
        setShowRequestForm(false);
      }
    } catch (error) {
      console.error("Request error:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRequestSubmitting(false);
    }
  };

  if (loading && !forceShow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-elevated">
        {showRequestForm ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRequestForm(false)}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Button>
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Request Access</h1>
              <p className="text-muted-foreground text-sm">
                Enter your Google email to request access. The admin will review your request.
              </p>
            </div>
            <form onSubmit={handleRequestAccess} className="space-y-4">
              <Input
                type="email"
                placeholder="your.email@gmail.com"
                value={requestEmail}
                onChange={(e) => setRequestEmail(e.target.value)}
                disabled={requestSubmitting}
              />
              <Button
                type="submit"
                disabled={requestSubmitting}
                className="w-full"
              >
                {requestSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome</h1>
              <p className="text-muted-foreground">
                Sign in to take exams and track your progress
              </p>
            </div>

            <Button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full h-12 text-base"
              variant="outline"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setShowRequestForm(true)}
                className="text-sm text-muted-foreground"
              >
                Don't have access? Request it here
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={() => navigate("/")} className="text-sm">
                Back to Home
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}