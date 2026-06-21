import { createFileRoute } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Upload, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Card, PageHeader, ProgressRing } from "@/components/dashboard/ui";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/dashboard/skin")({
  head: () => ({ meta: [{ title: "AI Skin Analysis — Aura" }] }),
  component: SkinPage,
});

const CONDITIONS = ["Acne", "Pimples", "Dark Circles", "Wrinkles", "Pigmentation", "Dry patches", "Oily T-zone", "Redness", "Uneven tone", "Large pores"];

function mockAnalyze() {
  const score = Math.round(60 + Math.random() * 35);
  const skinAge = Math.round(20 + Math.random() * 20);
  const detected = CONDITIONS.filter(() => Math.random() > 0.55).slice(0, 5);
  return {
    score, skinAge, detected,
    routines: {
      morning: ["Gentle cleanser", "Vitamin C serum", "Moisturizer", "SPF 30+"],
      night: ["Oil cleanser → Foaming wash", "Niacinamide serum", "Retinol (2× week)", "Hydrating cream"],
      weekly: ["Exfoliating mask", "Hydrating sheet mask"],
    },
    ingredients: ["Hyaluronic acid", "Niacinamide", "Vitamin C", "Salicylic acid", "Ceramides"],
    lifestyle: ["Drink 2.5L water daily", "Sleep 7-8 hours", "Reduce dairy & sugar", "Wash pillowcase weekly"],
  };
}

function SkinPage() {
  const { user } = useAuthUser();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: history } = useQuery({
    queryKey: ["skin_reports", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("skin_reports").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const analyze = async () => {
    if (!file || !user) return;
    setAnalyzing(true);
    const path = `${user.id}/skin-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: upErr } = await supabase.storage.from("skin-uploads").upload(path, file);
    if (upErr) { toast.error(upErr.message); setAnalyzing(false); return; }

    // Mock AI analysis — replace with real CV model later
    await new Promise((r) => setTimeout(r, 1800));
    const result = mockAnalyze();

    const { error } = await supabase.from("skin_reports").insert({
      user_id: user.id,
      image_url: path,
      skin_score: result.score,
      skin_age: result.skinAge,
      analysis: { detected: result.detected, ingredients: result.ingredients, lifestyle: result.lifestyle },
      routine: result.routines,
    });
    setAnalyzing(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Analysis complete");
    setFile(null);
    setPreview(null);
    qc.invalidateQueries({ queryKey: ["skin_reports"] });
  };

  const latest = history?.[0];

  return (
    <div className="space-y-6">
      <PageHeader title="AI Skin Analysis" description="Upload a clear, well-lit selfie. Aura suggests a personalized routine." />

      <div className="flex items-start gap-2 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p className="text-warning-foreground">This analysis is for wellness purposes only and is not a medical diagnosis.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Upload a selfie</h3>
          <label className="block">
            <div className="grid place-items-center rounded-2xl border-2 border-dashed border-border bg-muted/30 p-10 cursor-pointer hover:bg-muted/50 transition">
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-64 rounded-xl object-cover" />
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">Click or drop image here</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onPick} />
            </div>
          </label>
          <motion.button whileTap={{ scale: 0.97 }} onClick={analyze} disabled={!file || analyzing} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-6 py-3 font-semibold shadow-soft disabled:opacity-50">
            {analyzing ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><Sparkles className="h-4 w-4" /> Analyze with AI</>}
          </motion.button>
        </Card>

        {latest && (
          <Card className="p-6 bg-gradient-wellness text-primary-foreground">
            <h3 className="font-semibold mb-3">Latest result</h3>
            <div className="flex items-center gap-6">
              <ProgressRing value={latest.skin_score ?? 0} label={`${latest.skin_score}`} sub="skin score" />
              <div>
                <div className="text-sm text-white/80">Estimated skin age</div>
                <div className="font-display text-3xl font-bold">{latest.skin_age} yrs</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(latest.analysis as { detected?: string[] } | null)?.detected?.map((d) => (
                <span key={d} className="text-xs rounded-full bg-white/20 px-3 py-1">{d}</span>
              ))}
            </div>
          </Card>
        )}
      </div>

      {latest?.routine && (
        <div className="grid lg:grid-cols-3 gap-5">
          {(["morning", "night", "weekly"] as const).map((slot) => {
            const list = (latest.routine as Record<string, string[]>)[slot] ?? [];
            return (
              <Card key={slot} className="p-5">
                <h3 className="font-semibold capitalize mb-3">{slot} routine</h3>
                <ol className="space-y-2 text-sm">
                  {list.map((step, i) => (
                    <li key={i} className="flex gap-3"><span className="font-semibold text-primary">{i + 1}.</span>{step}</li>
                  ))}
                </ol>
              </Card>
            );
          })}
        </div>
      )}

      {latest?.analysis && (
        <div className="grid sm:grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="font-semibold mb-3">Suggested ingredients</h3>
            <div className="flex flex-wrap gap-2">
              {((latest.analysis as { ingredients?: string[] }).ingredients ?? []).map((i) => (
                <span key={i} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{i}</span>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold mb-3">Lifestyle tips</h3>
            <ul className="space-y-2 text-sm">
              {((latest.analysis as { lifestyle?: string[] }).lifestyle ?? []).map((t) => (
                <li key={t} className="flex gap-2"><span className="text-accent">✓</span>{t}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {(history?.length ?? 0) > 1 && (
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Progress history</h3>
          <div className="space-y-2">
            {history!.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                <span className="font-semibold">Score: {r.skin_score} · Age: {r.skin_age}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
