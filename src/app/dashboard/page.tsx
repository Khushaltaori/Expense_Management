"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Sparkles,
  LayoutDashboard,
  Receipt,
  ChartArea,
  Sheet,
  Bot,
  Settings,
  LogOut,
  TrendingUp,
  AlertTriangle,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";

import { Card } from "@/components/ui/card";

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 1500;
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
    ? `${prefix}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}${suffix}`
    : `${prefix}${value.toFixed(1)}${suffix}`;

  return <span ref={ref} className="tabular-nums">{display}</span>;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Receipt, label: "Expenses" },
  { icon: ChartArea, label: "Analytics" },
  { icon: Sheet, label: "Reports" },
  { icon: Bot, label: "AI Assistant", badge: true },
  { icon: Settings, label: "Settings" },
];

const recentExpenses = [
  { merchant: "Uber", category: "Travel", amount: "-$42.50", date: "Today", status: "approved" },
  { merchant: "Notion", category: "SaaS", amount: "-$18.00", date: "Today", status: "approved" },
  { merchant: "AWS", category: "Infra", amount: "-$320.20", date: "Yesterday", status: "pending" },
  { merchant: "Blue Bottle", category: "Meals", amount: "-$14.90", date: "Yesterday", status: "approved" },
  { merchant: "Figma", category: "SaaS", amount: "-$15.00", date: "Mar 12", status: "approved" },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Loading state while session is being resolved
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === "unauthenticated") return null;

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image || "";

  return (
    <main className="relative min-h-screen bg-slate-950">
      {/* Grid background */}
      <div className="pointer-events-none fixed inset-0 bg-grid" />

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-glow-orb absolute -right-64 -top-64 h-[500px] w-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }}
        />
        <div
          className="animate-glow-orb absolute -left-48 bottom-1/4 h-[400px] w-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)", animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-[240px] shrink-0 border-r border-white/10 bg-slate-950/80 backdrop-blur-xl lg:block">
          <div className="flex h-full flex-col p-5">
            {/* Logo */}
            <div className="mb-8 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_16px_rgba(34,211,238,0.2)]">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold text-white">
                Aether<span className="text-gradient">AI</span>
              </span>
            </div>

            {/* Nav items */}
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ${
                    item.active
                      ? "bg-white/10 text-white shadow-[0_0_12px_rgba(34,211,238,0.08)]"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && <Sparkles className="ml-auto h-3.5 w-3.5 text-cyan-300" />}
                </button>
              ))}
            </nav>

            {/* User profile + sign out */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center gap-3 rounded-xl p-2">
                {userImage ? (
                  <img src={userImage} alt={userName} className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-bold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{userName}</p>
                  <p className="truncate text-xs text-slate-400">{userEmail}</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {/* Top bar */}
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl font-semibold text-white"
                >
                  Welcome back, <span className="text-gradient">{userName.split(" ")[0]}</span>
                </motion.h1>
                <p className="text-sm text-slate-400">Here&apos;s your expense overview for today.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:bg-white/10 hover:text-white">
                  <Search className="h-4 w-4" />
                </button>
                <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-all duration-300 hover:bg-white/10 hover:text-white">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 bg-cyan-400" />
                </button>
                {/* Mobile user */}
                <div className="flex items-center gap-2 lg:hidden">
                  {userImage ? (
                    <img src={userImage} alt={userName} className="h-8 w-8 rounded-full" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-xs font-bold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard content */}
          <div className="space-y-6 p-6">
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Monthly Spend", value: 81490, prefix: "$", suffix: "", change: "+8.1%", icon: TrendingUp, color: "cyan" },
                { label: "Avg Approval", value: 4.2, prefix: "", suffix: " min", change: "-34%", icon: Sparkles, color: "indigo" },
                { label: "Policy Compliance", value: 96.2, prefix: "", suffix: "%", change: "+4.6%", icon: AlertTriangle, color: "purple" },
                { label: "Active Expenses", value: 142, prefix: "", suffix: "", change: "+12", icon: Receipt, color: "emerald" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <Card className="group p-5 transition-all duration-300 hover:border-cyan-300/20 glow-border-animated">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <item.icon className="h-4 w-4 text-slate-500 transition-colors group-hover:text-cyan-400" />
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      <AnimatedCounter target={item.value} prefix={item.prefix} suffix={item.suffix} />
                    </p>
                    <p className="mt-2 text-xs text-emerald-300">{item.change} this month</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Recent expenses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Recent Expenses</p>
                  <button className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-cyan-300">
                    View All <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.03] text-slate-300">
                      <tr>
                        <th className="px-4 py-3 font-medium">Merchant</th>
                        <th className="hidden px-4 py-3 font-medium sm:table-cell">Category</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="hidden px-4 py-3 font-medium md:table-cell">Date</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentExpenses.map((row, index) => (
                        <motion.tr
                          key={`${row.merchant}-${row.date}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.4 + index * 0.06 }}
                          className="border-t border-white/10 text-slate-200 transition-colors hover:bg-white/[0.03]"
                        >
                          <td className="px-4 py-3 font-medium">{row.merchant}</td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs">{row.category}</span>
                          </td>
                          <td className="px-4 py-3 font-medium">{row.amount}</td>
                          <td className="hidden px-4 py-3 text-slate-400 md:table-cell">{row.date}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                              row.status === "approved"
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-amber-400/10 text-amber-300"
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
            </motion.div>

            {/* AI Insight banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="relative overflow-hidden p-5">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.1), transparent 70%)" }} />
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">AI Insight</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Your travel spending is 17% above expected baseline this month. Consider reviewing recurring Uber charges for optimization opportunities.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
