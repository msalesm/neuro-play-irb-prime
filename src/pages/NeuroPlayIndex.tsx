import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Brain, Gamepad2, Target, Puzzle, Type, Lightbulb, Zap, Rainbow, BarChart3, School, Heart, ArrowRight } from 'lucide-react';
import { NeuralHero } from '@/components/neuroplay/NeuralHero';
import { HowItWorksSection } from '@/components/neuroplay/HowItWorksSection';
import { CognitiveGamesGrid } from '@/components/neuroplay/CognitiveGamesGrid';
import { AIDiagnosticSection } from '@/components/neuroplay/AIDiagnosticSection';
import { ResultsDashboardPreview } from '@/components/neuroplay/ResultsDashboardPreview';
import { InstitutionalSection } from '@/components/neuroplay/InstitutionalSection';
import { TestimonialsCarousel } from '@/components/neuroplay/TestimonialsCarousel';
import { Footer } from '@/components/Footer';

export default function NeuroPlayIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Neural Hero Section */}
      <NeuralHero />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Cognitive Games Grid */}
      <CognitiveGamesGrid />

      {/* AI Diagnostic Section */}
      <AIDiagnosticSection />

      {/* Results Dashboard Preview */}
      <ResultsDashboardPreview />

      {/* Institutional Section */}
      <InstitutionalSection />

      {/* Testimonials */}
      <TestimonialsCarousel />

      {/* Footer */}
      <Footer />
    </div>
  );
}
