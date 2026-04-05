"use client";

// Auth is handled directly by @supabase/ssr + middleware.
// This component is kept as a passthrough wrapper so layout.tsx
// doesn't need restructuring — it can be extended later for
// a global Supabase auth context if needed.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
