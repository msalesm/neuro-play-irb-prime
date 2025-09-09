import { HeroSection } from "@/components/HeroSection";
import { GameCategories } from "@/components/GameCategories";
import { DesignPrinciples } from "@/components/DesignPrinciples";
import { PilotGames } from "@/components/PilotGames";
import { ScientificValidation } from "@/components/ScientificValidation";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <GameCategories />
      <DesignPrinciples />
      <PilotGames />
      <ScientificValidation />
      <Footer />
    </div>
  );
};

export default Index;