import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";
import { ModernEducationalDashboard } from '@/components/ModernEducationalDashboard';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import GameMap from "./components/GameMap";
import Neuroplasticity from '@/pages/Neuroplasticity';
import { DigitalNotebook } from '@/components/DigitalNotebook';
import MindfulBreath from "./pages/games/MindfulBreath";
import MemoriaColorida from "./pages/games/MemoriaColorida";
import CacaFoco from "./pages/games/CacaFoco";
import LogicaRapida from "./pages/games/LogicaRapida";
import RitmoMusical from "./pages/games/RitmoMusical";
import CacaLetras from './pages/games/CacaLetras';
import SilabaMagica from './pages/games/SilabaMagica';
import QuebraCabecaMagico from './pages/games/QuebraCabecaMagico';
import AventuraNumeros from './pages/games/AventuraNumeros';
import ContadorHistorias from './pages/games/ContadorHistorias';
import FocusForest from "./pages/games/FocusForest";
import FocusQuest from "./pages/games/FocusQuest";
import SocialScenarios from "./pages/games/SocialScenarios";
import SocialCompass from "./pages/games/SocialCompass";
import EmotionalWeather from "./pages/games/EmotionalWeather";
import BalanceQuest from "./pages/games/BalanceQuest";
import SensoryFlow from "./pages/games/SensoryFlow";
import VisualSync from "./pages/games/VisualSync";
const BiofeedbackDemo = lazy(() => import("@/pages/games/BiofeedbackDemo"));
import TouchMapper from "./pages/games/TouchMapper";
import TouchMapperKeyboard from "./pages/games/TouchMapperKeyboard";
import AttentionSustained from "./pages/games/AttentionSustainedGame";
import CognitiveFlexibility from "./pages/games/CognitiveFlexibilityGame";
import PhonologicalProcessing from "./pages/games/PhonologicalProcessingGame";
import NotFound from "./pages/NotFound";

// Lazy loaded components - Critical path optimization
const ModernIndex = lazy(() => import("./pages/ModernIndex"));
const LearningDashboard = lazy(() => import("./pages/LearningDashboard"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Games = lazy(() => import("./pages/Games"));
const ClinicalDashboard = lazy(() => import("./pages/ClinicalDashboard"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const DiagnosticTests = lazy(() => import("./pages/DiagnosticTests"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter 
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
              <Header />
              <main className="pb-20">
                <Routes>
                  <Route path="/" element={
                    <Suspense fallback={<Loading />}>
                      <ModernIndex />
                    </Suspense>
                  } />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/game-map" element={<GameMap />} />
                  <Route path="/games" element={
                    <Suspense fallback={<Loading />}>
                      <Games />
                    </Suspense>
                  } />
            <Route path="/neuroplasticity" element={<Neuroplasticity />} />
            <Route path="/learning-dashboard" element={
              <Suspense fallback={<Loading />}>
                <LearningDashboard />
              </Suspense>
            } />
          <Route path="/educational-dashboard" element={
            <div className="min-h-screen bg-gradient-card pb-20 pt-6">
              <div className="container mx-auto px-4 max-w-6xl">
                <ModernEducationalDashboard />
              </div>
            </div>
          } />
                  <Route path="/digital-notebook" element={<DigitalNotebook />} />
                  <Route path="/diagnostic-tests" element={
                    <Suspense fallback={<Loading />}>
                      <DiagnosticTests />
                    </Suspense>
                  } />
                  <Route path="/games/memoria-colorida" element={<MemoriaColorida />} />
                  <Route path="/games/caca-foco" element={<CacaFoco />} />
                  <Route path="/games/logica-rapida" element={<LogicaRapida />} />
                  <Route path="/games/ritmo-musical" element={<RitmoMusical />} />
                  <Route path="/games/caca-letras" element={<CacaLetras />} />
                  <Route path="/games/silaba-magica" element={<SilabaMagica />} />
                  <Route path="/games/quebra-cabeca-magico" element={<QuebraCabecaMagico />} />
                  <Route path="/games/aventura-numeros" element={<AventuraNumeros />} />
                  <Route path="/games/contador-historias" element={<ContadorHistorias />} />
                  <Route path="/games/mindful-breath" element={<MindfulBreath />} />
                  <Route path="/games/focus-forest" element={<FocusForest />} />
                  <Route path="/games/focus-quest" element={<FocusQuest />} />
                  <Route path="/games/social-scenarios" element={<SocialScenarios />} />
                  <Route path="/games/social-compass" element={<SocialCompass />} />
                  <Route path="/games/emotional-weather" element={<EmotionalWeather />} />
                  <Route path="/games/balance-quest" element={<BalanceQuest />} />
                  <Route path="/games/sensory-flow" element={<SensoryFlow />} />
                  <Route path="/games/visual-sync" element={<VisualSync />} />
                  <Route path="/games/biofeedback-demo" element={<BiofeedbackDemo />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/games/touch-mapper" element={<TouchMapper />} />
                  <Route path="/games/touch-mapper-keyboard" element={<TouchMapperKeyboard />} />
                  <Route path="/games/attention-sustained" element={<AttentionSustained />} />
                  <Route path="/games/cognitive-flexibility" element={<CognitiveFlexibility />} />
                  <Route path="/games/phonological-processing" element={<PhonologicalProcessing />} />
                  <Route path="/clinical" element={
                    <Suspense fallback={<Loading />}>
                      <ClinicalDashboard />
                    </Suspense>
                  } />
                  <Route path="/admin" element={
                    <Suspense fallback={<Loading />}>
                      <AdminDashboard />
                    </Suspense>
                  } />
                  <Route path="/dashboard" element={
                    <Suspense fallback={<Loading />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <BottomNavigation />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
