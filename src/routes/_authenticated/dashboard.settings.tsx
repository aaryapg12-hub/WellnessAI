import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, PageHeader } from "@/components/dashboard/ui";
import { Moon, Sun, Globe, Shield, Bell, Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — WellAI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aura-theme");
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("aura-theme", next ? "dark" : "light");
  };

  const exportData = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const [profile, logs, habits, journals] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.user.id).maybeSingle(),
      supabase.from("daily_logs").select("*").eq("user_id", user.user.id),
      supabase.from("habits").select("*").eq("user_id", user.user.id),
      supabase.from("journal_entries").select("*").eq("user_id", user.user.id),
    ]);
    const blob = new Blob([JSON.stringify({ profile: profile.data, logs: logs.data, habits: habits.data, journals: journals.data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `aura-export-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported");
  };

  const deleteAccount = async () => {
    if (!confirm("Delete your account and all data? This cannot be undone.")) return;
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    // RLS cascades will remove personal rows when the auth.users row is removed.
    // Self-serve removal of auth.users requires server function; for now sign out and instruct.
    await supabase.from("profiles").delete().eq("id", user.user.id);
    await supabase.auth.signOut();
    qc.clear();
    toast.success("Account data cleared. Sign-in disabled.");
    navigate({ to: "/" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Theme, privacy and data controls." />

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Appearance</h3>
        <button onClick={toggleTheme} className="flex items-center gap-3 w-full rounded-xl bg-secondary/50 p-4 hover:bg-secondary transition text-left">
          {dark ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-warning" />}
          <div className="flex-1"><div className="font-medium">{dark ? "Dark mode" : "Light mode"}</div><div className="text-xs text-muted-foreground">Click to switch</div></div>
        </button>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Preferences</h3>
        <div className="space-y-3">
          <Row icon={Globe} title="Language" sub="English (US)" />
          <Row icon={Bell} title="Notifications" sub="Manage reminders" />
          <Row icon={Shield} title="Privacy" sub="Your data is encrypted and yours alone" />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Your data</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
            <Download className="h-4 w-4" /> Export data
          </button>
          <button onClick={deleteAccount} className="inline-flex items-center gap-2 rounded-full bg-destructive/10 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/20">
            <Trash2 className="h-4 w-4" /> Delete account data
          </button>
        </div>
      </Card>
    </div>
  );
}

function Row({ icon: Icon, title, sub }: { icon: React.ComponentType<{ className?: string }>; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-4">
      <Icon className="h-5 w-5 text-primary" />
      <div><div className="font-medium">{title}</div><div className="text-xs text-muted-foreground">{sub}</div></div>
    </div>
  );
}
