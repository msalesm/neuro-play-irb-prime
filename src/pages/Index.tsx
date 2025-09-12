import { NeuroPlayHero } from "@/components/NeuroPlayHero";
import { GameModules } from "@/components/GameModules";
import { NeuroPlayFeatures } from "@/components/NeuroPlayFeatures";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <NeuroPlayHero />
      <GameModules />
      <NeuroPlayFeatures />
      <Footer />
    </div>
  );
};

export default Index;