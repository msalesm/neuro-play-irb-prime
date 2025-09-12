import { NeuroPlayHero } from "@/components/NeuroPlayHero";
import { MVPGameModules } from "@/components/MVPGameModules";
import { NeuroPlayFeatures } from "@/components/NeuroPlayFeatures";
import { AccessibilityControls } from "@/components/AccessibilityControls";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <AccessibilityControls />
      <NeuroPlayHero />
      <MVPGameModules />
      <NeuroPlayFeatures />
      <Footer />
    </div>
  );
};

export default Index;