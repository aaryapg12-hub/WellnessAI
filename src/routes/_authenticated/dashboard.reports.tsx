import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Card, PageHeader } from "@/components/dashboard/ui";
import { AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/reports")({
  head: () => ({ meta: [{ title: "Reports — Aura" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { user } = useAuthUser();
  const { data: logs } = useQuery({
    queryKey: ["daily_logs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("daily_logs").select("*").eq("user_id", user!.id).order("log_date", { ascending: false }).limit(60);
      return data ?? [];
    },
  });

  const chart = (logs ?? []).slice(0, 30).reverse().map((l) => ({
    date: new Date(l.log_date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    weight: l.weight_kg, water: l.water_ml, sleep: l.sleep_hours, mood: l.mood_score, steps: l.steps,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Weekly and monthly progress at a glance." action={
        <button onClick={() => toast.info("PDF export coming soon")} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
          <Download className="h-4 w-4" /> Download PDF
        </button>
      } />

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Weight" data={chart} dataKey="weight" color="var(--chart-5)" type="line" />
        <ChartCard title="Water (ml)" data={chart} dataKey="water" color="var(--primary)" type="area" />
        <ChartCard title="Sleep (h)" data={chart} dataKey="sleep" color="var(--accent)" type="bar" />
        <ChartCard title="Mood (1-10)" data={chart} dataKey="mood" color="var(--chart-4)" type="line" />
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Steps (last 30 days)</h3>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Bar dataKey="steps" fill="var(--accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function ChartCard({ title, data, dataKey, color, type }: { title: string; data: Array<Record<string, unknown>>; dataKey: string; color: string; type: "line" | "area" | "bar" }) {
  return (
    <Card className="p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="h-52">
        <ResponsiveContainer>
          {type === "area" ? (
            <AreaChart data={data}>
              <defs><linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.4} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Area type="monotone" dataKey={dataKey} stroke={color} fill={`url(#g-${dataKey})`} strokeWidth={2} />
            </AreaChart>
          ) : type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
