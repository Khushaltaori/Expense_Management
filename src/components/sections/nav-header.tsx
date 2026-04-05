"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Product", href: "#product" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "AI Assistant", href: "#assistant" },
];

export function NavHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 shadow-[var(--card-shadow)]"
          : "bg-transparent py-5"
      }`}
      style={scrolled ? { background: "var(--bg-glass-nav)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", borderBottom: "1px solid var(--border-color)" } : undefined}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 md:px-10 lg:px-16">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5" style={{ color: "var(--text-primary)" }}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Aether<span className="text-gradient">AI</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm transition-all duration-300 hover:bg-[var(--bg-subtle)]"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA + Theme Toggle + Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 hover:scale-105"
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-subtle)",
              color: "var(--text-secondary)",
            }}
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "light" ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: 90, scale: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Sun className="h-4.5 w-4.5" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  exit={{ rotate: -90, scale: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Moon className="h-4.5 w-4.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <Link
            href="/login"
            className="hidden rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_30px_rgba(14,165,233,0.28)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(14,165,233,0.45)] hover:brightness-110 md:inline-flex"
          >
            Get Started
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition md:hidden"
            style={{ color: "var(--text-secondary)" }}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden md:hidden"
            style={{ borderTop: "1px solid var(--border-color)", background: "var(--bg-glass-nav)", backdropFilter: "blur(20px)" }}
          >
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm transition"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/login"
                className="mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-3 text-center text-sm font-medium text-white"
              >
                Get Started
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
