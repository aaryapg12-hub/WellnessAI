import { useState, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, User, Sparkles, UtensilsCrossed, Dumbbell, Brain,
  Palette, ListChecks, MessageCircle, Activity, FileBarChart, Bell, Settings,
  LogOut, Menu, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useAuthUser } from "@/hooks/useAuthUser";
import { getInitials } from "@/lib/utils-avatar";
import { Wordmark } from "@/components/Logo";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/skin", label: "Skin Analysis", icon: Sparkles },
  { to: "/dashboard/diet", label: "Diet Planner", icon: UtensilsCrossed },
  { to: "/dashboard/fitness", label: "Fitness Coach", icon: Dumbbell },
  { to: "/dashboard/mental", label: "Mental Wellness", icon: Brain },
  { to: "/dashboard/fashion", label: "Fashion & Color", icon: Palette },
  { to: "/dashboard/habits", label: "Habit Tracker", icon: ListChecks },
  { to: "/dashboard/chat", label: "AI Chat", icon: MessageCircle },
  { to: "/dashboard/score", label: "Wellness Score", icon: Activity },
  { to: "/dashboard/reports", label: "Reports", icon: FileBarChart },
  { to: "/dashboard/notifications", label: "Reminders", icon: Bell },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuthUser();
  const { data } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  };

  const initials = getInitials(data?.profile?.full_name, user?.email);
  const avatar = data?.avatarSignedUrl;

  return (
    <div className="min-h-screen bg-aurora">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <Link to="/dashboard"><Wordmark /></Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition relative ${active ? "text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
                {active && (
                  <motion.div layoutId="active-nav" className="absolute inset-0 rounded-xl bg-gradient-primary shadow-soft" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                <Icon className="relative z-10 h-4 w-4 shrink-0" />
                <span className="relative z-10 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 28, stiffness: 280 }} className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border lg:hidden flex flex-col">
              <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
                <Wordmark />
                <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.to;
                  return (
                    <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-gradient-primary text-primary-foreground shadow-soft" : "hover:bg-sidebar-accent"}`}>
                      <Icon className="h-4 w-4" /> {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-sidebar-border p-3">
                <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent transition">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="lg:pl-64">
        {/* Top nav */}
        <header className="sticky top-0 z-20 h-16 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="flex h-full items-center gap-3 px-4 sm:px-6">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1" />
            <Link to="/dashboard/notifications" className="relative p-2 rounded-full hover:bg-muted transition">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
            </Link>
            <Link to="/dashboard/profile" className="flex items-center gap-2 pl-2">
              <div className="h-9 w-9 rounded-full bg-gradient-wellness shadow-soft grid place-items-center overflow-hidden ring-2 ring-background">
                {avatar ? (
                  <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-primary-foreground">{initials}</span>
                )}
              </div>
            </Link>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
