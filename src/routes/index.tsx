import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, Brain, UtensilsCrossed, Dumbbell, ListChecks, MessageCircle,
  Activity, Palette, ShieldCheck, Heart, ChevronRight, Star, ArrowRight,
} from "lucide-react";
import { Wordmark } from "@/components/Logo";
import hero from "@/assets/hero-illustration.jpg";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WellAI — AI Personal Wellness & Lifestyle Coach" },
      { name: "description", content: "WellAI is your AI-powered personal wellness coach. Personalized skin analysis, diet, fitness, mental wellness, and habit tracking — aligned with UN SDG 3." },
      { property: "og:title", content: "WellAI — AI Personal Wellness Coach" },
      { property: "og:description", content: "AI-powered wellness for skin, diet, fitness, sleep, mood and habits." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Sparkles, title: "AI Skin Analysis", desc: "Upload a selfie. Get a personalized routine, skin score and product suggestions." },
  { icon: UtensilsCrossed, title: "Smart Diet Planner", desc: "Macro-balanced meal plans tailored to goals, budget and cuisine." },
  { icon: Dumbbell, title: "Fitness Coach", desc: "Home, gym, yoga and cardio workouts that adapt to your progress." },
  { icon: Brain, title: "Mental Wellness", desc: "Mood tracking, journaling, breathing, and guided meditation." },
  { icon: Palette, title: "Fashion & Color", desc: "AI-suggested palettes and outfits matching your undertone." },
  { icon: ListChecks, title: "Habit Tracker", desc: "Streaks, badges and achievements that keep momentum alive." },
  { icon: MessageCircle, title: "AI Wellness Chat", desc: "Ask anything — diet, sleep, skincare or stress — 24/7." },
  { icon: Activity, title: "Wellness Score", desc: "One number that captures your sleep, diet, mood and movement." },
];

const steps = [
  { n: "01", title: "Create your profile", desc: "Tell WellAI about your goals, lifestyle and preferences." },
  { n: "02", title: "Get a personal plan", desc: "AI builds your skin, diet, fitness and mental wellness routines." },
  { n: "03", title: "Track every day", desc: "Log water, sleep, mood and habits in seconds." },
  { n: "04", title: "Improve over time", desc: "Your Wellness Score grows as you build lasting habits." },
];

const testimonials = [
  { name: "Aisha R.", role: "Designer", text: "WellAI's skin routine cleared my breakouts in 6 weeks. The app feels like a personal coach." },
  { name: "Marcus L.", role: "Engineer", text: "I finally hit 8 hours of sleep consistently. The habit tracker and AI tips are everything." },
  { name: "Priya S.", role: "Student", text: "The diet planner is realistic — uses local ingredients and fits my budget." },
];

const faqs = [
  { q: "Is WellAI a medical app?", a: "No. WellAI provides general wellness guidance. Always consult a qualified healthcare professional for medical advice." },
  { q: "Is my data private?", a: "Yes. Your data is encrypted, stored securely, and only visible to you. You can export or delete it anytime." },
  { q: "How does the AI work?", a: "WellAI analyzes your inputs — selfies, logs, preferences — to generate personalized plans that adapt as you progress." },
  { q: "Does WellAI support SDG 3?", a: "WellAI is aligned with the United Nations Sustainable Development Goal 3: Good Health & Well-being for all." },
  { q: "Is it free?", a: "WellAI's core wellness features are free for personal use. Premium AI features may be available in the future." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Wordmark />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#how" className="hover:text-foreground transition">How it works</a>
            <a href="#sdg" className="hover:text-foreground transition">SDG 3</a>
            <a href="#faq" className="hover:text-foreground transition">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-full hover:bg-muted transition">Sign in</Link>
            <Link to="/auth" search={{ mode: "signup" } as never} className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-90 transition">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-aurora pointer-events-none" />
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
        <div className="absolute top-40 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-28 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div animate={{ opacity: [0, 1], y: [16, 0] }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium mb-6">
              <Heart className="h-3.5 w-3.5 text-accent" />
              Aligned with UN SDG 3 · Good Health & Well-being
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              Your AI <span className="text-gradient">wellness</span> companion.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Personalized skin analysis, diet plans, fitness, mental wellness and habit tracking — all in one beautifully simple app, powered by AI.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" search={{ mode: "signup" } as never} className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:shadow-glow transition">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-semibold hover:bg-card transition">
                Explore features
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {["bg-primary", "bg-accent", "bg-primary-glow", "bg-accent/70"].map((c, i) => (
                  <div key={i} className={`h-8 w-8 rounded-full ${c} ring-2 ring-background`} />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
                <span className="ml-2">Loved by 10,000+ wellness-seekers</span>
              </div>
            </div>
          </motion.div>

          <motion.div animate={{ opacity: [0, 1], scale: [0.95, 1] }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="absolute -inset-6 bg-gradient-wellness opacity-30 blur-3xl rounded-full" />
            <div className="relative glass rounded-3xl p-3 shadow-elegant">
              <img src={hero} alt="AI wellness illustration" width={1024} height={1024} className="rounded-2xl w-full" />
            </div>
            {/* Floating stat cards */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -left-4 top-12 glass rounded-2xl p-4 shadow-soft hidden sm:block">
              <div className="text-xs text-muted-foreground">Wellness score</div>
              <div className="text-2xl font-bold text-gradient">87</div>
            </motion.div>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute -right-4 bottom-10 glass rounded-2xl p-4 shadow-soft hidden sm:block">
              <div className="text-xs text-muted-foreground">Streak</div>
              <div className="text-2xl font-bold">🔥 14d</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { v: "10K+", l: "Active users" },
            { v: "1.2M", l: "Logs tracked" },
            { v: "94%", l: "Feel healthier" },
            { v: "8", l: "AI features" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-gradient">{s.v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold">Everything for your well-being</h2>
          <p className="mt-4 text-muted-foreground">Eight AI-powered modules working together to help you build a healthier life.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} whileInView={{ opacity: [0, 1], y: [12, 0] }} viewport={{ once: true, amount: 0.1 }} transition={{ delay: i * 0.05 }} className="group rounded-2xl border border-border bg-card p-6 shadow-card hover-lift">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-mint mb-4 group-hover:scale-110 transition">
                <f.icon className="h-5 w-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-card/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold">From sign-up to healthier in days</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.n} whileInView={{ opacity: [0, 1], y: [12, 0] }} viewport={{ once: true, amount: 0.1 }} transition={{ delay: i * 0.08 }} className="relative rounded-2xl glass p-6">
                <div className="font-display text-5xl font-bold text-gradient opacity-90">{s.n}</div>
                <h3 className="mt-3 font-semibold text-lg">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SDG 3 */}
      <section id="sdg" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="rounded-3xl bg-gradient-wellness p-10 sm:p-14 text-primary-foreground shadow-elegant relative overflow-hidden">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold mb-4">
                <ShieldCheck className="h-3.5 w-3.5" /> United Nations SDG 3
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">Good Health &amp; Well-being for All</h2>
              <p className="mt-4 text-white/90 max-w-xl">
                WellAI is built to support the United Nations Sustainable Development Goal 3 — ensuring healthy lives and promoting well-being for people of every age, everywhere.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { v: "3", l: "SDG Number" },
                { v: "13", l: "Health targets" },
                { v: "2030", l: "Global goal year" },
                { v: "∞", l: "Lives improved" },
              ].map((x) => (
                <div key={x.l} className="rounded-2xl bg-white/15 backdrop-blur p-5">
                  <div className="font-display text-3xl font-bold">{x.v}</div>
                  <div className="mt-1 text-sm text-white/80">{x.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Loved by users</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold">Real stories. Real wellness.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex gap-1 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}</div>
                <p className="text-foreground leading-relaxed">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-wellness grid place-items-center text-primary-foreground font-semibold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold">Common questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-3xl bg-gradient-primary p-10 sm:p-16 text-center text-primary-foreground shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 bg-aurora opacity-30" />
          <div className="relative">
            <h2 className="font-display text-4xl sm:text-5xl font-bold">Begin your wellness journey today</h2>
            <p className="mt-4 text-white/90 max-w-xl mx-auto">Join thousands taking control of their health, one habit at a time.</p>
            <Link to="/auth" search={{ mode: "signup" } as never} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white text-primary px-7 py-3.5 font-semibold shadow-elegant hover:shadow-glow transition">
              Create free account <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-6 text-sm text-white/80">Questions? Email us at hello@aura.health</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-wrap items-center justify-between gap-4">
          <Wordmark />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} WellAI. For wellness purposes only — not medical advice.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-muted/40 transition">
        <span className="font-medium">{q}</span>
        <ChevronRight className={`h-4 w-4 shrink-0 transition ${open ? "rotate-90" : ""}`} />
      </button>
      <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} className="overflow-hidden">
        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
}
