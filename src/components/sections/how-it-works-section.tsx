"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Camera, Brain, FolderCheck, FileBarChart, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Scan Receipt",
    description: "Snap a photo or forward an email. Our OCR instantly extracts every detail.",
    color: "from-cyan-400 to-blue-500",
    glowColor: "#22d3ee",
  },
  {
    icon: Brain,
    title: "AI Extracts Data",
    description: "Machine learning parses merchant, amount, tax, currency, and line items.",
    color: "from-indigo-400 to-purple-500",
    glowColor: "#818cf8",
  },
  {
    icon: FolderCheck,
    title: "Auto-Categorized",
    description: "Expenses are classified using your custom rules and adaptive AI learning.",
    color: "from-purple-400 to-pink-500",
    glowColor: "#c084fc",
  },
  {
    icon: FileBarChart,
    title: "Reports Generated",
    description: "Audit-grade reports are compiled instantly, ready for approval and export.",
    color: "from-emerald-400 to-cyan-500",
    glowColor: "#34d399",
  },
];

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const beamHeight = useTransform(scrollYProgress, [0.1, 0.7], ["0%", "100%"]);

  return (
    <section ref={sectionRef} className="relative px-6 py-24 md:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">How It Works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl" style={{ color: "var(--text-primary)" }}>
            From receipt to report in{" "}
            <span className="text-gradient">four steps.</span>
          </h2>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Vertical timeline beam — desktop */}
          <div className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 lg:block">
            <div className="relative h-full w-full" style={{ background: "var(--border-color)" }}>
              {/* Animated fill beam */}
              <motion.div
                className="absolute left-0 top-0 w-full bg-gradient-to-b from-cyan-400 via-indigo-400 to-emerald-400"
                style={{ height: beamHeight }}
              />
              {/* Glow effect on beam */}
              <motion.div
                className="absolute left-1/2 top-0 w-4 -translate-x-1/2 bg-gradient-to-b from-cyan-400/20 via-indigo-400/20 to-emerald-400/20 blur-md"
                style={{ height: beamHeight }}
              />
            </div>
          </div>

          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-16 ${
                    isEven ? "" : "lg:direction-rtl"
                  }`}
                >
                  {/* Content */}
                  <div className={`${isEven ? "lg:text-right lg:pr-16" : "lg:col-start-2 lg:pl-16"}`}>
                    <div className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 hover:shadow-[var(--card-shadow-hover)] ${
                      isEven ? "" : ""
                    }`} style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", backdropFilter: "blur(8px)" }}>
                      {/* Glow accent */}
                      <div
                        className="absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-30"
                        style={{ background: `radial-gradient(circle, ${step.glowColor}40, transparent 70%)` }}
                      />

                      <div className={`relative flex items-start gap-4 ${isEven ? "lg:flex-row-reverse lg:text-right" : ""}`}>
                        <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}>
                          <step.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold" style={{ borderColor: "var(--border-hover)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}>
                              {index + 1}
                            </span>
                            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{step.title}</p>
                          </div>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{step.description}</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={`mt-4 h-0.5 origin-left rounded-full bg-gradient-to-r ${step.color}`}
                      />
                    </div>
                  </div>

                  {/* Timeline node — desktop */}
                  <div className="absolute left-1/2 top-6 z-10 hidden -translate-x-1/2 lg:block">
                    <div className="relative">
                      <div className={`h-4 w-4 rounded-full bg-gradient-to-br ${step.color} shadow-lg`} />
                      <div
                        className="absolute inset-0 animate-ping rounded-full opacity-40"
                        style={{ backgroundColor: step.glowColor, animationDuration: "2s", animationDelay: `${index * 0.3}s` }}
                      />
                    </div>
                  </div>

                  {/* Empty space for grid alignment */}
                  {isEven ? <div className="hidden lg:block" /> : null}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-500 transition-all duration-300 hover:gap-3 hover:text-indigo-400"
          >
            Learn more about our process
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
