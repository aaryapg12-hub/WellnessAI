import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Brain, Wind, Music, BookOpen, Quote, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Card, PageHeader, ProgressRing } from "@/components/dashboard/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/mental")({
  head: () => ({ meta: [{ title: "Mental Wellness — WellAI" }] }),
  component: MentalPage,
});

const MOODS = [
  { v: 10, e: "🤩", l: "Amazing" },
  { v: 8, e: "😊", l: "Good" },
  { v: 6, e: "🙂", l: "Okay" },
  { v: 4, e: "😕", l: "Low" },
  { v: 2, e: "😢", l: "Sad" },
];

const QUOTES = [
  "Small steps every day lead to big change.",
  "Breathe. You are exactly where you need to be.",
  "Your only competition is the person you were yesterday.",
  "Self-care is how you take your power back.",
];

function MentalPage() {
  const { user } = useAuthUser();
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [journalTitle, setJournalTitle] = useState("");
  const [journalText, setJournalText] = useState("");
  const [saving, setSaving] = useState(false);
  const [stress, setStress] = useState(5);
  const [breath, setBreath] = useState(false);

  const { data: journal } = useQuery({
    queryKey: ["journal", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("journal_entries").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5);
      return data ?? [];
    },
  });

  const setMood = async (score: number, label: string) => {
    if (!user) return;
    const { error } = await supabase.from("daily_logs").upsert(
      { user_id: user.id, log_date: today, mood_score: score, mood: label, stress_level: stress },
      { onConflict: "user_id,log_date" }
    );
    if (error) toast.error(error.message); else toast.success("Mood logged");
    qc.invalidateQueries({ queryKey: ["daily_logs"] });
  };

  const saveJournal = async () => {
    if (!user || !journalText.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("journal_entries").insert({ user_id: user.id, title: journalTitle || null, content: journalText, mood: null });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Journal saved"); setJournalTitle(""); setJournalText(""); qc.invalidateQueries({ queryKey: ["journal"] }); }
  };

  const score = 100 - stress * 5;

  return (
    <div className="space-y-6">
      <PageHeader title="Mental Wellness" description="Track your mood, journal, and find calm." />

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-6 bg-gradient-wellness text-primary-foreground">
          <h3 className="font-semibold mb-3">Mental Wellness Score</h3>
          <div className="grid place-items-center">
            <ProgressRing value={score} label={`${score}`} sub="today" />
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-semibold mb-3">How do you feel today?</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            {MOODS.map((m) => (
              <motion.button key={m.v} whileTap={{ scale: 0.9 }} onClick={() => setMood(m.v, m.l)}
                className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 hover:bg-primary/10 transition">
                <span className="text-2xl">{m.e}</span><span className="text-sm font-medium">{m.l}</span>
              </motion.button>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium">Stress level: <span className="text-primary">{stress}/10</span></label>
            <input type="range" min="1" max="10" value={stress} onChange={(e) => setStress(Number(e.target.value))} className="w-full mt-2 accent-primary" />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><Wind className="h-5 w-5 text-primary" /><h3 className="font-semibold">Breathing exercise</h3></div>
          <p className="text-sm text-muted-foreground mb-4">Box breathing: inhale 4 · hold 4 · exhale 4 · hold 4.</p>
          <div className="grid place-items-center py-4">
            <motion.div
              animate={breath ? { scale: [1, 1.5, 1.5, 1, 1], opacity: [0.7, 1, 1, 0.7, 0.7] } : {}}
              transition={{ duration: 16, repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
              className="h-32 w-32 rounded-full bg-gradient-wellness grid place-items-center text-primary-foreground font-semibold shadow-glow"
            >
              {breath ? "Breathe" : "Start"}
            </motion.div>
          </div>
          <button onClick={() => setBreath(!breath)} className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-2.5 font-medium hover:opacity-90">
            {breath ? "Stop" : "Start session"}
          </button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><BookOpen className="h-5 w-5 text-accent" /><h3 className="font-semibold">Journal</h3></div>
          <input value={journalTitle} onChange={(e) => setJournalTitle(e.target.value)} placeholder="Title (optional)" className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-ring" />
          <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="What's on your mind today?" rows={5} className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          <button onClick={saveJournal} disabled={saving || !journalText.trim()} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground py-2.5 font-medium disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save entry
          </button>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3"><Music className="h-5 w-5 text-primary" /><h3 className="font-semibold">Relaxing sounds</h3></div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {["🌧 Rain", "🌊 Ocean", "🔥 Fireplace", "🌲 Forest"].map((s) => (
              <button key={s} className="rounded-xl bg-secondary px-4 py-3 hover:bg-primary/10 transition text-left">{s}</button>
            ))}
          </div>
        </Card>
        <Card className="p-5 bg-gradient-mint">
          <div className="flex items-center gap-2 mb-3"><Quote className="h-5 w-5 text-accent-foreground" /><h3 className="font-semibold text-accent-foreground">Today's quote</h3></div>
          <p className="text-lg font-display text-accent-foreground leading-relaxed">"{QUOTES[new Date().getDate() % QUOTES.length]}"</p>
        </Card>
      </div>

      {journal && journal.length > 0 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Recent journal entries</h3>
          <div className="space-y-2">
            {journal.map((j) => (
              <div key={j.id} className="rounded-xl bg-secondary/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{j.title || "Untitled"}</div>
                  <div className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleDateString()}</div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{j.content}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
