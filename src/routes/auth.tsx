import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Wordmark } from "@/components/Logo";
import { useAuthUser } from "@/hooks/useAuthUser";

const authSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(128),
  full_name: z.string().trim().min(2, "Name too short").max(100).optional(),
});

type SearchParams = { mode?: "signup" | "signin" | "forgot" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    mode: s.mode === "signup" || s.mode === "forgot" ? s.mode : "signin",
  }),
  head: () => ({ meta: [{ title: "Sign in — WellAI" }, { name: "description", content: "Sign in to WellAI, your AI personal wellness coach." }] }),
  component: AuthPage,
});

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading } = useAuthUser();

  // Auto-redirect already authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const parsed = z.string().email().safeParse(email);
        if (!parsed.success) { toast.error("Enter a valid email"); return; }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset email sent");
        setMode("signin");
        return;
      }

      const parsed = authSchema.safeParse({
        email, password,
        ...(mode === "signup" ? { full_name: name } : {}),
      });
      if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/auth", data: { full_name: name } },
        });
        if (error) throw error;
        
        if (data.session) {
          toast.success("Account created and signed in!");
          navigate({ to: "/dashboard" });
        } else {
          toast.info("Account created! Please check your email for a verification link.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!remember) {
          // Best-effort: rely on default localStorage; advanced "remember me" handled at session level
        }
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const isInLovableFrame = (() => {
        try {
          return window.self !== window.top && document.referrer.includes("lovable");
        } catch {
          return true;
        }
      })();

      // Use direct Supabase OAuth if running locally or outside Lovable preview frame
      if (isLocalhost || !isInLovableFrame) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin + "/auth",
          },
        });
        if (error) throw error;
        return;
      }

      // Default Lovable OAuth broker
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
      if (result.error) {
        console.warn("Lovable OAuth broker failed, falling back to native Supabase OAuth:", result.error);
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin + "/auth",
          },
        });
        if (error) throw error;
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error("Google sign-in error:", err);
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aurora flex items-center justify-center p-4">
      <div className="absolute top-6 left-6"><Link to="/"><Wordmark /></Link></div>

      <motion.div animate={{ opacity: [0,1], y: [12,0] }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="glass rounded-3xl shadow-elegant p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
              <h1 className="font-display text-3xl font-bold">
                {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset password" : "Welcome back"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {mode === "signup" ? "Begin your wellness journey." : mode === "forgot" ? "We'll email you a reset link." : "Sign in to continue."}
              </p>
            </motion.div>
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <Field icon={UserIcon} type="text" placeholder="Full name" value={name} onChange={setName} required />
            )}
            <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={setEmail} required />
            {mode !== "forgot" && (
              <Field icon={Lock} type="password" placeholder="Password (min 8 chars)" value={password} onChange={setPassword} required />
            )}

            {mode === "signin" && (
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-muted-foreground cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-border accent-primary" />
                  Remember me
                </label>
                <button type="button" onClick={() => setMode("forgot")} className="text-primary font-medium hover:underline">Forgot password?</button>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-6 py-3 font-semibold shadow-soft hover:shadow-glow transition disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
                {mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </>}
            </button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
              </div>
              <button onClick={handleGoogle} disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 font-medium hover:bg-muted transition disabled:opacity-60">
                <GoogleIcon /> Continue with Google
              </button>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? <>Already have an account? <button onClick={() => setMode("signin")} className="text-primary font-semibold hover:underline">Sign in</button></>
              : mode === "forgot" ? <button onClick={() => setMode("signin")} className="text-primary font-semibold hover:underline">Back to sign in</button>
              : <>New to WellAI? <button onClick={() => setMode("signup")} className="text-primary font-semibold hover:underline">Create account</button></>}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange, required }: {
  icon: React.ComponentType<{ className?: string }>; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input type={type} placeholder={placeholder} value={value} required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-card pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16.1 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C40.9 36.2 44 30.6 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
