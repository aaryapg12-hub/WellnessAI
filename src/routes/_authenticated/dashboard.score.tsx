import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, TrendingUp, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useProfile } from "@/hooks/useProfile";
import { Card, PageHeader, ProgressRing } from "@/components/dashboard/ui";
import { computeWellnessScore } from "@/lib/wellness";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard/score")({
  head: () => ({ meta: [{ title: "Wellness Score — WellAI" }] }),
  component: ScorePage,
});

function ScorePage() {
  const { user } = useAuthUser();
  const { data: prof } = useProfile();
  const target = prof?.profile?.water_intake_target ?? 2500;

  const { data: logs } = useQuery({
    queryKey: ["daily_logs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("daily_logs").select("*").eq("user_id", user!.id).order("log_date", { ascending: false }).limit(60);
      return data ?? [];
    },
  });

  const today = logs?.[0];
  const score = computeWellnessScore({
    sleep_hours: today?.sleep_hours ?? null,
    water_ml: today?.water_ml ?? null,
    water_target: target,
    exercise_minutes: today?.exercise_minutes ?? null,
    mood_score: today?.mood_score ?? null,
    stress_level: today?.stress_level ?? null,
  });

  const trend = (logs ?? []).slice(0, 30).reverse().map((l) => ({
    date: new Date(l.log_date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    score: computeWellnessScore({
      sleep_hours: l.sleep_hours, water_ml: l.water_ml, water_target: target,
      exercise_minutes: l.exercise_minutes, mood_score: l.mood_score, stress_level: l.stress_level,
    }),
  }));

  const weekAvg = trend.slice(-7).reduce((a, b) => a + b.score, 0) / Math.max(1, trend.slice(-7).length);
  const prevWeekAvg = trend.slice(-14, -7).reduce((a, b) => a + b.score, 0) / Math.max(1, trend.slice(-14, -7).length);
  const delta = Math.round(weekAvg - prevWeekAvg);

  const suggestions = [
    score < 60 ? "Aim for 7+ hours of sleep tonight." : "Maintain your sleep window for the next 7 nights.",
    (today?.water_ml ?? 0) < target * 0.7 ? "Add 500ml of water before lunch." : "Hydration on track — keep it up.",
    (today?.exercise_minutes ?? 0) < 30 ? "Squeeze in a 15-min walk after dinner." : "Try a light stretch session tonight.",
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Wellness Score" description="One number that captures sleep, water, movement, mood and stress." />

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-6 bg-gradient-wellness text-primary-foreground lg:col-span-1">
          <div className="grid place-items-center">
            <ProgressRing value={score} size={200} stroke={14} label={`${score}`} sub="today" />
          </div>
          <div className="mt-4 text-center text-sm">
            7-day avg: <span className="font-bold">{Math.round(weekAvg)}</span>
            {delta !== 0 && <span className="ml-2">{delta > 0 ? "▲" : "▼"} {Math.abs(delta)}</span>}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">30-day trend</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4"><Lightbulb className="h-5 w-5 text-accent" /><h3 className="font-semibold">Improvement tips</h3></div>
        <ul className="space-y-2 text-sm">
          {suggestions.map((s, i) => <li key={i} className="flex gap-3 rounded-xl bg-secondary/40 p-3"><Activity className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {s}</li>)}
        </ul>
      </Card>
    </div>
  );
}
