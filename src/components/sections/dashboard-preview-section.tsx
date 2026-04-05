"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import {
  Bot,
  ChartArea,
  LayoutDashboard,
  Receipt,
  Settings,
  Sheet,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import { Card } from "@/components/ui/card";

const SpendingLineChart = dynamic(
  () => import("@/components/charts/spending-line-chart").then((module) => module.SpendingLineChart),
  {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-white/5" />,
  },
);

const CategoryPieChart = dynamic(
  () => import("@/components/charts/category-pie-chart").then((module) => module.CategoryPieChart),
  {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-white/5" />,
  },
);

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Receipt, label: "Expenses" },
  { icon: ChartArea, label: "Analytics" },
  { icon: Sheet, label: "Reports" },
  { icon: Bot, label: "AI Assistant", badge: true },
  { icon: Settings, label: "Settings" },
];

const tx = [
  { merchant: "Uber", category: "Travel", amount: "-$42.50", status: "approved" },
  { merchant: "Notion", category: "SaaS", amount: "-$18.00", status: "approved" },
  { merchant: "AWS", category: "Infra", amount: "-$320.20", status: "pending" },
  { merchant: "Blue Bottle", category: "Meals", amount: "-$14.90", status: "approved" },
];

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 1800;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target * 10) / 10);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);

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

  const display = target >= 1000
    ? `${prefix}${(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}${suffix}`
    : `${prefix}${value.toFixed(1)}${suffix}`;

  return <span ref={ref} className="tabular-nums">{display}</span>;
}

export function DashboardPreviewSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} id="dashboard" className="px-6 py-24 md:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">Dashboard Preview</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl" style={{ color: "var(--text-primary)" }}>
            Finance operations in one{" "}
            <span className="text-gradient">modern workspace.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid overflow-hidden rounded-3xl border shadow-[var(--card-shadow)] scan-container lg:grid-cols-[220px_1fr]"
          style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", backdropFilter: "blur(16px)" }}
        >
          {/* Sidebar */}
          <aside className="border-b p-5 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--border-color)", background: "var(--bg-subtle)" }}>
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Aether AI</p>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-300 ${
                    item.active
                      ? "bg-indigo-500/10 text-indigo-600"
                      : ""
                  }`}
                  style={!item.active ? { color: "var(--text-muted)" } : undefined}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.badge ? <Sparkles className="ml-auto h-3.5 w-3.5 text-cyan-500" /> : null}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <div className="space-y-6 p-5 sm:p-6">
            {/* Stat cards with counters */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Monthly Spend", value: 81490, prefix: "$", suffix: "", change: "+8.1%", icon: TrendingUp },
                { label: "Avg Approval", value: 4.2, prefix: "", suffix: " min", change: "-34%", icon: Sparkles },
                { label: "Policy Compliance", value: 96.2, prefix: "", suffix: "%", change: "+4.6%", icon: AlertTriangle },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group p-4 transition-all duration-300 glow-border-animated">
                    <div className="flex items-center justify-between">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                      <item.icon className="h-3.5 w-3.5 transition-colors group-hover:text-cyan-500" style={{ color: "var(--text-muted)" }} />
                    </div>
                    <p className="mt-1 text-xl font-semibold animate-counter-glow" style={{ color: "var(--text-primary)" }}>
                      <AnimatedCounter target={item.value} prefix={item.prefix} suffix={item.suffix} />
                    </p>
                    <p className="mt-2 text-xs text-emerald-500">{item.change} this month</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
              <Card className="p-4">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Spending Trend</p>
                <SpendingLineChart />
              </Card>
              <Card className="p-4">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Spending Categories</p>
                <CategoryPieChart />
              </Card>
            </div>

            {/* Transactions + Insights */}
            <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
              <Card className="p-4">
                <p className="mb-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Recent Transactions</p>
                <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--border-color)" }}>
                  <table className="w-full text-left text-sm">
                    <thead style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}>
                      <tr>
                        <th className="px-3 py-2 font-medium">Merchant</th>
                        <th className="px-3 py-2 font-medium">Category</th>
                        <th className="px-3 py-2 font-medium">Amount</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tx.map((row, index) => (
                        <motion.tr
                          key={row.merchant}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.06 }}
                          className="border-t transition-colors hover:bg-[var(--bg-subtle)]"
                          style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                        >
                          <td className="px-3 py-2.5">{row.merchant}</td>
                          <td className="px-3 py-2.5">
                            <span className="rounded-lg px-2 py-0.5 text-xs" style={{ background: "var(--bg-subtle)" }}>{row.category}</span>
                          </td>
                          <td className="px-3 py-2.5 font-medium">{row.amount}</td>
                          <td className="px-3 py-2.5">
                            <span className={`rounded-lg px-2 py-0.5 text-xs ${
                              row.status === "approved"
                                ? "bg-emerald-400/10 text-emerald-600"
                                : "bg-amber-400/10 text-amber-600"
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>AI Insights</p>
                <div className="mt-4 space-y-3">
                  {[
                    { text: "Travel spend is 17% above expected baseline.", type: "warning" },
                    { text: "4 duplicate receipt patterns detected this week.", type: "info" },
                    { text: "Predicted monthly burn closes at $88.6k.", type: "info" },
                  ].map((insight, index) => (
                    <motion.div
                      key={insight.text}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.08 }}
                      className={`rounded-lg border p-3 text-sm transition-all duration-300 ${
                        insight.type === "warning"
                          ? "border-indigo-300/30 bg-indigo-100/10 text-indigo-700"
                          : ""
                      }`}
                      style={insight.type !== "warning" ? { borderColor: "var(--border-color)", background: "var(--bg-subtle)", color: "var(--text-secondary)" } : undefined}
                    >
                      {insight.text}
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
