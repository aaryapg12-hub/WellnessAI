import { createFileRoute } from "@tanstack/react-router";
import { Bell, Droplets, Dumbbell, Moon, Sparkles, UtensilsCrossed, Brain } from "lucide-react";
import { Card, PageHeader } from "@/components/dashboard/ui";

export const Route = createFileRoute("/_authenticated/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Reminders — WellAI" }] }),
  component: NotifPage,
});

const REMINDERS = [
  { icon: Droplets, title: "Drink water", time: "Every 2 hours", on: true },
  { icon: Dumbbell, title: "Workout", time: "6:30 PM daily", on: true },
  { icon: Brain, title: "Meditation", time: "8:00 AM daily", on: false },
  { icon: Moon, title: "Wind down", time: "10:00 PM", on: true },
  { icon: UtensilsCrossed, title: "Meal times", time: "8 AM · 1 PM · 7 PM", on: true },
  { icon: Sparkles, title: "Skin care", time: "9 AM · 9 PM", on: false },
];

function NotifPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reminders" description="Stay on track with gentle, personalized nudges." />
      <div className="space-y-3">
        {REMINDERS.map((r, i) => (
          <Card key={i} className="p-4 flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><r.icon className="h-5 w-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{r.title}</div>
              <div className="text-xs text-muted-foreground">{r.time}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked={r.on} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted peer-checked:bg-primary rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </label>
          </Card>
        ))}
      </div>
      <Card className="p-5 bg-gradient-mint">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-accent-foreground">Browser notifications</div>
            <p className="text-sm text-accent-foreground/80 mt-1">Enable browser notifications to receive reminders even when WellAI is closed.</p>
            <button onClick={() => Notification.requestPermission()} className="mt-3 rounded-full bg-card px-4 py-2 text-sm font-medium hover:opacity-90">Enable notifications</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
