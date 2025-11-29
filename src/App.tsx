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
import StackTower from "./pages/games/StackTower";
import CosmicSequence from "./pages/games/CosmicSequence";
import CrystalMatch from "./pages/games/CrystalMatch";
const BiofeedbackDemo = lazy(() => import("@/pages/games/BiofeedbackDemo"));
import TouchMapper from "./pages/games/TouchMapper";
import TouchMapperKeyboard from "./pages/games/TouchMapperKeyboard";
import AttentionSustainedPhases from "./pages/games/AttentionSustainedPhases";
import MemorySequenceBuilder from "./pages/games/MemorySequenceBuilder";
import CognitiveFlexibilityPhases from "./pages/games/CognitiveFlexibilityPhases";
import ExecutiveProcessingPhases from "./pages/games/ExecutiveProcessingPhases";
import FocusForestPhases from "./pages/games/FocusForestPhases";
import FocoRapidoPhases from "./pages/games/FocoRapidoPhases";
import PhonologicalProcessing from "./pages/games/PhonologicalProcessingGame";
import MemoryWorkload from "./pages/games/MemoryWorkload";
import TheoryOfMind from "./pages/games/TheoryOfMind";
import EmotionLab from "./pages/games/EmotionLab";
import SpatialArchitect from "./pages/games/SpatialArchitect";
import FocoRapido from "./pages/games/FocoRapido";
import CognitiveAnalysisDemo from "./pages/CognitiveAnalysisDemo";
import SistemaPlanetaAzul from "./pages/SistemaPlanetaAzul";
import PlanetaDetalhes from "./pages/PlanetaDetalhes";
import AvatarEvolutionPage from "./pages/AvatarEvolutionPage";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
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
import TherapeuticChatPage from "./pages/TherapeuticChatPage";
import TherapistPatients from "./pages/TherapistPatients";
import TherapistDashboard from "./pages/TherapistDashboard";
import TeacherClasses from "./pages/TeacherClasses";
import TeacherClassView from "./pages/TeacherClassView";
import TeacherStudentView from "./pages/TeacherStudentView";
import AdminNetworkDashboard from "./pages/AdminNetworkDashboard";
import AdminRiskMaps from "./pages/AdminRiskMaps";
import CooperativePuzzle from "./pages/games/CooperativePuzzle";
import RiskAnalysisPage from "./pages/RiskAnalysisPage";
import PlatformReport from "./pages/PlatformReport";
import PlatformManual from "./pages/PlatformManual";
import AdminUserManagement from "./pages/AdminUserManagement";

// Neuro Play v2.0 pages
import NeuroPlayV2 from "./pages/NeuroPlayV2";
import DiagnosticoCompleto from "./pages/DiagnosticoCompleto";
import DashboardPais from "./pages/DashboardPais";
import IRBPrimeLanding from "./pages/IRBPrimeLanding";
import NeuroPlayLanding from "./pages/NeuroPlayLanding";
import Home from "./pages/Home";
import { OnboardingWizard } from "./components/onboarding/OnboardingWizard";
import AchievementsPage from "./pages/AchievementsPage";

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
                  <Route path="/" element={<NeuroPlayLanding />} />
                  <Route path="/landing" element={<IRBPrimeLanding />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/onboarding" element={<OnboardingWizard />} />
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
                  <Route path="/cognitive-analysis-demo" element={<CognitiveAnalysisDemo />} />
                  <Route path="/sistema-planeta-azul" element={<SistemaPlanetaAzul />} />
                  <Route path="/planeta/:planetaId" element={<PlanetaDetalhes />} />
                  <Route path="/avatar-evolution" element={<AvatarEvolutionPage />} />
                  <Route path="/therapeutic-chat" element={<TherapeuticChatPage />} />
                  <Route path="/achievements" element={<AchievementsPage />} />
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
                  <Route path="/games/stack-tower" element={<StackTower />} />
                  <Route path="/games/cosmic-sequence" element={<CosmicSequence />} />
                  <Route path="/games/crystal-match" element={<CrystalMatch />} />
                  <Route path="/games/biofeedback-demo" element={<BiofeedbackDemo />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/games/touch-mapper" element={<TouchMapper />} />
                  <Route path="/games/touch-mapper-keyboard" element={<TouchMapperKeyboard />} />
          {/* Jogos com sistema de fases */}
          <Route path="/games/executive-processing-phases" element={<ExecutiveProcessingPhases />} />
          <Route path="/games/attention-sustained-phases" element={<AttentionSustainedPhases />} />
          <Route path="/games/focus-forest-phases" element={<FocusForestPhases />} />
          <Route path="/games/foco-rapido-phases" element={<FocoRapidoPhases />} />
          <Route path="/games/cognitive-flexibility-phases" element={<CognitiveFlexibilityPhases />} />
          
          {/* Jogos standalone */}
          <Route path="/games/phonological-processing" element={<PhonologicalProcessing />} />
          <Route path="/games/memory-workload" element={<MemoryWorkload />} />
          <Route path="/games/theory-of-mind" element={<TheoryOfMind />} />
          <Route path="/games/emotion-lab" element={<EmotionLab />} />
          <Route path="/games/spatial-architect" element={<SpatialArchitect />} />
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
                  <Route path="/chat" element={<TherapeuticChatPage />} />
                  
          {/* Therapist Routes */}
          <Route path="/therapist/patients" element={<TherapistPatients />} />
          <Route path="/therapist/patient/:patientId" element={<TherapistDashboard />} />
          
          {/* Teacher Routes */}
          <Route path="/teacher/classes" element={<TeacherClasses />} />
          <Route path="/teacher/class/:classId" element={<TeacherClassView />} />
          <Route path="/teacher/student/:studentId" element={<TeacherStudentView />} />
          <Route path="/admin/risk-maps" element={<AdminRiskMaps />} />
          <Route path="/games/cooperative-puzzle" element={<CooperativePuzzle />} />
          <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
          <Route path="/platform-report" element={<PlatformReport />} />
          <Route path="/platform-manual" element={<PlatformManual />} />
          <Route path="/pei" element={<PEIView />} />
          <Route path="/pei/:patientId" element={<PEIView />} />
          
          {/* Admin Routes */}
          <Route path="/admin/network" element={<AdminNetworkDashboard />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
                  
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
