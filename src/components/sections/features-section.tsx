"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { BarChart3, Camera, FileText, Sparkles, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Sparkles,
    title: "AI Expense Tracking",
    description: "Track every transaction with adaptive AI categorization and fraud anomaly detection.",
    gradient: "from-cyan-400 to-blue-500",
    glowColor: "rgba(34,211,238,0.15)",
  },
  {
    icon: Camera,
    title: "Smart Receipt Scanning",
    description: "OCR + model-based parsing captures line items, taxes, currencies, and merchant metadata.",
    gradient: "from-indigo-400 to-purple-500",
    glowColor: "rgba(99,102,241,0.15)",
  },
  {
    icon: BarChart3,
    title: "Real-Time Insights",
    description: "Live dashboards surface burn trends, budget drift, and spend concentration instantly.",
    gradient: "from-purple-400 to-pink-500",
    glowColor: "rgba(168,85,247,0.15)",
  },
  {
    icon: FileText,
    title: "Auto Report Generation",
    description: "One click to produce audit-grade monthly closes, board summaries, and export packs.",
    gradient: "from-emerald-400 to-cyan-500",
    glowColor: "rgba(52,211,153,0.15)",
  },
  {
    icon: Users,
    title: "Team Expense Management",
    description: "Policy-aware approvals, role permissions, and custom workflows for distributed teams.",
    gradient: "from-amber-400 to-orange-500",
    glowColor: "rgba(251,191,36,0.15)",
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transformStyle: "preserve-3d", transition: "transform 0.3s ease" }}
      >
        <Card className="group relative h-full transition-all duration-500 hover:shadow-[var(--card-shadow-hover)]">
          {/* Hover glow */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${feature.glowColor}, transparent 60%)` }}
          />

          <CardHeader className="relative">
            <div className={`icon-halo mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
              <feature.icon className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg">{feature.title}</CardTitle>
            <CardDescription>{feature.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--border-color)" }}>
              <motion.div
                initial={{ width: "0%" }}
                whileInView={{ width: "75%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full rounded-full bg-gradient-to-r ${feature.gradient} transition-all duration-500 group-hover:w-[90%]`}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} id="features" className="relative px-6 py-24 md:px-10 lg:px-16">
      {/* Section glow accent */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div className="h-px w-[400px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-12 max-w-2xl"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Platform Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl" style={{ color: "var(--text-primary)" }}>
            Built for finance velocity{" "}
            <span className="text-gradient">without compromise.</span>
          </h2>
          <p className="mt-4" style={{ color: "var(--text-muted)" }}>
            Every feature is designed to eliminate manual work and give your finance team superpowers.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
