import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dumbbell, Home, Heart, Flame, Award, PersonStanding } from "lucide-react";
import { Card, PageHeader, StatCard } from "@/components/dashboard/ui";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/dashboard/fitness")({
  head: () => ({ meta: [{ title: "Fitness Coach — Aura" }] }),
  component: FitnessPage,
});

const PLANS = {
  gym: [
    { day: "Mon", focus: "Push", exercises: ["Bench press 4x8", "Overhead press 3x10", "Tricep dips 3x12"] },
    { day: "Tue", focus: "Pull", exercises: ["Deadlift 4x6", "Pull-ups 4x8", "Barbell row 3x10"] },
    { day: "Wed", focus: "Legs", exercises: ["Squat 4x8", "Lunges 3x12", "Calf raises 4x15"] },
    { day: "Thu", focus: "Cardio", exercises: ["30-min run", "Core 4x circuit"] },
    { day: "Fri", focus: "Full body", exercises: ["Clean & press 4x6", "Goblet squat 3x10", "Plank 3x60s"] },
  ],
  home: [
    { day: "Mon", focus: "Upper", exercises: ["Push-ups 3x12", "Pike push-ups 3x10", "Diamond push-ups 3x8"] },
    { day: "Tue", focus: "Lower", exercises: ["Squats 4x15", "Lunges 3x12/leg", "Glute bridge 3x15"] },
    { day: "Wed", focus: "Yoga", exercises: ["Sun salutation 5x", "Warrior flow 10m", "Cool-down 5m"] },
    { day: "Thu", focus: "Cardio", exercises: ["Jumping jacks 4x60s", "Burpees 4x10", "Mountain climbers 4x30s"] },
    { day: "Fri", focus: "Core", exercises: ["Plank 3x60s", "Russian twist 3x20", "Leg raises 3x12"] },
  ],
};

function FitnessPage() {
  const [tab, setTab] = useState<"home" | "gym">("home");

  return (
    <div className="space-y-6">
      <PageHeader title="Fitness Coach" description="Workout plans, daily challenges and progress tracking." />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Calories burned (wk)" value="2,140" icon={Flame} color="warning" delta="+12% vs last week" />
        <StatCard label="Active days" value="5 / 7" icon={Heart} color="accent" />
        <StatCard label="Walking target" value="8,000 steps" icon={PersonStanding} color="primary" />
        <StatCard label="Streak" value="🔥 11 days" icon={Award} color="success" />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold">Weekly workout plan</h3>
          <div className="inline-flex rounded-full bg-secondary p-1">
            <Tab active={tab === "home"} onClick={() => setTab("home")} icon={Home}>Home</Tab>
            <Tab active={tab === "gym"} onClick={() => setTab("gym")} icon={Dumbbell}>Gym</Tab>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PLANS[tab].map((d) => (
            <motion.div key={d.day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-mint p-4">
              <div className="text-xs font-bold text-accent-foreground">{d.day}</div>
              <div className="font-semibold text-accent-foreground">{d.focus}</div>
              <ul className="mt-2 space-y-1 text-xs text-accent-foreground/90">
                {d.exercises.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="grid sm:grid-cols-3 gap-5">
        <Card className="p-5"><h3 className="font-semibold mb-2">Today's challenge</h3><p className="text-sm text-muted-foreground">100 squats split across the day. You got this!</p></Card>
        <Card className="p-5"><h3 className="font-semibold mb-2">Stretching</h3><p className="text-sm text-muted-foreground">10-min full-body morning stretch.</p></Card>
        <Card className="p-5"><h3 className="font-semibold mb-2">Yoga</h3><p className="text-sm text-muted-foreground">Sun Salutation flow for energy.</p></Card>
      </div>
    </div>
  );
}

function Tab({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${active ? "bg-card shadow-soft" : "text-muted-foreground"}`}>
      <Icon className="h-3.5 w-3.5" /> {children}
    </button>
  );
}
