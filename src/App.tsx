import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";
import { AppLayout } from "@/components/AppLayout";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AudioEngineDemo } from '@/components/AudioEngineDemo';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import GameMap from "./components/GameMap";
import Neuroplasticity from '@/pages/Neuroplasticity';
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
import AttentionSustainedAdaptive from "./pages/games/AttentionSustainedAdaptive";
import MemorySequenceBuilder from "./pages/games/MemorySequenceBuilder";
import CognitiveFlexibility from "./pages/games/CognitiveFlexibilityGame";
import PhonologicalProcessing from "./pages/games/PhonologicalProcessingGame";
import MemoryWorkload from "./pages/games/MemoryWorkload";
import TheoryOfMind from "./pages/games/TheoryOfMind";
import ExecutiveProcessing from "./pages/games/ExecutiveProcessing";
import ExecutiveProcessingGame from "./pages/games/ExecutiveProcessingGame";
import EmotionLab from "./pages/games/EmotionLab";
import SpatialArchitect from "./pages/games/SpatialArchitect";
import FocoRapido from "./pages/games/FocoRapido";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import PixelPlatformer from "./pages/PixelPlatformer";
import NotFound from "./pages/NotFound";

// Screening pages
import ScreeningSelection from "./pages/ScreeningSelection";
import DislexiaScreening from "./pages/games/DislexiaScreening";
import TDAHScreening from "./pages/games/TDAHScreening";
import TEAScreening from "./pages/games/TEAScreening";
import ScreeningResult from "./pages/ScreeningResult";
import PEIView from "./pages/PEIView";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentTraining from "./pages/TeacherTraining";
import TrainingModule from "./pages/TrainingModule";

// Neuro Play v2.0 pages
import NeuroPlayV2 from "./pages/NeuroPlayV2";
import DiagnosticoCompleto from "./pages/DiagnosticoCompleto";
import DashboardPais from "./pages/DashboardPais";
import IRBPrimeLanding from "./pages/IRBPrimeLanding";

// Lazy loaded components - Critical path optimization
const ModernIndex = lazy(() => import("./pages/ModernIndex"));
const NeuroPlayIndex = lazy(() => import("./pages/NeuroPlayIndex"));
const CognitiveDiagnostic = lazy(() => import("./pages/CognitiveDiagnostic"));
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
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="top-center" className="!z-[100]" toastOptions={{
              className: '!z-[100]',
            }} />
            <BrowserRouter 
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <AppLayout>
                <Routes>
                  <Route path="/" element={<IRBPrimeLanding />} />
                  <Route path="/neuroplay" element={
                    <Suspense fallback={<Loading />}>
                      <NeuroPlayIndex />
                    </Suspense>
                  } />
                  <Route path="/v2" element={<NeuroPlayV2 />} />
                  <Route path="/diagnostico-completo" element={<DiagnosticoCompleto />} />
                  <Route path="/dashboard-pais" element={<DashboardPais />} />
                  <Route path="/old-home" element={
                    <Suspense fallback={<Loading />}>
                      <ModernIndex />
                    </Suspense>
                  } />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/cognitive-diagnostic" element={
                    <Suspense fallback={<Loading />}>
                      <CognitiveDiagnostic />
                    </Suspense>
                  } />
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
                  <Route path="/audio-demo" element={<AudioEngineDemo />} />
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
          <Route path="/games/executive-processing" element={<ExecutiveProcessing />} />
          <Route path="/games/executive-processing-game" element={<ExecutiveProcessingGame />} />
          <Route path="/games/emotion-lab" element={<EmotionLab />} />
          <Route path="/games/spatial-architect" element={<SpatialArchitect />} />
          <Route path="/games/attention-sustained" element={<AttentionSustained />} />
                  <Route path="/games/cognitive-flexibility" element={<CognitiveFlexibility />} />
                  <Route path="/games/phonological-processing" element={<PhonologicalProcessing />} />
                  <Route path="/games/memory-workload" element={<MemoryWorkload />} />
                  <Route path="/games/theory-of-mind" element={<TheoryOfMind />} />
                  <Route path="/games/executive-processing" element={<ExecutiveProcessing />} />
                  <Route path="/games/executive-processing-game" element={<ExecutiveProcessingGame />} />
                  <Route path="/games/emotion-lab" element={<EmotionLab />} />
                  <Route path="/games/spatial-architect" element={<SpatialArchitect />} />
                  <Route path="/games/foco-rapido" element={<FocoRapido />} />
                  <Route path="/games/pixel-platformer" element={<PixelPlatformer />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/diagnostic-tests" element={<DiagnosticTests />} />
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
                  {/* Screening Routes - Neuro Play EDU */}
                  <Route path="/screening" element={<ScreeningSelection />} />
                  <Route path="/screening/dislexia" element={<DislexiaScreening />} />
                  <Route path="/screening/tdah" element={<TDAHScreening />} />
                  <Route path="/screening/tea" element={<TEAScreening />} />
                  <Route path="/screening/result" element={<ScreeningResult />} />
                  <Route path="/pei" element={<PEIView />} />
                  <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/parent-training" element={<ParentTraining />} />
          <Route path="/training" element={<ParentTraining />} />
                  <Route path="/training/:moduleId" element={<TrainingModule />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <FloatingActionButton />
              </AppLayout>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
