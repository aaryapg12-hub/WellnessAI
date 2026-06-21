import { createFileRoute } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Palette, Upload, Sparkles, Loader2 } from "lucide-react";
import { Card, PageHeader } from "@/components/dashboard/ui";

export const Route = createFileRoute("/_authenticated/dashboard/fashion")({
  head: () => ({ meta: [{ title: "Fashion & Color — WellAI" }] }),
  component: FashionPage,
});

type Analysis = {
  undertone: string;
  season: string;
  recommended: string[];
  avoid: string[];
  outfits: Record<string, string[]>;
  accessories: string[];
  hair: string[];
};

function mockFashion(): Analysis {
  const undertones = ["Warm", "Cool", "Neutral"];
  const u = undertones[Math.floor(Math.random() * 3)];
  return {
    undertone: u,
    season: u === "Warm" ? "Autumn / Spring" : u === "Cool" ? "Winter / Summer" : "Soft Autumn",
    recommended: ["#0EA5E9", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#FBBF24"],
    avoid: ["#9CA3AF", "#FECACA", "#BAE6FD"],
    outfits: {
      Office: ["Navy blazer + crisp white shirt", "Pleated wide-leg trousers", "Loafers + minimal watch"],
      Casual: ["Olive tee + light denim", "White sneakers", "Crossbody bag"],
      Traditional: ["Ivory kurta with subtle gold work", "Earthy stole", "Minimal jewelry"],
      Party: ["Emerald satin shirt", "Black tailored pants", "Statement earrings"],
    },
    accessories: ["Gold-tone watch", "Tortoise sunglasses", "Pearl studs", "Brown leather belt"],
    hair: ["Warm chocolate brown", "Caramel highlights", "Auburn tint"],
  };
}

function FashionPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  };

  const analyze = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setAnalysis(mockFashion());
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Fashion & Color Consultant" description="Discover the palette and outfits that flatter your undertone." />

      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <label className="block cursor-pointer">
            <div className="grid place-items-center rounded-2xl border-2 border-dashed border-border p-10 bg-muted/30 hover:bg-muted/50 transition">
              {preview ? <img src={preview} alt="" className="max-h-64 rounded-xl object-cover" /> : (
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">Upload a clear face photo</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onPick} />
            </div>
          </label>
          <motion.button whileTap={{ scale: 0.97 }} onClick={analyze} disabled={!preview || loading} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-primary text-primary-foreground py-3 font-semibold shadow-soft disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analyze style
          </motion.button>
        </Card>

        {analysis && (
          <Card className="p-6 bg-gradient-mint">
            <Palette className="h-6 w-6 text-accent-foreground mb-2" />
            <div className="text-xs uppercase tracking-wider text-accent-foreground/80">Your undertone</div>
            <div className="font-display text-3xl font-bold text-accent-foreground">{analysis.undertone}</div>
            <div className="mt-1 text-sm text-accent-foreground/90">Season: {analysis.season}</div>
          </Card>
        )}
      </div>

      {analysis && (
        <>
          <div className="grid sm:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Recommended colors</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.recommended.map((c) => (
                  <div key={c} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs">
                    <span className="h-4 w-4 rounded-full" style={{ background: c }} /> {c}
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Colors to avoid</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.avoid.map((c) => (
                  <div key={c} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs">
                    <span className="h-4 w-4 rounded-full" style={{ background: c }} /> {c}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(analysis.outfits).map(([cat, items]) => (
              <Card key={cat} className="p-5">
                <div className="text-xs uppercase font-semibold text-primary">{cat}</div>
                <ul className="mt-2 space-y-1 text-sm">{items.map((i) => <li key={i}>• {i}</li>)}</ul>
              </Card>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Card className="p-5"><h3 className="font-semibold mb-3">Accessories</h3><ul className="text-sm space-y-1">{analysis.accessories.map((a) => <li key={a}>• {a}</li>)}</ul></Card>
            <Card className="p-5"><h3 className="font-semibold mb-3">Hair color ideas</h3><ul className="text-sm space-y-1">{analysis.hair.map((a) => <li key={a}>• {a}</li>)}</ul></Card>
          </div>
        </>
      )}
    </div>
  );
}
