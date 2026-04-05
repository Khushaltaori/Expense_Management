"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Github, Twitter, Linkedin, ArrowUpRight } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Integrations", "API"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    title: "Resources",
    links: ["Documentation", "Help Center", "Community", "Status"],
  },
];

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer className="relative px-6 pt-20 pb-8 md:px-10 lg:px-16">
      {/* Top gradient divider */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2">
        <div className="h-px w-[600px] max-w-[90vw] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
      </div>

      <div className="mx-auto w-full max-w-7xl">
        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative mb-16 overflow-hidden rounded-3xl border bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-purple-500/10 p-8 text-center sm:p-12"
          style={{ borderColor: "var(--border-color)" }}
        >
          {/* Background glow orbs */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.12), transparent 70%)" }} />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)" }} />

          <div className="relative">
            <h3 className="text-2xl font-semibold sm:text-3xl lg:text-4xl" style={{ color: "var(--text-primary)" }}>
              Ready to transform your{" "}
              <span className="text-gradient">expense workflow?</span>
            </h3>
            <p className="mt-3" style={{ color: "var(--text-secondary)" }}>
              Join thousands of finance teams already using Aether AI.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 text-sm font-medium text-white shadow-[0_8px_30px_rgba(14,165,233,0.28)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(14,165,233,0.45)] hover:brightness-110"
              >
                Start Free Trial
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium backdrop-blur-md transition-all duration-300"
                style={{ borderColor: "var(--border-hover)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
              >
                Schedule Demo
              </a>
            </div>
          </div>
        </motion.div>

        {/* Footer grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_16px_rgba(34,211,238,0.2)]">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Aether<span className="text-gradient">AI</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Autonomous spend intelligence for the modern finance stack. Built for fast-moving operators.
            </p>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300"
                  style={{ borderColor: "var(--border-color)", background: "var(--bg-subtle)", color: "var(--text-muted)" }}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{group.title}</p>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors duration-300 hover:text-indigo-500"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row" style={{ borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
          <p>© 2026 Aether Expense AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="transition-colors hover:text-indigo-500">Privacy</a>
            <a href="#" className="transition-colors hover:text-indigo-500">Terms</a>
            <a href="#" className="transition-colors hover:text-indigo-500">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
