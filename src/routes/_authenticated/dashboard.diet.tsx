import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ChefHat, Flame, Beef, Wheat, Droplets } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/diet")({
  head: () => ({ meta: [{ title: "AI Diet Planner — WellAI" }] }),
  component: DietPage,
});

const MEAL_BANK = {
  breakfast: ["Oats with berries & almonds", "Greek yogurt parfait", "Avocado toast + egg", "Veggie omelette + fruit"],
  lunch: ["Grilled chicken salad", "Quinoa buddha bowl", "Lentil & spinach stew + rice", "Tofu stir-fry + brown rice"],
  dinner: ["Baked salmon + greens", "Chickpea curry + millet", "Stuffed bell peppers", "Soba noodles + tofu"],
  snacks: ["Apple + peanut butter", "Mixed nuts (30g)", "Hummus + carrots", "Cottage cheese + berries"],
};

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

type Plan = { calories: number; protein: number; carbs: number; fat: number; fiber: number; water: number;
  today: { breakfast: string; lunch: string; dinner: string; snacks: string };
  week: { day: string; meals: string[] }[]; shopping: string[]; alternatives: string[]; };

function DietPage() {
  const { data } = useProfile();
  const profile = data?.profile;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!profile?.age || !profile?.weight_kg || !profile?.height_cm) {
      toast.error("Please complete your profile (age, height, weight) first.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const w = Number(profile.weight_kg);
    const h = Number(profile.height_cm);
    const a = Number(profile.age);
    const isMale = profile.gender === "Male";
    // Mifflin-St Jeor
    const bmr = 10 * w + 6.25 * h - 5 * a + (isMale ? 5 : -161);
    const mult = profile.activity_level === "Very active" ? 1.725 : profile.activity_level === "Active" ? 1.55 : profile.activity_level === "Moderate" ? 1.375 : 1.2;
    const goalAdj = profile.fitness_goal === "Lose weight" ? -400 : profile.fitness_goal === "Build muscle" ? 300 : 0;
    const cal = Math.round(bmr * mult + goalAdj);
    const protein = Math.round((cal * 0.3) / 4);
    const carbs = Math.round((cal * 0.45) / 4);
    const fat = Math.round((cal * 0.25) / 9);
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const week = days.map((d) => ({ day: d, meals: [pick(MEAL_BANK.breakfast), pick(MEAL_BANK.lunch), pick(MEAL_BANK.dinner), pick(MEAL_BANK.snacks)] }));
    setPlan({
      calories: cal, protein, carbs, fat, fiber: 30, water: 2500,
      today: { breakfast: pick(MEAL_BANK.breakfast), lunch: pick(MEAL_BANK.lunch), dinner: pick(MEAL_BANK.dinner), snacks: pick(MEAL_BANK.snacks) },
      week,
      shopping: ["Oats", "Greek yogurt", "Berries", "Chicken breast", "Quinoa", "Lentils", "Salmon", "Mixed greens", "Eggs", "Almonds", "Olive oil"],
      alternatives: ["Swap rice → cauliflower rice", "Swap pasta → zucchini noodles", "Swap soda → sparkling water + lemon", "Swap fried → baked"],
    });
    setLoading(false);
    toast.success("Plan generated");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Diet Planner" description="Macro-balanced plans tailored to your goals, preferences and budget." action={
        <motion.button whileTap={{ scale: 0.97 }} onClick={generate} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary text-primary-foreground px-5 py-2.5 font-semibold shadow-soft disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChefHat className="h-4 w-4" />} Generate plan
        </motion.button>
      } />

      {!plan && (
        <Card className="p-10 text-center">
          <ChefHat className="h-10 w-10 text-primary mx-auto" />
          <h3 className="mt-3 font-semibold text-lg">No plan yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Click "Generate plan" to create your personalized weekly diet.</p>
        </Card>
      )}

      {plan && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Daily calories" value={plan.calories} icon={Flame} color="warning" />
            <StatCard label="Protein" value={`${plan.protein}g`} icon={Beef} color="primary" />
            <StatCard label="Carbs" value={`${plan.carbs}g`} icon={Wheat} color="accent" />
            <StatCard label="Water" value={`${plan.water}ml`} icon={Droplets} color="primary" />
          </div>

          <Card className="p-5">
            <h3 className="font-semibold mb-4">Today's meals</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(["breakfast", "lunch", "dinner", "snacks"] as const).map((slot) => (
                <div key={slot} className="rounded-xl bg-secondary/50 p-4">
                  <div className="text-xs uppercase font-semibold text-muted-foreground">{slot}</div>
                  <div className="mt-1.5 font-medium">{plan.today[slot]}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold mb-4">Weekly meal plan</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-muted-foreground">
                  <th className="p-2">Day</th><th className="p-2">Breakfast</th><th className="p-2">Lunch</th><th className="p-2">Dinner</th><th className="p-2">Snack</th>
                </tr></thead>
                <tbody>
                  {plan.week.map((d) => (
                    <tr key={d.day} className="border-t border-border">
                      <td className="p-2 font-semibold">{d.day}</td>
                      {d.meals.map((m, i) => <td key={i} className="p-2">{m}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-5">
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Shopping list</h3>
              <div className="flex flex-wrap gap-2">{plan.shopping.map((s) => <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{s}</span>)}</div>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold mb-3">Healthy swaps</h3>
              <ul className="space-y-2 text-sm">{plan.alternatives.map((a) => <li key={a} className="flex gap-2"><span className="text-accent">→</span>{a}</li>)}</ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
