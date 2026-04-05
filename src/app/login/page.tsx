"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

const LoginBackground = dynamic(
  () =>
    import("@/components/three/login-background").then(
      (mod) => mod.LoginBackground,
    ),
  { ssr: false },
);

/* ─── Google Icon SVG ─── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

/* ─── Floating Label Input ─── */
function FloatingInput({
  id,
  label,
  type = "text",
  icon: Icon,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const hasValue = value.length > 0;
  const isActive = focused || hasValue;

  return (
    <div className="group relative">
      {/* Glow effect on focus */}
      <div
        className={`absolute -inset-px rounded-xl transition-all duration-500 ${
          focused
            ? "bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-cyan-500/20 opacity-100 blur-sm"
            : "opacity-0"
        }`}
      />

      <div
        className={`relative flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm transition-all duration-300 ${
          focused
            ? "border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
            : ""
        }`}
        style={!focused ? { borderColor: "var(--border-color)", background: "var(--bg-input)" } : { background: "var(--bg-input)" }}
      >
        <span
          className={`shrink-0 transition-colors duration-300 ${
            focused ? "text-indigo-500" : ""
          }`}
          style={!focused ? { color: "var(--text-muted)" } : undefined}
        >
          <Icon className="h-4 w-4" />
        </span>

        <div className="relative flex-1">
          <label
            htmlFor={id}
            className={`pointer-events-none absolute left-0 transition-all duration-300 ${
              isActive
                ? "-top-5 text-[10px] font-medium tracking-wider text-indigo-400/80"
                : "top-0 text-sm"
            }`}
          >
            {label}
          </label>
          <input
            id={id}
            type={isPassword && !showPassword ? "password" : "text"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete={autoComplete}
            className="w-full bg-transparent text-sm outline-none placeholder:text-transparent"
            style={{ color: "var(--text-primary)" }}
            placeholder={label}
          />
        </div>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="transition-colors hover:text-indigo-400"
            style={{ color: "var(--text-muted)" }}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Login Page ─── */
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // GSAP title animation
  useEffect(() => {
    if (!titleRef.current) return;
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 20, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, delay: 0.4, ease: "power3.out" },
    );
  }, []);

  // Check for error from callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth_callback_error") {
      setError("Authentication failed. Please try again.");
    }
  }, []);

  // Card 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "perspective(1200px) rotateX(0deg) rotateY(0deg)";
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsSuccess(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsGoogleLoading(false);
    }
    // If no error, the browser will be redirected to Google — no need to reset loading
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8" style={{ background: "var(--bg-primary)" }}>
      {/* 3D Background */}
      <LoginBackground />

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-glow-orb absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
          }}
        />
        <div
          className="animate-glow-orb absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)",
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Grid */}
      <div className="pointer-events-none fixed inset-0 bg-grid" />

      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(2,6,23,0.6) 100%)",
        }}
      />

      <AnimatePresence mode="wait">
        {isSuccess ? (
          /* ─── Success State ─── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-[0_0_40px_rgba(52,211,153,0.3)]"
            >
              <CheckCircle2 className="h-10 w-10 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-3xl font-semibold sm:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              Login <span className="text-gradient-green">Successful!</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              style={{ color: "var(--text-muted)" }}
            >
              Welcome back to Aether Expense AI. Redirecting to your dashboard...
            </motion.p>

            {/* Animated progress bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mx-auto mt-8 h-1 w-48 overflow-hidden rounded-full bg-white/10"
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 2, ease: "easeInOut" }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              />
            </motion.div>
          </motion.div>
        ) : (
          /* ─── Login Card ─── */
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md"
          >
            {/* Glow behind card */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-cyan-500/5 via-indigo-500/5 to-purple-500/5 blur-2xl" />

            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: "preserve-3d", transition: "transform 0.3s ease" }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-2xl border shadow-[var(--card-shadow)]"
              style={{ borderColor: "var(--border-color)", background: "var(--bg-card)", backdropFilter: "blur(40px)" }}>
                {/* Animated border glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl glow-border-animated" />

                {/* Inner glow accent */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

                <div className="relative p-7 sm:p-8">
                  {/* Header */}
                  <div className="mb-8 text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
                    >
                      <Sparkles className="h-6 w-6 text-white" />
                    </motion.div>

                    <h1
                      ref={titleRef}
                      className="text-2xl font-semibold tracking-tight opacity-0"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Welcome Back
                    </h1>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="mt-1.5 text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Sign in to your AI Expense Manager
                    </motion.p>
                  </div>

                  {/* Error Banner */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {/* Form */}
                  <motion.form
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    onSubmit={handleEmailSignIn}
                    className="space-y-5"
                  >
                    <FloatingInput
                      id="email"
                      label="Email"
                      icon={Mail}
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                    />

                    <FloatingInput
                      id="password"
                      label="Password"
                      type="password"
                      icon={Lock}
                      value={password}
                      onChange={setPassword}
                      autoComplete="current-password"
                    />

                    {/* Forgot password */}
                    <div className="flex justify-end">
                      <a
                        href="#"
                        className="text-xs transition-colors duration-300 hover:text-indigo-500"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Forgot Password?
                      </a>
                    </div>

                    {/* Sign In button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      id="email-sign-in-btn"
                      className="btn-ripple group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3.5 text-sm font-medium text-white shadow-[0_8px_30px_rgba(14,165,233,0.28)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(14,165,233,0.45)] hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center gap-4">
                      <div className="h-px flex-1" style={{ background: "var(--border-color)" }} />
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
                      <div className="h-px flex-1" style={{ background: "var(--border-color)" }} />
                    </div>

                    {/* Google OAuth button */}
                    <button
                      type="button"
                      id="google-sign-in-btn"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      className="group flex w-full items-center justify-center gap-3 rounded-xl border px-6 py-3.5 text-sm font-medium backdrop-blur-sm transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:border-indigo-400/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                      style={{ borderColor: "var(--border-color)", background: "var(--bg-subtle)", color: "var(--text-primary)" }}
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <GoogleIcon />
                          Continue with Google
                        </>
                      )}
                    </button>
                  </motion.form>

                  {/* Create account link */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="mt-6 text-center text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    New user?{" "}
                    <a
                      href="#"
                      className="font-medium text-indigo-500 transition-colors duration-300 hover:text-indigo-400"
                    >
                      Create an account
                    </a>
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back to home */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="fixed left-6 top-6 z-50"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          style={{ color: "var(--text-primary)" }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold tracking-tight">
            Aether<span className="text-gradient">AI</span>
          </span>
        </Link>
      </motion.div>
    </main>
  );
}
