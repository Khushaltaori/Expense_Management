"use client";
import React, {
  useState, useRef, useEffect, useCallback,
  ChangeEvent, KeyboardEvent,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExpenseData {
  category?: string; amount?: string | number; currency?: string;
  date?: string; merchant?: string; purpose?: string;
  project?: string; policy_status?: string; flag?: string;
}
interface ChatMessage {
  id: string; role: "user" | "bot"; text: string; timestamp: Date;
  quickReplies?: string[]; expenseData?: ExpenseData;
  isExpenseCard?: boolean; submitted?: boolean;
}
interface GeminiMsg { role: "user" | "model"; parts: { text: string }[]; }

// ─── Constants ────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are AetherAI Assistant (FB-057), an enterprise expense management AI for a Finance & Banking Suite.

IDENTITY: Name: AetherAI Assistant. Agent ID: FB-057. Tone: Professional, concise, helpful. No filler phrases.

MODES — operate based on user intent:
1. SUBMIT — Guide expense submission field by field: merchant, amount+currency, date, category (Meals/Travel/Accommodation/Transport/Office/Other), business purpose, receipt prompt, project/cost center. Ask ONE field at a time.
2. RECEIPT — Parse OCR text into structured expense fields.
3. POLICY — Answer policy questions from knowledge base only.
4. STATUS — Report expense approval status (draft/submitted/pending_approval/returned_for_correction/approved/rejected).

EXPENSE POLICY (FR-4):
- Meals/entertainment: $75/person max. Client dinners: $150/person with manager note.
- Hotels: $250/night max. Exceptions need Finance Officer approval.
- Flights: Economy only. Business class only for flights 8h+ with VP approval.
- Mileage: $0.67/mile IRS rate.
- No alcohol claims without explicit manager pre-approval.
- Receipts mandatory for all expenses above $25.
- Submission deadline: 30 days from expense date.

Once all submission fields collected, output ONLY this JSON block:
<expense_data>{"merchant":"","amount":0.00,"currency":"USD","date":"","category":"","purpose":"","project":"","policy_status":"compliant|exception|non-compliant","flag":""}</expense_data>

FRAUD DETECTION: Flag if same merchant+amount+date appears twice ("duplicate_risk"), amount exceeds category limit ("policy_breach"), or expense older than 30 days ("manual_review_required").

OUTPUT RULES: Keep responses under 60 words unless showing expense card JSON. Never use bullet points in conversational replies. Ask max one question per message. If off-topic, redirect: "I can help with expenses, receipts, policy questions, or approval status."
For policy questions not covered, say: "This isn't covered in current policy. I'll escalate to your Finance Officer."
Never guess or invent policy limits.`;

const MERCHANTS = ["Uber", "Marriott", "Delta Airlines", "Chipotle", "Starbucks", "WeWork"];
const CAT_MAP: Record<string, string> = {
  Uber: "Ground Transport", Marriott: "Hotel",
  "Delta Airlines": "Flight", Chipotle: "Meals",
  Starbucks: "Meals", WeWork: "Office",
};
const CAT_COLORS: Record<string, string> = {
  Meals: "#f59e0b", Hotel: "#3b82f6", Flight: "#8b5cf6",
  "Ground Transport": "#10b981", Office: "#64748b", General: "#00e5cc",
};

const QUICK_TABS = [
  { id: "submit", label: "Submit expense", icon: "📤" },
  { id: "scan", label: "Scan receipt", icon: "📷" },
  { id: "track", label: "Track status", icon: "📊" },
  { id: "policy", label: "Policy Q&A", icon: "📋" },
];

const ACTION_CHIPS = [
  { id: "yes", label: "Yes, submit it" },
  { id: "note", label: "Add a note" },
  { id: "category", label: "Change category" },
  { id: "attach", label: "Attach receipt" },
];

function uid() { return Math.random().toString(36).slice(2, 10); }
function fmtTime(d: Date) { return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
function parseExpense(text: string): { text: string; data: ExpenseData | null } {
  const m = text.match(/<expense_data>([\s\S]*?)<\/expense_data>/);
  if (!m) return { text, data: null };
  try {
    return {
      text: text.replace(/<expense_data>[\s\S]*?<\/expense_data>/, "").trim(),
      data: JSON.parse(m[1]),
    };
  } catch { return { text, data: null }; }
}
async function runOCR(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/ocr", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "OCR failed");
  const p = data.parsed ?? {};
  const parts: string[] = [];
  if (p.amount)   parts.push(`Amount: ${p.amount}`);
  if (p.date)     parts.push(`Date: ${p.date}`);
  if (p.merchant) parts.push(`Merchant: ${p.merchant}`);
  if (p.category) parts.push(`Category: ${p.category}`);
  const summary = parts.length
    ? parts.join(", ")
    : `Raw OCR text: ${data.rawText?.slice(0, 300) ?? "(empty)"}`;
  return `User uploaded receipt "${file.name}". OCR extracted: ${summary}. Please confirm these details with the user and proceed with submission.`;
}

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      a: Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,229,204,${d.a})`;
        ctx.fill();
      });
      // Draw faint connecting lines
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 70) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(0,229,204,${0.07 * (1 - dist / 70)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AetherAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<GeminiMsg[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [activeTab, setActiveTab] = useState("submit");
  const [isDragging, setIsDragging] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // scroll to bottom
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  // greet on first open
  useEffect(() => {
    if (isOpen && !greeted) {
      setGreeted(true);
      setHasUnread(false);
      setTimeout(() =>
        addBot(
          "Hello! I'm AetherAI Assistant. I can help you submit expenses, scan receipts, check approval status, or answer policy questions. What would you like to do?",
          ["Submit an expense", "Upload a receipt", "Policy question", "Check status"]
        ), 450);
    }
    if (isOpen) { setHasUnread(false); setTimeout(() => inputRef.current?.focus(), 280); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function addBot(text: string, quickReplies?: string[], expenseData?: ExpenseData) {
    setMessages(p => [...p, { id: uid(), role: "bot", text, timestamp: new Date(), quickReplies, expenseData, isExpenseCard: !!expenseData }]);
    if (!isOpen) setHasUnread(true);
  }
  function addUser(text: string) {
    setMessages(p => [...p, { id: uid(), role: "user", text, timestamp: new Date() }]);
  }

  async function callGemini(newHist: GeminiMsg[]) {
    setIsTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: newHist,
          generationConfig: { maxOutputTokens: 600 },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data?.error?.message ?? JSON.stringify(data?.error) ?? `HTTP ${res.status}`;
        throw new Error(`Gemini error: ${errMsg}`);
      }

      const raw: string =
        data.candidates?.[0]?.content?.parts?.[0]?.text ??
        "Sorry, I couldn't process that.";
      const { text, data: expense } = parseExpense(raw);
      setHistory(p => [...p, { role: "model", parts: [{ text: raw }] }]);
      setIsTyping(false);
      if (expense) { if (text) addBot(text); addBot("", undefined, expense); }
      else addBot(text);
    } catch (e) {
      setIsTyping(false);
      const msg = e instanceof Error ? e.message : "Unknown error";
      addBot(`⚠️ ${msg}`);
      console.error("[AetherAI]", e);
    }
  }

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isTyping) return;
    setInput("");
    setMessages(p => p.map((m, i) => i === p.length - 1 ? { ...m, quickReplies: undefined } : m));
    addUser(msg);
    const um: GeminiMsg = { role: "user", parts: [{ text: msg }] };
    const nh = [...history, um];
    setHistory(nh);
    await callGemini(nh);
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    addUser(`📎 ${file.name}`);
    setIsTyping(true);
    try {
      const ocrMsg = await runOCR(file);
      setIsTyping(false);
      const um: GeminiMsg = { role: "user", parts: [{ text: ocrMsg }] };
      const nh = [...history, um];
      setHistory(nh);
      await callGemini(nh);
    } catch (err) {
      setIsTyping(false);
      const msg = err instanceof Error ? err.message : "OCR failed";
      addBot(`⚠️ Could not read receipt: ${msg}. Please ensure the image is clear and try again.`);
    }
  }

  function handleConfirm(id: string) {
    setMessages(p => p.map(m => m.id === id ? { ...m, submitted: true } : m));
    addBot("✅ Expense submitted successfully! You'll receive a confirmation email shortly.");
  }

  function handleTabClick(tabId: string) {
    setActiveTab(tabId);
    const tabMessages: Record<string, string> = {
      submit: "I'd like to submit a new expense.",
      scan: "I want to scan a receipt.",
      track: "What's the status of my recent expenses?",
      policy: "I have a policy question.",
    };
    handleSend(tabMessages[tabId]);
  }

  function handleChipClick(chipId: string) {
    const chipMessages: Record<string, string> = {
      yes: "Yes, submit it",
      note: "I'd like to add a note",
      category: "I want to change the category",
      attach: "I want to attach a receipt",
    };
    handleSend(chipMessages[chipId]);
  }

  function catColor(cat?: string) { return CAT_COLORS[cat ?? ""] ?? "#00e5cc"; }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    addUser(`📎 ${file.name}`);
    setIsTyping(true);
    runOCR(file).then(ocrMsg => {
      setIsTyping(false);
      const um: GeminiMsg = { role: "user", parts: [{ text: ocrMsg }] };
      const nh = [...history, um];
      setHistory(nh);
      return callGemini(nh);
    }).catch(err => {
      setIsTyping(false);
      const msg = err instanceof Error ? err.message : "OCR failed";
      addBot(`⚠️ Could not read receipt: ${msg}. Please ensure the image is clear and try again.`);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  return (
    <>
      <style>{`
        :root {
          --aether-bg: #0d1117;
          --aether-surface: #161b22;
          --aether-surface-alt: #1c2128;
          --aether-border: rgba(0,229,204,0.12);
          --aether-text: #e6edf3;
          --aether-muted: #7d8590;
          --aether-accent: #00e5cc;
          --aether-accent-dim: rgba(0,229,204,0.12);
          --aether-user-bubble: linear-gradient(135deg,#00b4d8,#00e5cc);
          --aether-bot-bubble: #1c2128;
          --aether-input-bg: #0d1117;
          --aether-shadow: 0 32px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(0,229,204,0.08);
          --aether-avatar: linear-gradient(135deg,#7c3aed,#a855f7,#6366f1);
          --aether-scrollbar: #30363d;
        }
        @media (prefers-color-scheme: light) {
          :root {
            --aether-bg: #f6f8fa;
            --aether-surface: #ffffff;
            --aether-surface-alt: #eef1f4;
            --aether-border: rgba(0,180,160,0.18);
            --aether-text: #1c2128;
            --aether-muted: #656d76;
            --aether-accent: #00a896;
            --aether-accent-dim: rgba(0,168,150,0.1);
            --aether-user-bubble: linear-gradient(135deg,#0097a7,#00a896);
            --aether-bot-bubble: #f0f6ff;
            --aether-input-bg: #ffffff;
            --aether-shadow: 0 32px 80px rgba(0,0,0,0.14),0 0 0 1px rgba(0,180,160,0.14);
            --aether-avatar: linear-gradient(135deg,#7c3aed,#a855f7,#6366f1);
            --aether-scrollbar: #cbd5e0;
          }
        }
        @keyframes aether-slide-up {
          from { opacity:0; transform:translateY(24px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes aether-msg-in {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes aether-bounce {
          0%,80%,100% { transform:translateY(0); }
          40%          { transform:translateY(-5px); }
        }
        @keyframes aether-pulse-ring {
          0%   { box-shadow:0 0 0 0 rgba(0,229,204,0.5); }
          70%  { box-shadow:0 0 0 14px rgba(0,229,204,0); }
          100% { box-shadow:0 0 0 0 rgba(0,229,204,0); }
        }
        @keyframes aether-dot-pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.4; }
        }
        .aether-msgs::-webkit-scrollbar { width:4px; }
        .aether-msgs::-webkit-scrollbar-track { background:transparent; }
        .aether-msgs::-webkit-scrollbar-thumb { background:var(--aether-scrollbar); border-radius:4px; }
        .aether-chip:hover { background:var(--aether-accent-dim) !important; border-color:var(--aether-accent) !important; }
        .aether-tab-active { background:var(--aether-accent) !important; color:#0d1117 !important; }
        .aether-send:hover:not(:disabled) { filter:brightness(1.1); transform:scale(1.06); }
        .aether-launcher:hover { transform:scale(1.08); }
      `}</style>

      {/* ── Launcher FAB ── */}
      <button
        id="aether-launcher"
        className="aether-launcher"
        onClick={() => setIsOpen(v => !v)}
        title="AetherAI Assistant"
        style={{
          position: "fixed", bottom: 28, right: 28, width: 58, height: 58,
          borderRadius: "50%", background: "var(--aether-avatar)",
          border: "none", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 9998,
          transition: "transform .2s", boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
          animation: hasUnread && !isOpen ? "aether-pulse-ring 1.8s ease-in-out infinite" : "none",
        }}
      >
        {hasUnread && !isOpen && (
          <span style={{
            position: "absolute", top: 3, right: 3, width: 11, height: 11,
            background: "#ef4444", borderRadius: "50%",
            border: "2px solid var(--aether-bg)",
          }} />
        )}
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          id="aether-panel"
          style={{
            position: "fixed", bottom: 100, right: 28,
            width: 400, height: 620, borderRadius: 20,
            background: "var(--aether-bg)",
            border: "1px solid var(--aether-border)",
            boxShadow: "var(--aether-shadow)",
            display: "flex", flexDirection: "column", zIndex: 9997,
            overflow: "hidden",
            animation: "aether-slide-up .28s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {/* ── Header ── */}
          <div style={{
            padding: "14px 16px",
            background: "var(--aether-surface)",
            borderBottom: "1px solid var(--aether-border)",
            display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
          }}>
            {/* Avatar */}
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "var(--aether-avatar)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: "0 0 18px rgba(168,85,247,0.4)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--aether-text)", letterSpacing: "-0.01em" }}>
                  AetherAI Assistant
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
                  background: "var(--aether-accent-dim)", color: "var(--aether-accent)",
                  border: "1px solid rgba(0,229,204,0.25)", borderRadius: 5,
                  padding: "1px 6px",
                }}>FB-057</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ fontSize: 10, color: "var(--aether-muted)" }}>Expense Management</span>
                <span style={{ color: "var(--aether-muted)" }}>·</span>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#22c55e", display: "inline-block",
                  animation: "aether-dot-pulse 2s ease-in-out infinite",
                }} />
                <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 500 }}>Online</span>
              </div>
            </div>

            {/* Settings icon */}
            <button
              title="Settings"
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "var(--aether-muted)", padding: 7, borderRadius: 9,
                display: "flex", alignItems: "center", transition: "color .15s, background .15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--aether-accent)";
                (e.currentTarget as HTMLButtonElement).style.background = "var(--aether-accent-dim)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--aether-muted)";
                (e.currentTarget as HTMLButtonElement).style.background = "none";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </button>
          </div>

          {/* ── Quick-action Tabs ── */}
          <div style={{
            display: "flex", gap: 6, padding: "10px 14px",
            background: "var(--aether-surface)",
            borderBottom: "1px solid var(--aether-border)", flexShrink: 0,
            overflowX: "auto",
          }}>
            {QUICK_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                disabled={isTyping}
                className={activeTab === tab.id ? "aether-tab-active" : ""}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 12px", borderRadius: 20, border: "1px solid var(--aether-border)",
                  background: activeTab === tab.id ? "var(--aether-accent)" : "transparent",
                  color: activeTab === tab.id ? "#0d1117" : "var(--aether-muted)",
                  fontSize: 11, fontWeight: 600, cursor: isTyping ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap", transition: "all .18s", flexShrink: 0,
                  opacity: isTyping ? 0.6 : 1,
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab.id && !isTyping) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--aether-accent)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--aether-accent)";
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.id) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--aether-border)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--aether-muted)";
                  }
                }}
              >
                <span style={{ fontSize: 13 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Chat Area ── */}
          <div
            className="aether-msgs"
            style={{
              flex: 1, overflowY: "auto", padding: "14px 14px 6px",
              display: "flex", flexDirection: "column", gap: 12,
              position: "relative",
            }}
          >
            <ParticleCanvas />

            {messages.length === 0 && (
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center", flexDirection: "column",
                gap: 10, pointerEvents: "none",
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "var(--aether-avatar)", opacity: 0.25,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <span style={{ fontSize: 12, color: "var(--aether-muted)", opacity: 0.6 }}>
                  Starting conversation…
                </span>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} style={{ animation: "aether-msg-in .18s ease-out both", position: "relative", zIndex: 1 }}>

                {/* User bubble */}
                {msg.role === "user" && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ maxWidth: "78%" }}>
                      <div style={{
                        background: "var(--aether-user-bubble)", color: "white",
                        borderRadius: "16px 16px 3px 16px", padding: "10px 14px",
                        fontSize: 13, lineHeight: 1.55, wordBreak: "break-word",
                        boxShadow: "0 4px 16px rgba(0,229,204,0.15)",
                      }}>{msg.text}</div>
                      <div style={{ textAlign: "right", fontSize: 10, color: "var(--aether-muted)", marginTop: 3 }}>
                        {fmtTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expense summary card */}
                {msg.role === "bot" && msg.isExpenseCard && msg.expenseData && (
                  <div style={{ display: "flex", gap: 9 }}>
                    <BotAvatar />
                    <div style={{ flex: 1 }}>
                      <div style={{
                        background: "var(--aether-surface)",
                        border: `1px solid var(--aether-border)`,
                        borderRadius: 14, padding: 14, fontSize: 12,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            background: catColor(msg.expenseData.category) + "22",
                            color: catColor(msg.expenseData.category),
                            border: `1px solid ${catColor(msg.expenseData.category)}44`,
                            borderRadius: 6, padding: "2px 8px",
                          }}>{msg.expenseData.category ?? "Expense"}</span>
                          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--aether-accent)" }}>
                            {String(msg.expenseData.amount ?? "").startsWith("$")
                              ? msg.expenseData.amount
                              : `$${msg.expenseData.amount}`}
                          </span>
                        </div>
                        {([
                          ["Merchant", msg.expenseData.merchant],
                          ["Date", msg.expenseData.date],
                          ["Purpose", msg.expenseData.purpose],
                          ["Project", msg.expenseData.project],
                          ["Currency", msg.expenseData.currency],
                        ] as [string, string | undefined][]).map(([lbl, val]) => val && (
                          <div key={lbl} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ color: "var(--aether-muted)", fontSize: 11 }}>{lbl}</span>
                            <span style={{ color: "var(--aether-text)", fontSize: 11, fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{val}</span>
                          </div>
                        ))}
                        {msg.expenseData.policy_status && (
                          <div style={{
                            marginTop: 8, fontSize: 11, fontWeight: 600,
                            color: msg.expenseData.policy_status === "compliant" ? "#22c55e"
                              : msg.expenseData.policy_status === "exception" ? "#f59e0b" : "#ef4444",
                          }}>
                            Policy: {msg.expenseData.policy_status.toUpperCase()}
                            {msg.expenseData.flag ? ` · ${msg.expenseData.flag.replace(/_/g, " ")}` : ""}
                          </div>
                        )}
                        {!msg.submitted ? (
                          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                            <button
                              onClick={() => handleConfirm(msg.id)}
                              style={{
                                flex: 1, background: "var(--aether-accent)", color: "#0d1117",
                                border: "none", borderRadius: 10, padding: "9px 0",
                                fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "filter .15s",
                              }}
                              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"}
                              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1)"}
                            >Confirm & Submit</button>
                            <button
                              onClick={() => handleSend("I'd like to edit the expense details")}
                              style={{
                                flex: 1, background: "transparent", color: "var(--aether-accent)",
                                border: "1.5px solid var(--aether-accent)", borderRadius: 10,
                                padding: "9px 0", fontSize: 12, fontWeight: 700, cursor: "pointer",
                              }}
                              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--aether-accent-dim)"}
                              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                            >Edit</button>
                          </div>
                        ) : (
                          <div style={{ marginTop: 10, textAlign: "center", fontSize: 13, color: "#22c55e", fontWeight: 700 }}>
                            ✅ Submitted
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--aether-muted)", marginTop: 4 }}>
                        {fmtTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bot text bubble */}
                {msg.role === "bot" && !msg.isExpenseCard && (
                  <div style={{ display: "flex", gap: 9 }}>
                    <BotAvatar />
                    <div style={{ maxWidth: "78%" }}>
                      <div style={{
                        background: "var(--aether-bot-bubble)",
                        border: "1px solid var(--aether-border)",
                        color: "var(--aether-text)",
                        borderRadius: "16px 16px 16px 3px", padding: "10px 14px",
                        fontSize: 13, lineHeight: 1.55, wordBreak: "break-word",
                      }}>{msg.text}</div>
                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                          {msg.quickReplies.map(qr => (
                            <button
                              key={qr}
                              onClick={() => handleSend(qr)}
                              disabled={isTyping}
                              className="aether-chip"
                              style={{
                                background: "transparent", color: "var(--aether-accent)",
                                border: "1.5px solid rgba(0,229,204,0.35)", borderRadius: 20,
                                padding: "5px 12px", fontSize: 11, fontWeight: 600,
                                cursor: isTyping ? "not-allowed" : "pointer",
                                opacity: isTyping ? 0.5 : 1, transition: "all .15s",
                              }}
                            >{qr}</button>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: "var(--aether-muted)", marginTop: 4 }}>
                        {fmtTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: "flex", gap: 9, animation: "aether-msg-in .18s ease-out both", position: "relative", zIndex: 1 }}>
                <BotAvatar />
                <div style={{
                  background: "var(--aether-bot-bubble)",
                  border: "1px solid var(--aether-border)",
                  borderRadius: "16px 16px 16px 3px",
                  padding: "13px 16px", display: "flex", gap: 5, alignItems: "center",
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "var(--aether-accent)", display: "block",
                      animation: `aether-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* ── Action Chips ── */}
          <div style={{
            display: "flex", gap: 6, padding: "8px 14px",
            borderTop: "1px solid var(--aether-border)",
            background: "var(--aether-surface)", flexShrink: 0,
            overflowX: "auto",
          }}>
            {ACTION_CHIPS.map(chip => (
              <button
                key={chip.id}
                onClick={() => handleChipClick(chip.id)}
                disabled={isTyping}
                className="aether-chip"
                style={{
                  background: "transparent", color: "var(--aether-accent)",
                  border: "1.5px solid rgba(0,229,204,0.28)", borderRadius: 20,
                  padding: "5px 12px", fontSize: 11, fontWeight: 600,
                  cursor: isTyping ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                  opacity: isTyping ? 0.5 : 1, transition: "all .15s", flexShrink: 0,
                }}
              >{chip.label}</button>
            ))}
          </div>

          {/* ── Upload Zone ── */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              margin: "0 14px", marginBottom: 10,
              border: `1.5px dashed ${isDragging ? "var(--aether-accent)" : "rgba(0,229,204,0.28)"}`,
              borderRadius: 12, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 10,
              cursor: "pointer", transition: "all .2s",
              background: isDragging ? "var(--aether-accent-dim)" : "transparent",
              flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--aether-accent)"}
            onMouseLeave={e => {
              if (!isDragging)
                (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,229,204,0.28)";
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "var(--aether-accent-dim)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--aether-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--aether-text)" }}>
                Upload receipt or drag and drop here
              </div>
              <div style={{ fontSize: 10, color: "var(--aether-muted)", marginTop: 1 }}>
                JPG, PNG, PDF supported
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              style={{ display: "none" }}
              onChange={handleFile}
            />
          </div>

          {/* ── Input Bar ── */}
          <div style={{
            padding: "0 14px 14px",
            display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
          }}>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 8,
              background: "var(--aether-input-bg)",
              border: "1.5px solid var(--aether-border)",
              borderRadius: 14, padding: "10px 14px",
              transition: "border-color .2s",
            }}
              onFocusCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--aether-accent)"}
              onBlurCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--aether-border)"}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                disabled={isTyping}
                placeholder={isTyping ? "Assistant is typing…" : "Ask anything about your expenses..."}
                style={{
                  flex: 1, background: "transparent",
                  border: "none", outline: "none",
                  fontSize: 13, color: "var(--aether-text)",
                  opacity: isTyping ? 0.7 : 1,
                }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="aether-send"
              style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: input.trim() && !isTyping ? "var(--aether-accent)" : "var(--aether-surface)",
                border: "1.5px solid var(--aether-border)",
                cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .18s",
                boxShadow: input.trim() && !isTyping ? "0 4px 16px rgba(0,229,204,0.3)" : "none",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() && !isTyping ? "#0d1117" : "var(--aether-muted)"}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Bot Avatar ───────────────────────────────────────────────────────────────
function BotAvatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "var(--aether-avatar)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, alignSelf: "flex-start", marginTop: 4,
      boxShadow: "0 2px 10px rgba(168,85,247,0.35)",
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    </div>
  );
}
