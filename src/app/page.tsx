
import Header from "@/components/layout/header";
import Hero from "@/components/sections/hero";
import StatsSection from "@/components/sections/stats";
import FeaturesSection from "@/components/sections/features";
import TestimonialsSection from "@/components/sections/testimonials";
import IntegrationsSection from "@/components/sections/integrations";
import CtaSection from "@/components/sections/cta";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <Header />
      <Hero />
      <StatsSection />
      <FeaturesSection />
      <IntegrationsSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
