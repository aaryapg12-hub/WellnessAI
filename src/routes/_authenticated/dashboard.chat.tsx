import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Card, PageHeader } from "@/components/dashboard/ui";

export const Route = createFileRoute("/_authenticated/dashboard/chat")({
  head: () => ({ meta: [{ title: "AI Wellness Chat — WellAI" }] }),
  component: ChatPage,
});

const PROMPTS = [
  "Suggest a healthy breakfast",
  "How can I improve my sleep?",
  "Workout for today",
  "Help with stress",
  "Skincare advice",
  "Diet advice",
];

const MOCK_REPLIES: Record<string, string> = {
  default: "Thanks for sharing! Based on general wellness guidance, I'd suggest staying hydrated, getting 7-8 hours of sleep, and a 20-minute daily walk. Would you like a personalized plan?",
  breakfast: "Try this: overnight oats with chia seeds, berries, and a spoon of almond butter. ~400 kcal, 15g protein, 9g fiber. Pairs well with green tea.",
  sleep: "For better sleep: (1) no screens 60 min before bed, (2) keep room cool (18-20°C), (3) try a 4-7-8 breathing exercise, (4) consistent wake time even on weekends.",
  workout: "Today try: 5-min warm-up • 3x12 squats • 3x10 push-ups • 3x10 rows (band) • 60s plank x3 • 5-min stretch. Total ~25 min. Hydrate!",
  stress: "When stress hits: 1) box-breathe 4-4-4-4 for 2 minutes, 2) name 5 things you can see, 3) take a 10-min walk outdoors. Journaling tonight helps too.",
  skincare: "Basics that work: gentle cleanser AM/PM, vitamin C serum morning, broad-spectrum SPF 30+ daily, retinol 2-3 nights/week, ceramide moisturizer. Stay consistent for 6+ weeks.",
  diet: "Aim for: half your plate veggies, palm-sized protein, fist of complex carbs, thumb of healthy fats. Drink water before meals. Limit ultra-processed foods.",
};

function pickReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("breakfast")) return MOCK_REPLIES.breakfast;
  if (t.includes("sleep")) return MOCK_REPLIES.sleep;
  if (t.includes("workout") || t.includes("exercise")) return MOCK_REPLIES.workout;
  if (t.includes("stress") || t.includes("anxious")) return MOCK_REPLIES.stress;
  if (t.includes("skin")) return MOCK_REPLIES.skincare;
  if (t.includes("diet") || t.includes("eat")) return MOCK_REPLIES.diet;
  return MOCK_REPLIES.default;
}

function ChatPage() {
  const { user } = useAuthUser();
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["chat", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("chat_messages").select("*").eq("user_id", user!.id).order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const send = async (text: string) => {
    if (!user || !text.trim()) return;
    setInput("");
    await supabase.from("chat_messages").insert({ user_id: user.id, role: "user", content: text });
    qc.invalidateQueries({ queryKey: ["chat"] });
    setThinking(true);
    await new Promise((r) => setTimeout(r, 900));
    await supabase.from("chat_messages").insert({ user_id: user.id, role: "assistant", content: pickReply(text) });
    setThinking(false);
    qc.invalidateQueries({ queryKey: ["chat"] });
  };

  return (
    <div className="space-y-4 h-[calc(100vh-9rem)] flex flex-col">
      <PageHeader title="WellAI Chat" description="Ask anything wellness-related. WellAI listens." />

      <div className="flex items-start gap-2 rounded-2xl border border-warning/30 bg-warning/10 p-3 text-xs">
        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
        <p>WellAI provides general wellness guidance only. It does not replace professional medical advice.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {(messages?.length ?? 0) === 0 && !thinking && (
            <div className="grid place-items-center py-10 text-center">
              <div className="h-14 w-14 rounded-2xl bg-gradient-wellness grid place-items-center text-primary-foreground shadow-glow"><Bot className="h-7 w-7" /></div>
              <h3 className="mt-4 font-semibold text-lg">How can I help you today?</h3>
              <p className="text-sm text-muted-foreground mt-1">Try one of these quick prompts:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-xl">
                {PROMPTS.map((p) => (
                  <button key={p} onClick={() => send(p)} className="rounded-full bg-secondary px-4 py-2 text-sm font-medium hover:bg-primary/10 transition">{p}</button>
                ))}
              </div>
            </div>
          )}

          {messages?.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-wellness grid place-items-center text-primary-foreground"><Bot className="h-4 w-4" /></div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"}`}>
                {m.content}
              </div>
            </motion.div>
          ))}

          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-wellness grid place-items-center text-primary-foreground"><Bot className="h-4 w-4" /></div>
              <div className="rounded-2xl bg-secondary px-4 py-3 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} className="h-2 w-2 rounded-full bg-muted-foreground" />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border p-3 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask WellAI anything…" className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button type="submit" disabled={!input.trim() || thinking} className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground disabled:opacity-50">
            {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </Card>
    </div>
  );
}
