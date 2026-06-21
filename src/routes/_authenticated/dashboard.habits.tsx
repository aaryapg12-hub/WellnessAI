import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Check, Flame, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Card, PageHeader } from "@/components/dashboard/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/habits")({
  head: () => ({ meta: [{ title: "Habit Tracker — Aura" }] }),
  component: HabitsPage,
});

const SUGGESTIONS = [
  { icon: "💧", name: "Drink water", unit: "ml", target: 2500 },
  { icon: "💤", name: "Sleep 8h", unit: "h", target: 8 },
  { icon: "🏃", name: "Exercise", unit: "min", target: 30 },
  { icon: "🧘", name: "Meditation", unit: "min", target: 10 },
  { icon: "📚", name: "Reading", unit: "min", target: 20 },
  { icon: "🍎", name: "Fruit servings", unit: "servings", target: 2 },
  { icon: "🥦", name: "Vegetables", unit: "servings", target: 3 },
  { icon: "👟", name: "Walk", unit: "steps", target: 8000 },
];

function HabitsPage() {
  const { user } = useAuthUser();
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [newHabit, setNewHabit] = useState("");

  const { data: habits } = useQuery({
    queryKey: ["habits", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("habits").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
  });

  const { data: logs } = useQuery({
    queryKey: ["habit_logs", user?.id, today],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("habit_logs").select("*").eq("user_id", user!.id).eq("log_date", today);
      return data ?? [];
    },
  });

  const addHabit = useMutation({
    mutationFn: async (h: { name: string; icon?: string; unit?: string; target?: number }) => {
      const { error } = await supabase.from("habits").insert({ user_id: user!.id, name: h.name, icon: h.icon, unit: h.unit, target_value: h.target });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["habits"] }); setNewHabit(""); toast.success("Habit added"); },
  });

  const toggle = useMutation({
    mutationFn: async (habitId: string) => {
      const existing = logs?.find((l) => l.habit_id === habitId);
      if (existing) {
        await supabase.from("habit_logs").delete().eq("id", existing.id);
      } else {
        await supabase.from("habit_logs").insert({ habit_id: habitId, user_id: user!.id, log_date: today, completed: true });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habit_logs"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { await supabase.from("habits").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });

  const completed = logs?.length ?? 0;
  const total = habits?.length ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Habit Tracker" description="Build streaks. Earn badges. Grow." />

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5"><div className="text-xs uppercase text-muted-foreground">Today</div><div className="font-display text-3xl font-bold mt-1">{completed} / {total}</div><div className="text-xs text-muted-foreground mt-1">habits completed</div></Card>
        <Card className="p-5 bg-gradient-mint"><div className="text-xs uppercase text-accent-foreground/80">Best streak</div><div className="font-display text-3xl font-bold text-accent-foreground mt-1 flex items-center gap-2"><Flame className="h-6 w-6" />14d</div></Card>
        <Card className="p-5"><div className="text-xs uppercase text-muted-foreground">Badges</div><div className="font-display text-3xl font-bold mt-1">🏅 6</div></Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold mb-4">Your habits</h3>
        {total === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Start with a suggested habit:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s.name} onClick={() => addHabit.mutate({ name: s.name, icon: s.icon, unit: s.unit, target: s.target })} className="rounded-full bg-secondary px-4 py-2 text-sm font-medium hover:bg-primary/10 transition">
                  {s.icon} {s.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {habits!.map((h) => {
              const done = logs?.some((l) => l.habit_id === h.id);
              return (
                <motion.div key={h.id} layout className={`flex items-center gap-3 rounded-2xl border border-border p-3 transition ${done ? "bg-accent/10" : "bg-card"}`}>
                  <button onClick={() => toggle.mutate(h.id)} className={`grid place-items-center h-10 w-10 rounded-full transition ${done ? "bg-gradient-wellness text-primary-foreground" : "bg-secondary"}`}>
                    {done ? <Check className="h-5 w-5" /> : <span className="text-lg">{h.icon ?? "✓"}</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{h.name}</div>
                    {h.target_value && <div className="text-xs text-muted-foreground">Target: {h.target_value} {h.unit}</div>}
                  </div>
                  <button onClick={() => remove.mutate(h.id)} className="p-2 text-muted-foreground hover:text-destructive transition"><Trash2 className="h-4 w-4" /></button>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <input value={newHabit} onChange={(e) => setNewHabit(e.target.value)} placeholder="Add a custom habit…" className="flex-1 rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={() => newHabit.trim() && addHabit.mutate({ name: newHabit.trim(), icon: "✨" })} className="inline-flex items-center gap-1 rounded-xl bg-gradient-primary text-primary-foreground px-4 py-2.5 font-medium"><Plus className="h-4 w-4" /> Add</button>
        </div>
      </Card>
    </div>
  );
}
