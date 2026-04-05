"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Easing } from "framer-motion";

// ─── Easing ───────────────────────────────────────────────────────────────────
const EASE: Easing = "easeOut";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay, ease: EASE },
});

// ─── Shared card style ────────────────────────────────────────────────────────
const cardBase: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "var(--bg-card)",
  boxShadow: "var(--card-shadow-hover)",
};

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 1 SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function SourceIcons() {
  const sources = [
    {
      label: "Gmail",
      bg: "#EA4335",
      icon: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="white">
          <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
        </svg>
      ),
    },
    {
      label: "Outlook",
      bg: "#0078D4",
      icon: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="white">
          <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.05zM6.1 9.26q-.7 0-1.21.28-.5.27-.83.73-.32.46-.48.98-.15.52-.15 1.05 0 .57.16 1.08.15.52.46.92.32.41.83.65.51.23 1.19.23.66 0 1.16-.23.51-.24.85-.66.35-.41.51-.93.16-.53.16-1.1 0-.55-.15-1.06-.16-.52-.49-.91-.33-.4-.83-.62-.5-.22-1.18-.22z" />
        </svg>
      ),
    },
    { label: "Messages", bg: "#34C759", icon: <span className="text-xs">💬</span> },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      {sources.map((s, i) => (
        <motion.div
          key={s.label}
          {...fadeUp(i * 0.07)}
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ ...cardBase, minWidth: 110 }}
        >
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
            style={{ background: s.bg }}
          >
            {s.icon}
          </span>
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            {s.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function UberReceiptCard() {
  const rows = [
    { label: "Trip Fare", value: "$25.11" },
    { label: "Subtotal", value: "$25.11" },
    { label: "Wait time", value: "$0.00" },
    { label: "Tolls", value: "$2.40" },
    { label: "Amount Charged", value: "···· 1836" },
  ];

  return (
    <motion.div
      {...fadeUp(0.12)}
      style={{ ...cardBase, width: 200, transform: "rotate(-1.5deg)" }}
      className="p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-sm font-black text-white">
          U
        </span>
        <div>
          <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Uber</p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Ride receipt</p>
        </div>
      </div>

      <div className="mb-3 rounded-lg px-3 py-2 text-center" style={{ background: "var(--bg-subtle)" }}>
        <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Total</p>
        <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>$27.51</p>
      </div>

      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{r.label}</span>
            <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>{r.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-500/10 px-2.5 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        <span className="text-[10px] font-medium text-green-500">Auto-extracted</span>
      </div>
    </motion.div>
  );
}

function AddExpensePanel() {
  const fields = [
    { label: "Currency", value: "USD" },
    { label: "Amount", value: "$27.51", highlight: true },
    { label: "Date", value: "Mar 12, 2026" },
    { label: "Payment mode", value: "Corporate Card" },
    { label: "Project", value: "Mercury (Billable)" },
    { label: "Category", value: "Taxi" },
    { label: "Merchant", value: "Uber Technologies" },
    { label: "Purpose", value: "Meeting" },
  ];

  return (
    <motion.div {...fadeUp(0.24)} style={{ ...cardBase, width: 192, transform: "rotate(1.5deg)" }}>
      <div
        className="rounded-t-xl px-4 py-3"
        style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-color)" }}
      >
        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Add Expense</p>
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Review &amp; submit</p>
      </div>

      <div className="space-y-1 px-3 py-2">
        {fields.map((f) => (
          <div
            key={f.label}
            className="flex items-center justify-between rounded-md px-2 py-0.5"
            style={{ background: f.highlight ? "rgba(34,197,94,0.08)" : "transparent" }}
          >
            <span className="text-[9px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              {f.label}
            </span>
            <span
              className="max-w-[95px] truncate text-right text-[10px] font-medium"
              style={{ color: f.highlight ? "#22c55e" : "var(--text-secondary)" }}
            >
              {f.value}
            </span>
          </div>
        ))}
      </div>

      <div className="px-3 pb-3 pt-1">
        <button className="w-full rounded-lg bg-green-500 py-2 text-[11px] font-semibold text-white transition-all hover:bg-green-600 active:scale-95">
          Save expense
        </button>
      </div>
    </motion.div>
  );
}

/** Section 1 right-column visual — icons | receipt | form side-by-side */
function Section1Visual() {
  return (
    <div
      className="relative mx-auto w-full overflow-hidden"
      style={{ maxWidth: 560, minHeight: 500, padding: "60px 0" }}
    >
      {/* Green ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ background: "radial-gradient(ellipse at 55% 50%, rgba(34,197,94,0.07) 0%, transparent 70%)" }}
      />

      {/* Three-column horizontal layout */}
      <div className="relative z-10 flex items-start justify-between gap-4 px-4">
        {/* Col 1: Source icons */}
        <div className="flex flex-col justify-start pt-10">
          <SourceIcons />
        </div>

        {/* Col 2: Uber receipt */}
        <div className="flex-shrink-0">
          <UberReceiptCard />
        </div>

        {/* Col 3: Add expense panel */}
        <div className="flex-shrink-0 pt-6">
          <AddExpensePanel />
        </div>
      </div>

      {/* Connector dots between col 1 → col 2 */}
      <div className="pointer-events-none absolute left-[130px] top-1/2 z-0 h-px w-8 -translate-y-1/2"
        style={{ background: "linear-gradient(to right, var(--border-color), transparent)" }}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SECTION 2 SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function TransactionsTable() {
  const rows = [
    { merchant: "Walmart",  amount: "$222.35", date: "Mar 08", matched: true },
    { merchant: "Best Buy", amount: "$224.82", date: "Mar 09", matched: false },
    { merchant: "Walmart",  amount: "$159.56", date: "Mar 11", matched: false },
    { merchant: "Le Cirque",amount: "$202.22", date: "Mar 13", matched: false },
    { merchant: "Starbucks",amount: "$65.15",  date: "Mar 15", matched: false },
    { merchant: "Amazon",   amount: "$324.82", date: "Mar 18", matched: false },
  ];

  return (
    <motion.div
      {...fadeUp(0)}
      className="overflow-hidden"
      style={{ ...cardBase, width: "100%" }}
    >
      <div
        className="grid grid-cols-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider"
        style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}
      >
        <span>Merchant</span>
        <span>Date</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Receipt</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-4 px-4 py-2 transition-colors hover:bg-green-500/5"
          style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border-color)" : "none" }}
        >
          <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{r.merchant}</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{r.date}</span>
          <span className="text-right text-xs font-semibold text-green-500">{r.amount}</span>
          <div className="flex justify-end">
            {r.matched ? (
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[9px] font-medium text-green-500">Matched ✓</span>
            ) : (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-medium text-amber-500">Pending</span>
            )}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function SMSPhoneMockup() {
  const messages = [
    {
      from: "bot",
      text: "Your transaction of $222.35 at Walmart requires a receipt. Please reply with an image of the receipt and we'll match it for you.",
      isSuccess: false,
      isImage: false,
    },
    { from: "user", text: "📷 receipt_walmart.jpg", isImage: true, isSuccess: false },
    { from: "bot",  text: "Thanks! Receipt successfully added and matched to your card expense. ✅", isSuccess: true, isImage: false },
  ];

  return (
    <motion.div
      {...fadeUp(0.18)}
      className="overflow-hidden"
      style={{
        ...cardBase,
        borderRadius: 24,
        border: "3px solid var(--border-color)",
        width: 192,
        background: "var(--bg-secondary)",
      }}
    >
      {/* Notch */}
      <div className="flex items-center justify-center py-2" style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="h-1.5 w-10 rounded-full" style={{ background: "var(--text-muted)", opacity: 0.35 }} />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-color)" }}>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">S</span>
        <div>
          <p className="text-[10px] font-semibold" style={{ color: "var(--text-primary)" }}>Sage Expense</p>
          <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>Business · SMS</p>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-2 px-3 py-3">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 + i * 0.16, duration: 0.35 }}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[88%] rounded-2xl px-2.5 py-1.5 text-[9px] leading-relaxed ${
                m.from === "user"
                  ? "rounded-br-sm bg-green-500 text-white"
                  : m.isSuccess
                  ? "rounded-bl-sm bg-green-500/10 text-green-600"
                  : "rounded-bl-sm"
              }`}
              style={m.from === "bot" && !m.isSuccess ? { background: "var(--bg-subtle)", color: "var(--text-secondary)" } : {}}
            >
              {m.isImage ? (
                <div className="flex items-center gap-1">
                  <span className="text-sm">🖼️</span>
                  <span>receipt_walmart.jpg</span>
                </div>
              ) : m.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Card logos */}
      <div className="flex items-center justify-center gap-2.5 px-3 py-2" style={{ borderTop: "1px solid var(--border-color)", background: "var(--bg-subtle)" }}>
        <div className="flex h-5 items-center justify-center rounded px-1.5 text-[9px] font-black italic" style={{ background: "#1A1F71", color: "#fff" }}>VISA</div>
        <div className="flex h-5 items-center gap-0.5">
          <div className="h-4 w-4 rounded-full bg-red-500 opacity-90" />
          <div className="-ml-2 h-4 w-4 rounded-full bg-yellow-400 opacity-80" />
        </div>
        <div className="flex h-5 items-center justify-center rounded px-1.5 text-[8px] font-bold" style={{ background: "#007BC1", color: "#fff" }}>AMEX</div>
      </div>
    </motion.div>
  );
}

/** Section 2 left-column visual — table behind, phone overlapping at ~40% from left */
function Section2Visual() {
  return (
    <div
      className="relative mx-auto w-full"
      style={{ maxWidth: 560, minHeight: 500, padding: "60px 0" }}
    >
      {/* Green ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{ background: "radial-gradient(ellipse at 40% 50%, rgba(34,197,94,0.07) 0%, transparent 70%)" }}
      />

      {/* Table — z-10, full width with horizontal padding */}
      <div className="absolute inset-x-6 top-1/2 z-10 -translate-y-1/2">
        <TransactionsTable />
      </div>

      {/* Phone — z-20, positioned 40% from left, vertically centered */}
      <div
        className="absolute z-20"
        style={{
          left: "40%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <SMSPhoneMockup />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export default function ExpenseFeatureSections() {
  const sec1Ref = useRef<HTMLElement>(null);
  const sec2Ref = useRef<HTMLElement>(null);
  const sec1InView = useInView(sec1Ref, { once: true, margin: "-100px" });
  const sec2InView = useInView(sec2Ref, { once: true, margin: "-100px" });

  return (
    <>
      {/* ── Section 1: Intelligent data extraction ── */}
      <section
        ref={sec1Ref}
        id="intelligent-extraction"
        className="relative overflow-hidden"
        style={{ padding: "80px 60px", minHeight: 500 }}
      >
        {/* Divider glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-px w-[400px] bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />
        </div>
        {/* Ambient blob */}
        <div
          className="pointer-events-none absolute -right-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)" }}
        />

        <div
          className="relative mx-auto grid w-full items-center"
          style={{ maxWidth: 1280, gap: 80, gridTemplateColumns: "1fr 1fr" }}
        >
          {/* Left — text */}
          <div className="space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={sec1InView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold uppercase tracking-[0.2em] text-green-500"
            >
              AI-Powered
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={sec1InView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]"
              style={{ color: "var(--text-primary)" }}
            >
              Intelligent data{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                extraction
              </span>{" "}
              and coding
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={sec1InView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.16 }}
              className="text-base leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Our AI automatically extracts and codes every piece of expense data from receipts the moment
              they arrive — whether via email, SMS, or mobile upload. It categorizes by merchant type, maps
              to your chart of accounts, and flags policy exceptions before they become problems.
              <br /><br />
              Employees simply review the pre-filled form and hit submit. No manual data entry, no lost receipts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={sec1InView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.24 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              {["OCR Extraction", "Auto-categorization", "Policy enforcement"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-3.5 py-1.5 text-xs font-medium"
                  style={{
                    borderColor: "rgba(34,197,94,0.35)",
                    color: "var(--text-secondary)",
                    background: "rgba(34,197,94,0.07)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Right — layered visual */}
          <motion.div
            initial={{ opacity: 0, x: 36 }}
            animate={sec1InView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
          >
            <Section1Visual />
          </motion.div>
        </div>
      </section>

      {/* ── Section 2: Auto-match receipts ── */}
      <section
        ref={sec2Ref}
        id="auto-match-receipts"
        className="relative overflow-hidden"
        style={{ padding: "80px 60px", minHeight: 500, background: "var(--bg-subtle)" }}
      >
        {/* Divider glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-px w-[400px] bg-gradient-to-r from-transparent via-green-400/25 to-transparent" />
        </div>
        {/* Ambient blob */}
        <div
          className="pointer-events-none absolute -left-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)" }}
        />

        <div
          className="relative mx-auto grid w-full items-center"
          style={{ maxWidth: 1280, gap: 80, gridTemplateColumns: "1fr 1fr" }}
        >
          {/* Left — layered visual */}
          <motion.div
            initial={{ opacity: 0, x: -36 }}
            animate={sec2InView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
            className="order-2 lg:order-1"
          >
            <Section2Visual />
          </motion.div>

          {/* Right — text */}
          <div className="order-1 space-y-6 lg:order-2">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={sec2InView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold uppercase tracking-[0.2em] text-green-500"
            >
              Smart Matching
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={sec2InView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-[1.15]"
              style={{ color: "var(--text-primary)" }}
            >
              We{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                auto-match
              </span>{" "}
              receipts to transactions
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={sec2InView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.16 }}
              className="text-base leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              The moment a corporate card transaction posts, employees receive a real-time SMS notification
              from Sage Expense Management. They simply reply with a photo of the receipt — no app required.
              <br /><br />
              Our AI reads the image, extracts the data, and automatically matches it to the correct transaction
              — eliminating the end-of-month scramble and ensuring 100% receipt compliance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={sec2InView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.24 }}
            >
              <a
                href="#"
                className="group inline-flex items-center gap-2 text-sm font-bold text-green-500 transition-colors hover:text-green-400"
              >
                Credit card expense management
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={sec2InView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.32 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              {["Real-time SMS alerts", "Photo reply matching", "Visa · Mastercard · Amex"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border px-3.5 py-1.5 text-xs font-medium"
                  style={{
                    borderColor: "rgba(34,197,94,0.35)",
                    color: "var(--text-secondary)",
                    background: "rgba(34,197,94,0.07)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom divider glow */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2">
          <div className="h-px w-[400px] bg-gradient-to-r from-transparent via-green-400/20 to-transparent" />
        </div>
      </section>
    </>
  );
}
