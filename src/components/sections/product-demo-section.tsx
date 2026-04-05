"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Layers, BarChart3, CreditCard, Cpu, ArrowRight } from "lucide-react";

const DashboardScene = dynamic(
  () => import("@/components/three/dashboard-scene").then((module) => module.DashboardScene),
  {
    ssr: false,
    loading: () => (
      <div className="h-[420px] w-full animate-pulse rounded-2xl border" style={{ borderColor: "var(--border-color)", background: "var(--bg-subtle)" }} />
    ),
  },
);

const features3D = [
  { icon: Layers, label: "Rotating charts", description: "Dynamic 3D chart visualizations" },
  { icon: BarChart3, label: "Dynamic data updates", description: "Real-time data streaming" },
  { icon: CreditCard, label: "Floating expense cards", description: "Interactive 3D card elements" },
  { icon: Cpu, label: "GPU-accelerated", description: "Smooth 60fps rendering" },
];

export function ProductDemoSection() {
  return (
    <section id="product" className="relative px-6 py-24 md:px-10 lg:px-16">
      {/* Section glow */}
      <div className="pointer-events-none absolute right-0 top-1/3 h-[500px] w-[500px]">
        <div className="h-full w-full rounded-full" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)" }} />
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-5"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Interactive Product Demo</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl" style={{ color: "var(--text-primary)" }}>
            Explore a live 3D{" "}
            <span className="text-gradient">expense command center.</span>
          </h2>
          <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Floating dashboards, animated charts, and real-time update streams model exactly how your finance
            team interacts with spend operations.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {features3D.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group flex items-start gap-3 rounded-xl border p-4 transition-all duration-300"
                style={{ borderColor: "var(--border-color)", background: "var(--bg-card)" }}
              >
                <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-500 transition-all duration-300 group-hover:bg-indigo-500/25">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.a
            href="#"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-300 transition-all duration-300 hover:gap-3 hover:text-indigo-200"
          >
            Try the interactive demo
            <ArrowRight className="h-4 w-4" />
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Glow behind the scene */}
          <div className="absolute inset-0 -m-4 rounded-3xl" style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.08), transparent 70%)" }} />
          <DashboardScene />
        </motion.div>
      </div>
    </section>
  );
}
