import { AIAssistantSection } from "@/components/sections/ai-assistant-section";
import { DashboardPreviewSection } from "@/components/sections/dashboard-preview-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { Footer } from "@/components/sections/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { NavHeader } from "@/components/sections/nav-header";
import { ProductDemoSection } from "@/components/sections/product-demo-section";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Global grid */}
      <div className="pointer-events-none fixed inset-0 bg-grid" />

      {/* Animated ambient orbs — opacity driven by theme */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-glow-orb absolute -right-64 -top-64 h-[700px] w-[700px] rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(99,102,241,var(--orb-opacity)) 0%, transparent 70%)`,
          }}
        />
        <div
          className="animate-glow-orb absolute -left-48 top-1/3 h-[600px] w-[600px] rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(34,211,238,calc(var(--orb-opacity) * 0.8)) 0%, transparent 70%)`,
            animationDelay: "1.8s",
          }}
        />
        <div
          className="animate-glow-orb absolute bottom-0 right-1/3 h-[800px] w-[800px] rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(168,85,247,calc(var(--orb-opacity) * 0.6)) 0%, transparent 70%)`,
            animationDelay: "3.2s",
          }}
        />
        <div
          className="animate-glow-orb absolute left-1/3 top-2/3 h-[500px] w-[500px] rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(14,165,233,calc(var(--orb-opacity) * 0.55)) 0%, transparent 70%)`,
            animationDelay: "0.6s",
          }}
        />
        <div
          className="animate-wave-float absolute right-1/4 top-1/2 h-[400px] w-[400px] rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(52,211,153,calc(var(--orb-opacity) * 0.4)) 0%, transparent 70%)`,
            animationDelay: "2.4s",
          }}
        />
      </div>

      {/* Vignette edge darkening */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(var(--bg-primary) / 0.4) 100%)",
        }}
      />

      <NavHeader />

      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <ProductDemoSection />
        <HowItWorksSection />
        <DashboardPreviewSection />
        <AIAssistantSection />
        <Footer />
      </div>
    </main>
  );
}
