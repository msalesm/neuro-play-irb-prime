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
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
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
import TowerDefense from "./pages/games/TowerDefense";
const BiofeedbackDemo = lazy(() => import("@/pages/games/BiofeedbackDemo"));
import TouchMapper from "./pages/games/TouchMapper";
import TouchMapperKeyboard from "./pages/games/TouchMapperKeyboard";
import AttentionSustainedPhases from "./pages/games/AttentionSustainedPhases";
import AttentionSustainedPlay from "./pages/games/AttentionSustainedPlay";
import MemorySequenceBuilder from "./pages/games/MemorySequenceBuilder";
import CognitiveFlexibilityPhases from "./pages/games/CognitiveFlexibilityPhases";
import CognitiveFlexibilityPlay from "./pages/games/CognitiveFlexibilityPlay";
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
import Teleconsultas from "./pages/Teleconsultas";
import TeleconsultaSession from "./pages/TeleconsultaSession";
import TeleconsultaDemo from "./pages/TeleconsultaDemo";
import MinhasTeleconsultas from "./pages/MinhasTeleconsultas";
import CameraTest from "./pages/CameraTest";
import TeacherClasses from "./pages/TeacherClasses";
import TeacherClassView from "./pages/TeacherClassView";
import TeacherStudentView from "./pages/TeacherStudentView";
import AdminNetworkDashboard from "./pages/AdminNetworkDashboard";
import AdminRiskMaps from "./pages/AdminRiskMaps";
import OperationsCenter from "./pages/OperationsCenter";
// ParentChildActivities removed - feature deprecated
import CooperativePuzzle from "./pages/games/CooperativePuzzle";
import RiskAnalysisPage from "./pages/RiskAnalysisPage";
import EmotionalHistoryDashboard from "./pages/EmotionalHistoryDashboard";

import PlatformManual from "./pages/PlatformManual";
import AdminUserManagement from "./pages/AdminUserManagement";
import BeneficiosTerapeuticos from "./pages/BeneficiosTerapeuticos";

// Neuro Play v2.0 pages
import NeuroPlayV2 from "./pages/NeuroPlayV2";
import NeuroPlayLanding from "./pages/NeuroPlayLanding";
import DiagnosticoCompleto from "./pages/DiagnosticoCompleto";
import DashboardPais from "./pages/DashboardPais";
import IRBPrimeLanding from "./pages/IRBPrimeLanding";
import Home from "./pages/Home";
import { OnboardingWizard } from "./components/onboarding/OnboardingWizard";
import AchievementsPage from "./pages/AchievementsPage";
import AccessibilitySettings from "./pages/AccessibilitySettings";
import SocialStories from "./pages/SocialStories";
import StoryReader from "./pages/StoryReader";
import AdminStories from "./pages/AdminStories";
import AcceptInvite from "./pages/AcceptInvite";
import RelationshipsManager from "./pages/admin/RelationshipsManager";
import IntelligentReports from "./pages/IntelligentReports";
import ProntuarioUnificado from "./pages/ProntuarioUnificado";
import StudentHub from "./pages/StudentHub";
import StoryEditor from "./pages/StoryEditor";
import SimpleAnalytics from "./pages/SimpleAnalytics";
import RoutinesPage from "./pages/RoutinesPage";
import RoutineViewer from "./pages/RoutineViewer";

// Phase 4 pages
import InstitutionalDashboard from "./pages/InstitutionalDashboard";
import SubscriptionPage from "./pages/SubscriptionPage";
import SecureMessaging from "./pages/SecureMessaging";
import ContentManager from "./pages/ContentManager";
import ProfessionalAnalytics from "./pages/ProfessionalAnalytics";
import Community from "./pages/Community";
import ContextualAIDashboard from "./pages/ContextualAIDashboard";
import Phase5Dashboard from "./pages/Phase5Dashboard";
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
        <AccessibilityProvider>
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
                  <Route path="/" element={<Home />} />
                  <Route path="/landing" element={<IRBPrimeLanding />} />
                  <Route path="/onboarding" element={<OnboardingWizard />} />
                  <Route path="/neuroplay" element={
                    <Suspense fallback={<Loading />}>
                      <NeuroPlayIndex />
                    </Suspense>
                  } />
                  <Route path="/v2" element={<NeuroPlayV2 />} />
                  <Route path="/neuro-play" element={<NeuroPlayLanding />} />
                  <Route path="/diagnostico-completo" element={<DiagnosticoCompleto />} />
                  <Route path="/dashboard-pais" element={<DashboardPais />} />
                  <Route path="/old-home" element={
                    <Suspense fallback={<Loading />}>
                      <ModernIndex />
                    </Suspense>
                  } />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/aceitar-convite" element={<AcceptInvite />} />
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
                  <Route path="/emotional-history" element={<EmotionalHistoryDashboard />} />
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
          <Route path="/games/tower-defense" element={<TowerDefense />} />
          <Route path="/games/biofeedback-demo" element={<BiofeedbackDemo />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/games/touch-mapper" element={<TouchMapper />} />
                  <Route path="/games/touch-mapper-keyboard" element={<TouchMapperKeyboard />} />
          {/* Jogos com sistema de fases */}
          <Route path="/games/executive-processing-phases" element={<ExecutiveProcessingPhases />} />
          <Route path="/games/attention-sustained-phases" element={<AttentionSustainedPhases />} />
          <Route path="/games/attention-sustained-play" element={<AttentionSustainedPlay />} />
          <Route path="/games/focus-forest-phases" element={<FocusForestPhases />} />
          <Route path="/games/foco-rapido-phases" element={<FocoRapidoPhases />} />
          <Route path="/games/cognitive-flexibility-phases" element={<CognitiveFlexibilityPhases />} />
          <Route path="/games/cognitive-flexibility-play" element={<CognitiveFlexibilityPlay />} />
          
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
          <Route path="/teleconsultas" element={<Teleconsultas />} />
          <Route path="/teleconsulta/:sessionId" element={<TeleconsultaSession />} />
          <Route path="/teleconsulta-demo" element={<TeleconsultaDemo />} />
          <Route path="/minhas-teleconsultas" element={<MinhasTeleconsultas />} />
          <Route path="/camera-test" element={<CameraTest />} />
          <Route path="/therapist/patients" element={<TherapistPatients />} />
          <Route path="/therapist/patient/:patientId" element={<TherapistDashboard />} />
          <Route path="/prontuario/:childId" element={<ProntuarioUnificado />} />
          
          {/* Teacher Routes */}
          <Route path="/teacher/classes" element={<TeacherClasses />} />
          <Route path="/teacher/class/:classId" element={<TeacherClassView />} />
          <Route path="/teacher/student/:studentId" element={<TeacherStudentView />} />
          <Route path="/admin/risk-maps" element={<AdminRiskMaps />} />
          <Route path="/games/cooperative-puzzle" element={<CooperativePuzzle />} />
          <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
          <Route path="/emotional-history" element={<EmotionalHistoryDashboard />} />
          <Route path="/platform-manual" element={<PlatformManual />} />
          <Route path="/beneficios-terapeuticos" element={<BeneficiosTerapeuticos />} />
          <Route path="/pei" element={<PEIView />} />
          <Route path="/pei/:patientId" element={<PEIView />} />
          
          {/* Admin Routes */}
          <Route path="/admin/network" element={<AdminNetworkDashboard />} />
          <Route path="/admin/network-management" element={<AdminNetworkDashboard />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
          <Route path="/admin/relationships" element={<RelationshipsManager />} />
          <Route path="/operations" element={<OperationsCenter />} />
          
          {/* Acessibilidade e Histórias Sociais */}
          <Route path="/accessibility" element={<AccessibilitySettings />} />
          <Route path="/social-stories" element={<SocialStories />} />
          <Route path="/stories" element={<SocialStories />} />
          <Route path="/stories/:storyId" element={<StoryReader />} />
          <Route path="/admin/stories" element={<AdminStories />} />
          
          {/* Relatórios Inteligentes */}
          <Route path="/reports" element={<IntelligentReports />} />
          <Route path="/relatorios" element={<IntelligentReports />} />
          <Route path="/intelligent-reports" element={<IntelligentReports />} />
          
          {/* Phase 3 Routes */}
          <Route path="/student-hub" element={<StudentHub />} />
          <Route path="/hub" element={<StudentHub />} />
          <Route path="/rotinas" element={<RoutinesPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/rotinas/:routineId" element={<RoutineViewer />} />
          <Route path="/admin/story-editor" element={<StoryEditor />} />
          <Route path="/admin/story-editor/:storyId" element={<StoryEditor />} />
          <Route path="/analytics" element={<SimpleAnalytics />} />
          
          {/* Phase 4 Routes */}
          <Route path="/institutional" element={<InstitutionalDashboard />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/assinatura" element={<SubscriptionPage />} />
          <Route path="/messages" element={<SecureMessaging />} />
          <Route path="/mensagens" element={<SecureMessaging />} />
          <Route path="/content-manager" element={<ContentManager />} />
          <Route path="/admin/content" element={<ContentManager />} />
          <Route path="/professional-analytics" element={<ProfessionalAnalytics />} />
          <Route path="/contextual-ai" element={<ContextualAIDashboard />} />
          <Route path="/ia-contextual" element={<ContextualAIDashboard />} />
          
          {/* Phase 3 - Community */}
          <Route path="/community" element={<Community />} />
          <Route path="/comunidade" element={<Community />} />
          
          {/* Phase 5 Routes */}
          <Route path="/phase5" element={<Phase5Dashboard />} />
          <Route path="/fase5" element={<Phase5Dashboard />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
                </Routes>
                <FloatingActionButton />
              </AppLayout>
            </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
