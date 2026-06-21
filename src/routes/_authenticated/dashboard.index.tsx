import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Droplets, Flame, Moon, Smile, Footprints, Dumbbell, Scale,
  Activity, Sparkles, Brain, UtensilsCrossed, ListChecks, Plus, TrendingUp,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useProfile } from "@/hooks/useProfile";
import { Card, StatCard, ProgressRing, ProgressBar, PageHeader } from "@/components/dashboard/ui";
import { computeWellnessScore } from "@/lib/wellness";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — Aura" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = useAuthUser();
  const { data: profileData } = useProfile();
  const qc = useQueryClient();

  const today = new Date().toISOString().slice(0, 10);

  const { data: logs } = useQuery({
    queryKey: ["daily_logs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("daily_logs").select("*")
        .eq("user_id", user!.id).order("log_date", { ascending: false }).limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  const todayLog = logs?.find((l) => l.log_date === today);
  const profile = profileData?.profile;

  const waterTarget = profile?.water_intake_target ?? 2500;
  const water = todayLog?.water_ml ?? 0;

  const score = computeWellnessScore({
    sleep_hours: todayLog?.sleep_hours ?? null,
    water_ml: todayLog?.water_ml ?? null,
    water_target: waterTarget,
    exercise_minutes: todayLog?.exercise_minutes ?? null,
    mood_score: todayLog?.mood_score ?? null,
    stress_level: todayLog?.stress_level ?? null,
  });

  const upsertLog = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { error } = await supabase.from("daily_logs").upsert(
        { user_id: user!.id, log_date: today, ...todayLog, ...patch },
        { onConflict: "user_id,log_date" }
      );
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["daily_logs"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const chartData = (logs ?? []).slice(0, 14).reverse().map((l) => ({
    date: new Date(l.log_date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    water: l.water_ml ?? 0,
    sleep: l.sleep_hours ?? 0,
    steps: l.steps ?? 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hi, ${(profile?.full_name ?? user?.email?.split("@")[0] ?? "there").split(" ")[0]} 👋`}
        description="Here's your wellness snapshot for today."
      />

      {/* Hero score + quick actions */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-1 p-6 bg-gradient-wellness text-primary-foreground relative overflow-hidden">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="relative">
            <div className="text-xs uppercase tracking-wider text-white/80">Today's Wellness Score</div>
            <div className="mt-4 flex items-center justify-center">
              <ProgressRing value={score} size={160} label={`${score}`} sub="out of 100" />
            </div>
            <p className="mt-4 text-center text-sm text-white/90">{score >= 75 ? "Crushing it 🚀" : score >= 50 ? "Steady progress 💪" : "Let's get moving 🌱"}</p>
          </div>
        </Card>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <StatCard label="Water" value={`${water} ml`} icon={Droplets} color="primary" delta={`Goal ${waterTarget} ml`} />
          <StatCard label="Sleep" value={`${todayLog?.sleep_hours ?? 0} h`} icon={Moon} color="accent" />
          <StatCard label="Calories" value={`${todayLog?.calories ?? 0}`} icon={Flame} color="warning" />
          <StatCard label="Steps" value={`${todayLog?.steps ?? 0}`} icon={Footprints} color="success" />
        </div>
      </div>

      {/* Quick log row */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Quick log</h3>
          <span className="text-xs text-muted-foreground">Tap to update today</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickButton icon={Droplets} label="+250 ml water" onClick={() => upsertLog.mutate({ water_ml: water + 250 })} />
          <QuickButton icon={Footprints} label="+1000 steps" onClick={() => upsertLog.mutate({ steps: (todayLog?.steps ?? 0) + 1000 })} />
          <QuickButton icon={Dumbbell} label="+15 min exercise" onClick={() => upsertLog.mutate({ exercise_minutes: (todayLog?.exercise_minutes ?? 0) + 15 })} />
          <QuickButton icon={Moon} label="Log 8h sleep" onClick={() => upsertLog.mutate({ sleep_hours: 8 })} />
          <QuickButton icon={Smile} label="Mood: Great" onClick={() => upsertLog.mutate({ mood: "great", mood_score: 9 })} />
        </div>
      </Card>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-semibold mb-1">Water intake (14d)</h3>
          <p className="text-xs text-muted-foreground mb-3">ml per day</p>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="water" stroke="var(--primary)" strokeWidth={2} fill="url(#waterGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-1">Sleep & steps</h3>
          <p className="text-xs text-muted-foreground mb-3">Last 14 days</p>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="sleep" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="steps" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Daily goals + AI insight */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Daily goals</h3>
          <div className="space-y-4">
            <Goal label="Water" value={water} max={waterTarget} unit="ml" />
            <Goal label="Steps" value={todayLog?.steps ?? 0} max={10000} unit="steps" />
            <Goal label="Exercise" value={todayLog?.exercise_minutes ?? 0} max={30} unit="min" />
            <Goal label="Sleep" value={todayLog?.sleep_hours ?? 0} max={8} unit="h" />
          </div>
        </Card>

        <Card className="p-5 bg-gradient-mint">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
            <h3 className="font-semibold text-accent-foreground">AI Insight</h3>
          </div>
          <p className="text-sm text-accent-foreground leading-relaxed">
            {score >= 75
              ? "Excellent rhythm! Keep your sleep consistent and try adding a 5-min meditation tonight."
              : "Try logging water every 2 hours and aim for a 20-min walk. Small steps compound into big change."}
          </p>
          <Link to="/dashboard/chat" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-foreground hover:underline">
            Ask Aura <TrendingUp className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </div>

      {/* Feature shortcuts */}
      <div>
        <h3 className="font-semibold mb-3">Explore</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ShortcutCard to="/dashboard/skin" icon={Sparkles} title="Skin Analysis" tint="primary" />
          <ShortcutCard to="/dashboard/diet" icon={UtensilsCrossed} title="Diet Planner" tint="accent" />
          <ShortcutCard to="/dashboard/fitness" icon={Dumbbell} title="Fitness Coach" tint="primary" />
          <ShortcutCard to="/dashboard/mental" icon={Brain} title="Mental Wellness" tint="accent" />
        </div>
      </div>
    </div>
  );
}

function QuickButton({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.95 }} onClick={onClick} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted shadow-card transition">
      <Icon className="h-4 w-4 text-primary" /> {label}
    </motion.button>
  );
}

function Goal({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value} / {max} {unit} · {pct}%</span>
      </div>
      <ProgressBar value={value} max={max} color={pct >= 100 ? "accent" : "primary"} />
    </div>
  );
}

function ShortcutCard({ to, icon: Icon, title, tint }: { to: string; icon: React.ComponentType<{ className?: string }>; title: string; tint: "primary" | "accent" }) {
  return (
    <Link to={to} className="group rounded-2xl border border-border bg-card p-5 shadow-card hover-lift block">
      <div className={`grid h-10 w-10 place-items-center rounded-xl mb-3 ${tint === "primary" ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">Open →</div>
    </Link>
  );
}
