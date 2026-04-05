"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ArrowRight, Play, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const HeroParticles = dynamic(
  () => import("@/components/three/hero-particles").then((module) => module.HeroParticles),
  { ssr: false },
);

const FloatingExpenseCards = dynamic(
  () => import("@/components/three/floating-expense-cards").then((module) => module.FloatingExpenseCards),
  { ssr: false },
);

/* ─── Animated Counter Hook ─── */
function useCounter(target: number, duration: number = 2000, suffix: string = "") {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) animate(); },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animate]);

  return { ref, display: `${value.toLocaleString()}${suffix}` };
}

const heroStats = [
  { label: "Expenses Automated", target: 12400000, suffix: "", display: "12.4M", icon: TrendingUp },
  { label: "Receipt Accuracy", target: 98.7, suffix: "%", display: "98.7%", icon: Shield },
  { label: "Report Time Saved", target: 43, suffix: "h/mo", display: "43h/mo", icon: Zap },
];

export function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headingRef.current) return;
    // GSAP cinematic text reveal
    const words = headingRef.current.querySelectorAll(".hero-word");
    gsap.fromTo(
      words,
      { opacity: 0, y: 40, filter: "blur(10px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        stagger: 0.08,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.3,
      },
    );
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    gsap.fromTo(
      statsRef.current.children,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.12,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.8,
      },
    );
  }, []);

  // Split heading text into words for stagger animation
  const headingText = "Autonomous spend intelligence for the modern finance stack.";
  const words = headingText.split(" ");

  return (
    <section className="relative min-h-screen overflow-hidden px-6 pb-24 pt-36 md:px-10 lg:px-16">
      {/* 3D Particle Background */}
      <HeroParticles />

      {/* 3D Floating Cards behind content */}
      <FloatingExpenseCards />

      {/* Extra depth layers */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Horizontal light beam */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-0 -translate-y-1/2">
        <div
          className="mx-auto h-px w-3/4"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.15), rgba(99,102,241,0.15), transparent)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Badge className="animate-glow-breath">
              <Sparkles className="mr-1.5 h-3 w-3" />
              AI Expense Management for Ambitious Teams
            </Badge>

            <h1
              ref={headingRef}
              className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]"
              style={{ color: "var(--text-primary)" }}
            >
              {words.map((word, i) => (
                <span
                  key={i}
                  className={`hero-word inline-block opacity-0 ${
                    i >= 2 && i <= 4 ? "text-gradient-hero" : ""
                  }`}
                  style={{ marginRight: "0.3em" }}
                >
                  {word}
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              Instantly capture receipts, classify expenses, forecast runway, and generate investor-ready
              reports with an AI copilot designed for fast-moving operators.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.7 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link href="/login">
              <Button size="lg" className="group btn-ripple">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button size="lg" variant="secondary" className="group">
              <Play className="h-4 w-4" />
              View Demo
            </Button>
          </motion.div>

          <div ref={statsRef} className="grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="group rounded-xl border px-4 py-3 backdrop-blur-xl transition-all duration-300"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
              >
                <div className="flex items-center gap-2">
                  <stat.icon className="h-4 w-4 text-cyan-400 opacity-60" />
                  <p className="text-xl font-semibold animate-counter-glow" style={{ color: "var(--text-primary)" }}>{stat.display}</p>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.14em]" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cinematic 3D Dashboard Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="perspective-container relative z-10"
        >
          <div className="tilt-card relative overflow-hidden rounded-2xl border p-6 glow-border-animated" style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", backdropFilter: "blur(16px)" }}>
            {/* Scan line overlay */}
            <div className="scan-container absolute inset-0 pointer-events-none" />

            {/* Top accent line */}
            <div className="absolute inset-x-6 top-6 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />

            <div className="relative space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>AI Cashflow Pulse</p>
                <Sparkles className="h-4 w-4 text-cyan-300 animate-pulse" />
              </div>

              <div className="rounded-xl border p-4 transition-all duration-300" style={{ borderColor: "var(--border-color)", background: "var(--bg-subtle)" }}>
                <p className="text-xs uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>Today</p>
                <p className="mt-2 text-3xl font-semibold animate-counter-glow" style={{ color: "var(--text-primary)" }}>$124,980</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  <p className="text-sm text-emerald-500">+12.3% vs last week</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border p-4 transition-all duration-300" style={{ borderColor: "var(--border-color)", background: "var(--bg-subtle)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Unapproved expenses</p>
                  <p className="mt-1 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>14</p>
                  <div className="mt-2 h-1 w-full rounded-full" style={{ background: "var(--border-color)" }}>
                    <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                  </div>
                </div>
                <div className="rounded-xl border p-4 transition-all duration-300" style={{ borderColor: "var(--border-color)", background: "var(--bg-subtle)" }}>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Anomaly alerts</p>
                  <p className="mt-1 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>2 high risk</p>
                  <div className="mt-2 flex gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-muted)" }}>
          <span className="text-xs uppercase tracking-[0.2em]">Scroll to explore</span>
          <div className="h-8 w-5 rounded-full border p-1" style={{ borderColor: "var(--border-hover)" }}>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-cyan-300"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
