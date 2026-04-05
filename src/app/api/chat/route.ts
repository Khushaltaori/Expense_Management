import { NextResponse } from "next/server";

// ─── Expense Policy Knowledge Base ────────────────────────────────────────────
const POLICY: Record<string, string> = {
  meals: "Meals & entertainment: $75/person max. Client dinners up to $150/person with manager approval note.",
  hotel: "Hotels: $250/night max. Exceptions require Finance Officer approval.",
  flight: "Flights: Economy class only. Business class allowed for flights 8h+ with VP approval.",
  mileage: "Mileage reimbursed at $0.67/mile (IRS rate). Log start/end locations.",
  alcohol: "Alcohol claims require explicit manager pre-approval before the expense.",
  receipt: "Receipts are mandatory for all expenses above $25. Submit within 30 days.",
  deadline: "Expense submission deadline: 30 days from the date of the expense.",
  transport: "Ground transport (Uber, taxi): $75 max per trip without prior approval.",
  office: "Office supplies: $150 max without manager approval. Software subscriptions need IT sign-off.",
};

// ─── Conversation State ────────────────────────────────────────────────────────
type ConvState = {
  mode?: "submit" | "scan" | "status" | "policy";
  step?: number;
  expense?: Record<string, string>;
};

const sessions = new Map<string, ConvState>();

// ─── Intent Detection ──────────────────────────────────────────────────────────
function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/submit|new expense|add expense|log expense|record/.test(t)) return "submit";
  if (/scan|upload|receipt|ocr|photo/.test(t)) return "scan";
  if (/status|track|pending|approved|rejected|where.*expense/.test(t)) return "status";
  if (/policy|rule|limit|allowed|reimburse|how much|can i|eligible/.test(t)) return "policy";
  if (/hello|hi |hey|help|start|what can/.test(t)) return "greeting";
  if (/yes|confirm|submit it|looks good|correct|proceed/.test(t)) return "confirm";
  if (/cancel|stop|restart|never mind/.test(t)) return "cancel";
  return "unknown";
}

function detectPolicyTopic(text: string): string | null {
  const t = text.toLowerCase();
  if (/meal|food|lunch|dinner|breakfast|restaurant|eat/.test(t)) return "meals";
  if (/hotel|accommodation|stay|lodge/.test(t)) return "hotel";
  if (/flight|air|plane|fly|airline/.test(t)) return "flight";
  if (/mile|mileage|drive|car|km/.test(t)) return "mileage";
  if (/alcohol|drink|bar|wine|beer/.test(t)) return "alcohol";
  if (/receipt|proof|document/.test(t)) return "receipt";
  if (/deadline|days|when|time/.test(t)) return "deadline";
  if (/uber|taxi|cab|transport|lyft/.test(t)) return "transport";
  if (/office|supply|software|subscription/.test(t)) return "office";
  return null;
}

// ─── Expense Submission Flow ───────────────────────────────────────────────────
const SUBMIT_STEPS = [
  { field: "merchant", question: "What's the merchant or vendor name?" },
  { field: "amount", question: "What was the total amount? (include currency, e.g. $45.00)" },
  { field: "date", question: "What's the expense date? (e.g. 2025-04-04)" },
  { field: "category", question: "What category? (Meals / Travel / Hotel / Transport / Office / Other)" },
  { field: "purpose", question: "What's the business purpose for this expense?" },
  { field: "project", question: "Which project or cost center? (or type 'General')" },
];

function checkPolicy(expense: Record<string, string>): { status: string; flag: string } {
  const amount = parseFloat(expense.amount?.replace(/[^0-9.]/g, "") || "0");
  const cat = expense.category?.toLowerCase() || "";
  if (cat.includes("meal") && amount > 75) return { status: "exception", flag: "exceeds_meal_limit" };
  if (cat.includes("hotel") && amount > 250) return { status: "exception", flag: "exceeds_hotel_limit" };
  if (cat.includes("transport") && amount > 75) return { status: "exception", flag: "exceeds_transport_limit" };
  return { status: "compliant", flag: "" };
}

// ─── Response Generator ────────────────────────────────────────────────────────
function generateResponse(
  userText: string,
  history: Array<{ role: string; parts: { text: string }[] }>,
  state: ConvState
): { reply: string; newState: ConvState; expenseData?: Record<string, string> } {
  const intent = detectIntent(userText);
  const t = userText.toLowerCase();

  // ── Greeting ──
  if (intent === "greeting" && !state.mode) {
    return {
      reply: "Hello! I'm AetherAI Assistant. I can help you submit expenses, scan receipts, check approval status, or answer policy questions. What would you like to do?",
      newState: {},
    };
  }

  // ── Cancel current flow ──
  if (intent === "cancel") {
    return {
      reply: "No problem — flow cancelled. What else can I help you with?",
      newState: {},
    };
  }

  // ── Status check ──
  if (intent === "status" || state.mode === "status") {
    const statuses = [
      { id: "EXP-1042", merchant: "Uber", amount: "$42.50", status: "approved", date: "Apr 02" },
      { id: "EXP-1039", merchant: "AWS", amount: "$320.00", status: "pending_approval", date: "Apr 01" },
      { id: "EXP-1035", merchant: "Marriott", amount: "$248.00", status: "submitted", date: "Mar 28" },
    ];
    const list = statuses.map(e =>
      `• ${e.id} — ${e.merchant} (${e.amount}) · ${e.status.toUpperCase()} · ${e.date}`
    ).join("\n");
    return {
      reply: `Here are your recent expenses:\n\n${list}\n\nWould you like details on any of these?`,
      newState: {},
    };
  }

  // ── Policy question ──
  if (intent === "policy" || state.mode === "policy") {
    const topic = detectPolicyTopic(userText);
    if (topic && POLICY[topic]) {
      return { reply: `📋 Policy (FR-4): ${POLICY[topic]}`, newState: {} };
    }
    // Try to match any policy keyword in the text
    for (const [key, value] of Object.entries(POLICY)) {
      if (t.includes(key)) {
        return { reply: `📋 Policy (FR-4): ${value}`, newState: {} };
      }
    }
    return {
      reply: "I can answer policy questions on: meals, hotel, flights, mileage, alcohol, receipts, deadlines, transport, or office supplies. Which topic?",
      newState: { mode: "policy" },
    };
  }

  // ── Receipt scan ──
  if (intent === "scan" || state.mode === "scan") {
    return {
      reply: "Use the upload zone below to drag & drop your receipt, or click to select a file. I'll extract the details automatically.",
      newState: {},
    };
  }

  // ── Expense submission flow ──
  if (intent === "submit" && state.mode !== "submit") {
    return {
      reply: `Let's submit a new expense. ${SUBMIT_STEPS[0].question}`,
      newState: { mode: "submit", step: 0, expense: {} },
    };
  }

  if (state.mode === "submit") {
    const step = state.step ?? 0;
    const expense = { ...(state.expense ?? {}) };

    // Record current answer
    expense[SUBMIT_STEPS[step].field] = userText.trim();
    const nextStep = step + 1;

    // All fields collected
    if (nextStep >= SUBMIT_STEPS.length) {
      const { status, flag } = checkPolicy(expense);
      const expenseData = {
        ...expense,
        policy_status: status,
        flag,
        currency: expense.amount?.includes("$") ? "USD" : "USD",
      };
      return {
        reply: status === "compliant"
          ? "Here's the expense summary. Everything looks compliant — confirm to submit?"
          : `Here's the expense summary. Note: this expense requires manager approval (${flag.replace(/_/g, " ")}). Confirm to submit?`,
        newState: {},
        expenseData,
      };
    }

    // Ask next field
    return {
      reply: SUBMIT_STEPS[nextStep].question,
      newState: { mode: "submit", step: nextStep, expense },
    };
  }

  // ── Fallback ──
  const tips = [
    "I can help you **submit a new expense**, **scan a receipt**, **check expense status**, or answer **policy questions**.",
    "Try: 'Submit an expense', 'What's the hotel policy?', or 'Track my expenses'.",
  ];
  return {
    reply: `I'm not sure I understood that. ${tips[Math.floor(Math.random() * tips.length)]}`,
    newState: state,
  };
}

// ─── API Route ─────────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      sessionId?: string;
      contents: Array<{ role: string; parts: { text: string }[] }>;
    };

    const sessionId = body.sessionId ?? "default";
    const state = sessions.get(sessionId) ?? {};
    const history = body.contents ?? [];
    const lastUserMsg = [...history].reverse().find(m => m.role === "user");
    const userText = lastUserMsg?.parts?.[0]?.text ?? "";

    const { reply, newState, expenseData } = generateResponse(userText, history, state);
    sessions.set(sessionId, newState);

    // Format as Gemini-compatible response so the chatbot code needs no changes
    let replyText = reply;
    if (expenseData) {
      replyText = reply + `\n<expense_data>${JSON.stringify(expenseData)}</expense_data>`;
    }

    return NextResponse.json({
      candidates: [{ content: { parts: [{ text: replyText }], role: "model" } }],
    });
  } catch (err) {
    console.error("[api/chat]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
