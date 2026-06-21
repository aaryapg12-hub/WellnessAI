import { createFileRoute } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Camera, Save } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useProfile, type Profile } from "@/hooks/useProfile";
import { Card, PageHeader } from "@/components/dashboard/ui";
import { getInitials } from "@/lib/utils-avatar";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  head: () => ({ meta: [{ title: "Profile — Aura" }] }),
  component: ProfilePage,
});

const FIELDS: Array<{ key: keyof Profile; label: string; type?: string; placeholder?: string; options?: string[] }> = [
  { key: "full_name", label: "Full name" },
  { key: "age", label: "Age", type: "number" },
  { key: "gender", label: "Gender", options: ["Female", "Male", "Non-binary", "Prefer not to say"] },
  { key: "height_cm", label: "Height (cm)", type: "number" },
  { key: "weight_kg", label: "Weight (kg)", type: "number" },
  { key: "body_fat", label: "Body fat (%)", type: "number" },
  { key: "activity_level", label: "Activity level", options: ["Sedentary", "Light", "Moderate", "Active", "Very active"] },
  { key: "occupation", label: "Occupation" },
  { key: "fitness_goal", label: "Fitness goal", options: ["Lose weight", "Build muscle", "Maintain", "Improve endurance", "Flexibility"] },
  { key: "food_preferences", label: "Food preference", options: ["Omnivore", "Vegetarian", "Vegan", "Pescatarian", "Keto"] },
  { key: "cuisine_preference", label: "Cuisine preference" },
  { key: "country", label: "Country" },
  { key: "budget", label: "Diet budget", options: ["Low", "Medium", "High"] },
  { key: "medical_conditions", label: "Medical conditions" },
  { key: "allergies", label: "Allergies" },
  { key: "skin_type", label: "Skin type", options: ["Normal", "Oily", "Dry", "Combination", "Sensitive"] },
  { key: "skin_concerns", label: "Skin concerns" },
  { key: "lifestyle_habits", label: "Lifestyle habits" },
  { key: "sleep_hours", label: "Average sleep (hours)", type: "number" },
  { key: "water_intake_target", label: "Water target (ml)", type: "number" },
  { key: "smoking", label: "Smoking", options: ["Never", "Occasionally", "Daily", "Quit"] },
  { key: "alcohol", label: "Alcohol", options: ["Never", "Occasionally", "Weekly", "Daily"] },
  { key: "emergency_contact", label: "Emergency contact" },
];

function ProfilePage() {
  const { user } = useAuthUser();
  const { data, isLoading } = useProfile();
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const profile = { ...(data?.profile ?? {}), ...form } as Partial<Profile>;
  const bmi = profile.height_cm && profile.weight_kg
    ? (Number(profile.weight_kg) / Math.pow(Number(profile.height_cm) / 100, 2)).toFixed(1)
    : null;

  const handleChange = (k: keyof Profile, v: string) => {
    const numeric = ["age", "height_cm", "weight_kg", "body_fat", "sleep_hours", "water_intake_target"];
    setForm((f) => ({ ...f, [k]: numeric.includes(k as string) ? (v === "" ? null : Number(v)) : v }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: user.id, email: user.email, ...form });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
    setForm({});
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { error: profErr } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
    setUploading(false);
    if (profErr) { toast.error(profErr.message); return; }
    toast.success("Photo updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  if (isLoading) return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const initials = getInitials(profile.full_name as string, user?.email);

  return (
    <div className="space-y-6">
      <PageHeader title="Your profile" description="Help Aura personalize your wellness plan." />

      <Card className="p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-wellness grid place-items-center overflow-hidden ring-4 ring-background shadow-elegant">
              {data?.avatarSignedUrl ? (
                <img src={data.avatarSignedUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary-foreground">{initials}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 grid place-items-center h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-soft cursor-pointer hover:opacity-90">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          <div className="min-w-0">
            <div className="font-display text-2xl font-bold truncate">{profile.full_name || user?.email}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            {bmi && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                BMI: <span className="text-primary font-semibold">{bmi}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-5">Personal details</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FIELDS.map((f) => (
            <div key={String(f.key)}>
              <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
              {f.options ? (
                <select value={(profile[f.key] as string) ?? ""} onChange={(e) => handleChange(f.key, e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select…</option>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type ?? "text"} value={(profile[f.key] as string | number) ?? ""}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving || Object.keys(form).length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-6 py-2.5 font-semibold shadow-soft disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
          </motion.button>
        </div>
      </Card>
    </div>
  );
}
