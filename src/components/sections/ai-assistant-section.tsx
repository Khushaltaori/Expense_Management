"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, SendHorizonal, User2, Sparkles, Zap } from "lucide-react";

import { Input } from "@/components/ui/input";

const messages = [
  { role: "user", text: "Add Rs.500 Uber expense" },
  {
    role: "assistant",
    text: "Done. Added as Travel expense, tagged to Client Visit, and attached to March 2026 report.",
  },
  {
    role: "assistant",
    text: "Would you like me to auto-apply this merchant rule for future Uber receipts?",
  },
];

/* ─── Typing Animation Hook ─── */
function useTypingAnimation(text: string, speed: number = 25, startDelay: number = 0) {
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const hasStarted = useRef(false);

  const start = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayed(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(interval);
        }
      }, speed);
    }, startDelay);
  }, [text, speed, startDelay]);

  return { displayed, isComplete, start };
}

/* ─── AI Thinking Indicator ─── */
function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <div className="absolute inset-0 h-2 w-2 rounded-full bg-cyan-400 animate-ping opacity-40" />
        </div>
        <div className="flex gap-1">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-cyan-300" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-cyan-300" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-cyan-300" />
        </div>
      </div>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>AI is analyzing your request...</span>
    </div>
  );
}

/* ─── Message Bubble ─── */
function MessageBubble({
  message,
  index,
  onVisible,
}: {
  message: (typeof messages)[number];
  index: number;
  onVisible?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const typing = useTypingAnimation(
    message.text,
    message.role === "assistant" ? 20 : 15,
    message.role === "assistant" ? 400 : 0,
  );
  const [showThinking, setShowThinking] = useState(message.role === "assistant");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          typing.start();
          if (message.role === "assistant") {
            setTimeout(() => setShowThinking(false), 350);
          }
          onVisible?.();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[88%] rounded-2xl px-4 py-3 text-sm sm:max-w-[78%] ${
          message.role === "user"
            ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_8px_24px_rgba(99,102,241,0.25)]"
            : "message-glow-ai border"
        }`}
        style={message.role !== "user" ? { borderColor: "var(--border-color)", background: "var(--bg-card)", color: "var(--text-primary)" } : undefined}
      >
        <p className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
          {message.role === "user" ? (
            <User2 className="h-3.5 w-3.5" />
          ) : (
            <Bot className="h-3.5 w-3.5 text-cyan-500" />
          )}
          {message.role}
        </p>
        <AnimatePresence mode="wait">
          {showThinking && message.role === "assistant" ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ThinkingIndicator />
            </motion.div>
          ) : (
            <motion.span
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {typing.displayed}
              {!typing.isComplete && (
                <span className="ml-0.5 inline-block h-4 w-0.5 bg-cyan-300 cursor-blink" />
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function AIAssistantSection() {
  return (
    <section id="assistant" className="relative px-6 py-24 md:px-10 lg:px-16">
      {/* Background particles effect */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)" }} />
      </div>

      <div className="relative mx-auto w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-xs font-medium text-indigo-500">
            <Zap className="h-3 w-3" />
            Powered by Advanced AI
          </div>
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-500">AI Assistant</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl" style={{ color: "var(--text-primary)" }}>
            Ask finance actions in{" "}
            <span className="text-gradient">natural language.</span>
          </h2>
          <p className="mt-4 mx-auto max-w-2xl" style={{ color: "var(--text-muted)" }}>
            Our AI understands context, applies policies, and learns from your corrections to get smarter over time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-10 overflow-hidden rounded-3xl border glow-border-animated"
          style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", backdropFilter: "blur(16px)", boxShadow: "var(--card-shadow)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b px-5 py-3" style={{ borderColor: "var(--border-color)", background: "var(--bg-subtle)" }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Aether AI Assistant</p>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Online
              </div>
            </div>
            <Sparkles className="ml-auto h-4 w-4 text-cyan-500 animate-pulse" />
          </div>

          {/* Messages */}
          <div className="space-y-4 p-5 sm:p-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={`${message.role}-${index}`}
                message={message}
                index={index}
              />
            ))}

            {/* Thinking bar */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-2 px-1 py-2"
            >
              <ThinkingIndicator />
            </motion.div>

            {/* Input */}
            <div className="flex items-center gap-3 rounded-2xl border p-3 transition-all duration-300 focus-within:border-cyan-300/30 focus-within:shadow-[0_0_20px_rgba(34,211,238,0.1)]" style={{ borderColor: "var(--border-color)", background: "var(--bg-subtle)" }}>
              <Input
                placeholder='Type a command, e.g. "Add Rs.500 Uber expense"'
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <button className="group rounded-xl border border-indigo-400/40 bg-indigo-400/20 p-2.5 text-indigo-600 transition-all duration-300 hover:bg-indigo-400/30 hover:shadow-[0_0_16px_rgba(99,102,241,0.25)]">
                <SendHorizonal className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
