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

// Eagerly loaded (critical path)
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { OnboardingWizard } from "./components/onboarding/OnboardingWizard";

// Lazy loaded - All feature pages
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const DiagnosticoCompleto = lazy(() => import("./pages/DiagnosticoCompleto"));
const CognitiveDiagnostic = lazy(() => import("./pages/CognitiveDiagnostic"));
const DiagnosticTests = lazy(() => import("./pages/DiagnosticTests"));
const DashboardPais = lazy(() => import("./pages/DashboardPais"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClinicalDashboard = lazy(() => import("./pages/ClinicalDashboard"));
const LearningDashboard = lazy(() => import("./pages/LearningDashboard"));
const Games = lazy(() => import("./pages/Games"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// Games - Navigation & Map
const Neuroplasticity = lazy(() => import("./pages/Neuroplasticity"));
const CognitiveBattery = lazy(() => import("./pages/CognitiveBattery"));

// Games - Individual
const MindfulBreath = lazy(() => import("./pages/games/MindfulBreath"));
const MemoriaColorida = lazy(() => import("./pages/games/MemoriaColorida"));
const CacaFoco = lazy(() => import("./pages/games/CacaFoco"));
const LogicaRapida = lazy(() => import("./pages/games/LogicaRapida"));
const RitmoMusical = lazy(() => import("./pages/games/RitmoMusical"));
const CacaLetras = lazy(() => import("./pages/games/CacaLetras"));
const SilabaMagica = lazy(() => import("./pages/games/SilabaMagica"));
const QuebraCabecaMagico = lazy(() => import("./pages/games/QuebraCabecaMagico"));
const AventuraNumeros = lazy(() => import("./pages/games/AventuraNumeros"));
const ContadorHistorias = lazy(() => import("./pages/games/ContadorHistorias"));
const FocusQuest = lazy(() => import("./pages/games/FocusQuest"));
const SocialScenarios = lazy(() => import("./pages/games/SocialScenarios"));
const SocialCompass = lazy(() => import("./pages/games/SocialCompass"));
const EmotionalWeather = lazy(() => import("./pages/games/EmotionalWeather"));
const BalanceQuest = lazy(() => import("./pages/games/BalanceQuest"));
const SensoryFlow = lazy(() => import("./pages/games/SensoryFlow"));
const VisualSync = lazy(() => import("./pages/games/VisualSync"));
const StackTower = lazy(() => import("./pages/games/StackTower"));
const CosmicSequence = lazy(() => import("./pages/games/CosmicSequence"));
const CrystalMatch = lazy(() => import("./pages/games/CrystalMatch"));
const TowerDefense = lazy(() => import("./pages/games/TowerDefense"));
const BiofeedbackDemo = lazy(() => import("./pages/games/BiofeedbackDemo"));
const TouchMapper = lazy(() => import("./pages/games/TouchMapper"));
const TouchMapperKeyboard = lazy(() => import("./pages/games/TouchMapperKeyboard"));
const CooperativePuzzle = lazy(() => import("./pages/games/CooperativePuzzle"));

// Games - Phase System
const AttentionSustainedPhases = lazy(() => import("./pages/games/AttentionSustainedPhases"));
const AttentionSustainedPlay = lazy(() => import("./pages/games/AttentionSustainedPlay"));
const FocoRapidoPhases = lazy(() => import("./pages/games/FocoRapidoPhases"));
const FocoRapido = lazy(() => import("./pages/games/FocoRapido"));
const CognitiveFlexibilityPhases = lazy(() => import("./pages/games/CognitiveFlexibilityPhases"));
const CognitiveFlexibilityPlay = lazy(() => import("./pages/games/CognitiveFlexibilityPlay"));
const ExecutiveProcessingPhases = lazy(() => import("./pages/games/ExecutiveProcessingPhases"));
const VisuomotorCoordination = lazy(() => import("./pages/games/VisuomotorCoordination"));
const BehavioralPersistence = lazy(() => import("./pages/games/BehavioralPersistence"));
const MemorySequenceBuilder = lazy(() => import("./pages/games/MemorySequenceBuilder"));

// Games - Standalone
const PhonologicalProcessing = lazy(() => import("./pages/games/PhonologicalProcessingGame"));
const MemoryWorkload = lazy(() => import("./pages/games/MemoryWorkload"));
const TheoryOfMind = lazy(() => import("./pages/games/TheoryOfMind"));
const EmotionLab = lazy(() => import("./pages/games/EmotionLab"));
const SpatialArchitect = lazy(() => import("./pages/games/SpatialArchitect"));

// Gamification & Student
const SistemaPlanetaAzul = lazy(() => import("./pages/SistemaPlanetaAzul"));
const PlanetaDetalhes = lazy(() => import("./pages/PlanetaDetalhes"));
const AvatarEvolutionPage = lazy(() => import("./pages/AvatarEvolutionPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const WorldMap = lazy(() => import("./pages/WorldMap"));
const StudentHub = lazy(() => import("./pages/StudentHub"));

// Screening
const ScreeningSelection = lazy(() => import("./pages/ScreeningSelection"));
const DislexiaScreening = lazy(() => import("./pages/games/DislexiaScreening"));
const TDAHScreening = lazy(() => import("./pages/games/TDAHScreening"));
const TEAScreening = lazy(() => import("./pages/games/TEAScreening"));
const ScreeningResult = lazy(() => import("./pages/ScreeningResult"));

// Therapist
const TherapistPatients = lazy(() => import("./pages/TherapistPatients"));
const TherapistDashboard = lazy(() => import("./pages/TherapistDashboard"));
const Teleconsultas = lazy(() => import("./pages/Teleconsultas"));
const TeleconsultaSession = lazy(() => import("./pages/TeleconsultaSession"));
const MinhasTeleconsultas = lazy(() => import("./pages/MinhasTeleconsultas"));
const AgendarTeleconsulta = lazy(() => import("./pages/AgendarTeleconsulta"));
const AgendaClinica = lazy(() => import("./pages/AgendaClinica"));
const InventarioHabilidades = lazy(() => import("./pages/InventarioHabilidades"));
const ProntuarioUnificado = lazy(() => import("./pages/ProntuarioUnificado"));
const AnamneseInfantil = lazy(() => import("./pages/AnamneseInfantil"));
const AnamneseList = lazy(() => import("./pages/AnamneseList"));
const TherapeuticChatPage = lazy(() => import("./pages/TherapeuticChatPage"));
const PEIView = lazy(() => import("./pages/PEIView"));

// Teacher
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const TeacherClasses = lazy(() => import("./pages/TeacherClasses"));
const TeacherClassView = lazy(() => import("./pages/TeacherClassView"));
const TeacherStudentView = lazy(() => import("./pages/TeacherStudentView"));
const ParentTraining = lazy(() => import("./pages/TeacherTraining"));
const TrainingModule = lazy(() => import("./pages/TrainingModule"));

// Admin
const AdminNetworkDashboard = lazy(() => import("./pages/AdminNetworkDashboard"));
const AdminUserManagement = lazy(() => import("./pages/AdminUserManagement"));
const AdminRiskMaps = lazy(() => import("./pages/AdminRiskMaps"));
const AdminStories = lazy(() => import("./pages/AdminStories"));
const StoryEditor = lazy(() => import("./pages/StoryEditor"));
const ContentManager = lazy(() => import("./pages/ContentManager"));
const ComplianceDashboard = lazy(() => import("./pages/ComplianceDashboard"));
const AdminClubePais = lazy(() => import("./pages/AdminClubePais"));
const OperationsCenter = lazy(() => import("./pages/OperationsCenter"));
const RelationshipsManager = lazy(() => import("./pages/admin/RelationshipsManager"));

// ABA
const AbaNeuroPlay = lazy(() => import("./pages/AbaNeuroPlay"));

// Stories & Social
const SocialStories = lazy(() => import("./pages/SocialStories"));
const StoryReader = lazy(() => import("./pages/StoryReader"));
const RoutinesPage = lazy(() => import("./pages/RoutinesPage"));
const RoutineViewer = lazy(() => import("./pages/RoutineViewer"));

// Reports & Analytics
const UnifiedReports = lazy(() => import("./pages/UnifiedReports"));
const RiskAnalysisPage = lazy(() => import("./pages/RiskAnalysisPage"));
const EmotionalHistoryDashboard = lazy(() => import("./pages/EmotionalHistoryDashboard"));
const ProfessionalAnalytics = lazy(() => import("./pages/ProfessionalAnalytics"));
const IntelligentReports = lazy(() => import("./pages/IntelligentReports"));

// Education
const EducacaoDashboard = lazy(() => import("./pages/EducacaoDashboard"));
const SchoolDirectorDashboard = lazy(() => import("./pages/SchoolDirectorDashboard"));
const SecretariaDashboard = lazy(() => import("./pages/SecretariaDashboard"));

// Community & Messaging
const Community = lazy(() => import("./pages/Community"));
const SecureMessaging = lazy(() => import("./pages/SecureMessaging"));

// AI & Institutional
const ContextualAIDashboard = lazy(() => import("./pages/ContextualAIDashboard"));
const InstitutionalDashboard = lazy(() => import("./pages/InstitutionalDashboard"));
const BillingDashboard = lazy(() => import("./pages/BillingDashboard"));
const ImpactDashboard = lazy(() => import("./pages/ImpactDashboard"));

// Compliance & Settings
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const AccessibilitySettings = lazy(() => import("./pages/AccessibilitySettings"));
const Assinatura = lazy(() => import("./pages/Assinatura"));
const PrivacyPortal = lazy(() => import("./pages/PrivacyPortal"));
const ConsentManagement = lazy(() => import("./pages/ConsentManagement"));
const DataGovernance = lazy(() => import("./pages/DataGovernance"));
const ApiIntegrations = lazy(() => import("./pages/ApiIntegrations"));
const InstallApp = lazy(() => import("./pages/InstallApp"));
const PlatformManual = lazy(() => import("./pages/PlatformManual"));
const BeneficiosTerapeuticos = lazy(() => import("./pages/BeneficiosTerapeuticos"));

// Clube dos Pais
const ClubePais = lazy(() => import("./pages/ClubePais"));
const ParceiroClube = lazy(() => import("./pages/ParceiroClube"));

// Helper for Suspense wrapping
const L = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

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
                  {/* Home - role-based redirect */}
                  <Route path="/" element={<Home />} />
                  <Route path="/index" element={<Index />} />
                  <Route path="/onboarding" element={<OnboardingWizard />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/aceitar-convite" element={<L><AcceptInvite /></L>} />
                  
                  {/* Diagnostics */}
                  <Route path="/diagnostico-completo" element={<L><DiagnosticoCompleto /></L>} />
                  <Route path="/cognitive-diagnostic" element={<L><CognitiveDiagnostic /></L>} />
                  <Route path="/diagnostic-tests" element={<L><DiagnosticTests /></L>} />
                  
                  {/* Dashboards */}
                  <Route path="/dashboard-pais" element={<L><DashboardPais /></L>} />
                  <Route path="/dashboard" element={<L><Dashboard /></L>} />
                  <Route path="/clinical" element={<L><ClinicalDashboard /></L>} />
                  
                  {/* Games - Navigation */}
                  <Route path="/game-map" element={<L><GameMap /></L>} />
                  <Route path="/games" element={<L><Games /></L>} />
                  <Route path="/neuroplasticity" element={<L><Neuroplasticity /></L>} />
                  <Route path="/learning-dashboard" element={<L><LearningDashboard /></L>} />
                  
                  {/* Games - Individual */}
                  <Route path="/games/memoria-colorida" element={<L><MemoriaColorida /></L>} />
                  <Route path="/games/caca-foco" element={<L><CacaFoco /></L>} />
                  <Route path="/games/logica-rapida" element={<L><LogicaRapida /></L>} />
                  <Route path="/games/ritmo-musical" element={<L><RitmoMusical /></L>} />
                  <Route path="/games/caca-letras" element={<L><CacaLetras /></L>} />
                  <Route path="/games/silaba-magica" element={<L><SilabaMagica /></L>} />
                  <Route path="/games/quebra-cabeca-magico" element={<L><QuebraCabecaMagico /></L>} />
                  <Route path="/games/aventura-numeros" element={<L><AventuraNumeros /></L>} />
                  <Route path="/games/contador-historias" element={<L><ContadorHistorias /></L>} />
                  <Route path="/games/mindful-breath" element={<L><MindfulBreath /></L>} />
                  <Route path="/games/focus-quest" element={<L><FocusQuest /></L>} />
                  <Route path="/games/social-scenarios" element={<L><SocialScenarios /></L>} />
                  <Route path="/games/social-compass" element={<L><SocialCompass /></L>} />
                  <Route path="/games/emotional-weather" element={<L><EmotionalWeather /></L>} />
                  <Route path="/games/balance-quest" element={<L><BalanceQuest /></L>} />
                  <Route path="/games/sensory-flow" element={<L><SensoryFlow /></L>} />
                  <Route path="/games/visual-sync" element={<L><VisualSync /></L>} />
                  <Route path="/games/stack-tower" element={<L><StackTower /></L>} />
                  <Route path="/games/cosmic-sequence" element={<L><CosmicSequence /></L>} />
                  <Route path="/games/crystal-match" element={<L><CrystalMatch /></L>} />
                  <Route path="/games/tower-defense" element={<L><TowerDefense /></L>} />
                  <Route path="/games/biofeedback-demo" element={<L><BiofeedbackDemo /></L>} />
                  <Route path="/games/touch-mapper" element={<L><TouchMapper /></L>} />
                  <Route path="/games/touch-mapper-keyboard" element={<L><TouchMapperKeyboard /></L>} />
                  <Route path="/games/cooperative-puzzle" element={<L><CooperativePuzzle /></L>} />
                  
                  {/* Games - Phase System */}
                  <Route path="/games/executive-processing-phases" element={<L><ExecutiveProcessingPhases /></L>} />
                  <Route path="/games/attention-sustained-phases" element={<L><AttentionSustainedPhases /></L>} />
                  <Route path="/games/attention-sustained-play" element={<L><AttentionSustainedPlay /></L>} />
                  <Route path="/games/foco-rapido-phases" element={<L><FocoRapidoPhases /></L>} />
                  <Route path="/games/foco-rapido-play" element={<L><FocoRapido /></L>} />
                  <Route path="/games/cognitive-flexibility-phases" element={<L><CognitiveFlexibilityPhases /></L>} />
                  <Route path="/games/cognitive-flexibility-play" element={<L><CognitiveFlexibilityPlay /></L>} />
                  <Route path="/games/visuomotor-coordination" element={<L><VisuomotorCoordination /></L>} />
                  <Route path="/games/behavioral-persistence" element={<L><BehavioralPersistence /></L>} />
                  <Route path="/bateria-cognitiva" element={<L><CognitiveBattery /></L>} />
                  
                  {/* Games - Standalone */}
                  <Route path="/games/phonological-processing" element={<L><PhonologicalProcessing /></L>} />
                  <Route path="/games/memory-workload" element={<L><MemoryWorkload /></L>} />
                  <Route path="/games/theory-of-mind" element={<L><TheoryOfMind /></L>} />
                  <Route path="/games/emotion-lab" element={<L><EmotionLab /></L>} />
                  <Route path="/games/spatial-architect" element={<L><SpatialArchitect /></L>} />
                  
                  {/* Gamification & Student */}
                  <Route path="/sistema-planeta-azul" element={<L><SistemaPlanetaAzul /></L>} />
                  <Route path="/planeta/:planetaId" element={<L><PlanetaDetalhes /></L>} />
                  <Route path="/avatar-evolution" element={<L><AvatarEvolutionPage /></L>} />
                  <Route path="/conquistas" element={<L><AchievementsPage /></L>} />
                  <Route path="/mapa" element={<L><WorldMap /></L>} />
                  <Route path="/student-hub" element={<L><StudentHub /></L>} />
                  
                  {/* Screening */}
                  <Route path="/screening" element={<L><ScreeningSelection /></L>} />
                  <Route path="/screening/dislexia" element={<L><DislexiaScreening /></L>} />
                  <Route path="/screening/tdah" element={<L><TDAHScreening /></L>} />
                  <Route path="/screening/tea" element={<L><TEAScreening /></L>} />
                  <Route path="/screening/result" element={<L><ScreeningResult /></L>} />
                  
                  {/* Therapist Routes */}
                  <Route path="/agenda" element={<L><AgendaClinica /></L>} />
                  <Route path="/inventario-habilidades" element={<L><InventarioHabilidades /></L>} />
                  <Route path="/teleconsultas" element={<L><Teleconsultas /></L>} />
                  <Route path="/teleconsulta/:sessionId" element={<L><TeleconsultaSession /></L>} />
                  <Route path="/minhas-teleconsultas" element={<L><MinhasTeleconsultas /></L>} />
                  <Route path="/agendar-teleconsulta" element={<L><AgendarTeleconsulta /></L>} />
                  <Route path="/therapist/patients" element={<L><TherapistPatients /></L>} />
                  <Route path="/therapist/patient/:patientId" element={<L><TherapistDashboard /></L>} />
                  <Route path="/prontuario/:childId" element={<L><ProntuarioUnificado /></L>} />
                  <Route path="/anamnese" element={<L><AnamneseList /></L>} />
                  <Route path="/anamnese/:childId" element={<L><AnamneseInfantil /></L>} />
                  <Route path="/therapeutic-chat" element={<L><TherapeuticChatPage /></L>} />
                  <Route path="/chat" element={<L><TherapeuticChatPage /></L>} />
                  
                  {/* Teacher Routes */}
                  <Route path="/teacher-dashboard" element={<L><TeacherDashboard /></L>} />
                  <Route path="/teacher/classes" element={<L><TeacherClasses /></L>} />
                  <Route path="/teacher/class/:classId" element={<L><TeacherClassView /></L>} />
                  <Route path="/teacher/student/:studentId" element={<L><TeacherStudentView /></L>} />
                  <Route path="/pei" element={<L><PEIView /></L>} />
                  <Route path="/pei/:patientId" element={<L><PEIView /></L>} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<L><AdminDashboard /></L>} />
                  <Route path="/admin/network" element={<L><AdminNetworkDashboard /></L>} />
                  <Route path="/admin/users" element={<L><AdminUserManagement /></L>} />
                  <Route path="/admin/relationships" element={<L><RelationshipsManager /></L>} />
                  <Route path="/admin/risk-maps" element={<L><AdminRiskMaps /></L>} />
                  <Route path="/admin/stories" element={<L><AdminStories /></L>} />
                  <Route path="/admin/story-editor" element={<L><StoryEditor /></L>} />
                  <Route path="/admin/story-editor/:storyId" element={<L><StoryEditor /></L>} />
                  <Route path="/admin/content" element={<L><ContentManager /></L>} />
                  <Route path="/admin/compliance" element={<L><ComplianceDashboard /></L>} />
                  <Route path="/admin/clube-pais" element={<L><AdminClubePais /></L>} />
                  <Route path="/operations" element={<L><OperationsCenter /></L>} />
                  
                  {/* ABA */}
                  <Route path="/aba-integration" element={<L><AbaNeuroPlay /></L>} />
                  <Route path="/aba-neuroplay" element={<L><AbaNeuroPlay /></L>} />
                  
                  {/* Stories */}
                  <Route path="/stories" element={<L><SocialStories /></L>} />
                  <Route path="/stories/:storyId" element={<L><StoryReader /></L>} />
                  
                  {/* Reports & Analytics */}
                  <Route path="/relatorios" element={<L><UnifiedReports /></L>} />
                  <Route path="/risk-analysis" element={<L><RiskAnalysisPage /></L>} />
                  <Route path="/emotional-history" element={<L><EmotionalHistoryDashboard /></L>} />
                  <Route path="/professional-analytics" element={<L><ProfessionalAnalytics /></L>} />
                  <Route path="/intelligent-reports" element={<L><IntelligentReports /></L>} />
                  
                  {/* Routines */}
                  <Route path="/rotinas" element={<L><RoutinesPage /></L>} />
                  <Route path="/rotinas/:routineId" element={<L><RoutineViewer /></L>} />
                  
                  {/* Education */}
                  <Route path="/educacao" element={<L><EducacaoDashboard /></L>} />
                  <Route path="/escola-dashboard" element={<L><SchoolDirectorDashboard /></L>} />
                  <Route path="/secretaria-educacao" element={<L><SecretariaDashboard /></L>} />
                  <Route path="/training" element={<L><ParentTraining /></L>} />
                  <Route path="/training/:moduleId" element={<L><TrainingModule /></L>} />
                  
                  {/* Community & Messaging */}
                  <Route path="/comunidade" element={<L><Community /></L>} />
                  <Route path="/mensagens" element={<L><SecureMessaging /></L>} />
                  
                  {/* AI & Analytics */}
                  <Route path="/ia-contextual" element={<L><ContextualAIDashboard /></L>} />
                  
                  {/* Institutional & Billing */}
                  <Route path="/institutional" element={<L><InstitutionalDashboard /></L>} />
                  <Route path="/assinatura" element={<L><Assinatura /></L>} />
                  <Route path="/faturamento" element={<L><BillingDashboard /></L>} />
                  <Route path="/impacto" element={<L><ImpactDashboard /></L>} />
                  
                  {/* Compliance & Privacy */}
                  <Route path="/consentimentos" element={<L><ConsentManagement /></L>} />
                  <Route path="/governanca-dados" element={<L><DataGovernance /></L>} />
                  <Route path="/integracoes-api" element={<L><ApiIntegrations /></L>} />
                  <Route path="/privacidade" element={<L><PrivacyPortal /></L>} />
                  
                  {/* Clube dos Pais */}
                  <Route path="/clube-pais" element={<L><ClubePais /></L>} />
                  <Route path="/parceiro-clube" element={<L><ParceiroClube /></L>} />
                  
                  {/* Settings & Profile */}
                  <Route path="/settings" element={<L><Settings /></L>} />
                  <Route path="/profile" element={<L><Profile /></L>} />
                  <Route path="/accessibility" element={<L><AccessibilitySettings /></L>} />
                  <Route path="/instalar" element={<L><InstallApp /></L>} />
                  <Route path="/platform-manual" element={<L><PlatformManual /></L>} />
                  <Route path="/beneficios-terapeuticos" element={<L><BeneficiosTerapeuticos /></L>} />
                  
                  {/* Catch-all */}
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
