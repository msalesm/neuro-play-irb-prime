import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/core/ProtectedRoute";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";

// Eagerly loaded (critical path)
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { OnboardingWizard } from "./components/onboarding/OnboardingWizard";

// ── Lazy loaded pages ──

// Auth & Onboarding
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));

// Dashboards (role-specific)
const DashboardPais = lazy(() => import("./pages/DashboardPais"));
const ClinicalDashboard = lazy(() => import("./pages/ClinicalDashboard"));
const LearningDashboard = lazy(() => import("./pages/LearningDashboard"));
const StudentHub = lazy(() => import("./pages/StudentHub"));

// Games - Navigation
const Games = lazy(() => import("./pages/Games"));
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
const SocialScenarios = lazy(() => import("./pages/games/SocialScenarios"));
const EmotionalWeather = lazy(() => import("./pages/games/EmotionalWeather"));
const SensoryFlow = lazy(() => import("./pages/games/SensoryFlow"));
const VisualSync = lazy(() => import("./pages/games/VisualSync"));
const StackTower = lazy(() => import("./pages/games/StackTower"));
const CosmicSequence = lazy(() => import("./pages/games/CosmicSequence"));
const TowerDefense = lazy(() => import("./pages/games/TowerDefense"));

// Games - Phase System
const AttentionSustainedPhases = lazy(() => import("./pages/games/AttentionSustainedPhases"));
const AttentionSustainedPlay = lazy(() => import("./pages/games/AttentionSustainedPlay"));
const FocoRapidoPhases = lazy(() => import("./pages/games/FocoRapidoPhases"));
const FocoRapido = lazy(() => import("./pages/games/FocoRapido"));
const CognitiveFlexibilityPhases = lazy(() => import("./pages/games/CognitiveFlexibilityPhases"));
const CognitiveFlexibilityPlay = lazy(() => import("./pages/games/CognitiveFlexibilityPlay"));
const ExecutiveProcessingPhases = lazy(() => import("./pages/games/ExecutiveProcessingPhases"));
const ExecutiveProcessingPlay = lazy(() => import("./pages/games/ExecutiveProcessingPlay"));
const VisuomotorCoordination = lazy(() => import("./pages/games/VisuomotorCoordination"));
const BehavioralPersistence = lazy(() => import("./pages/games/BehavioralPersistence"));


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

// Screening
const ScreeningSelection = lazy(() => import("./pages/ScreeningSelection"));
const DislexiaScreening = lazy(() => import("./pages/games/DislexiaScreening"));
const TDAHScreening = lazy(() => import("./pages/games/TDAHScreening"));
const TEAScreening = lazy(() => import("./pages/games/TEAScreening"));
const ScreeningResult = lazy(() => import("./pages/ScreeningResult"));

// Diagnostics (consolidated)
const DiagnosticoCompleto = lazy(() => import("./pages/DiagnosticoCompleto"));

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
const ParentCoaching = lazy(() => import("./pages/ParentCoaching"));

// Admin
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminNetworkDashboard = lazy(() => import("./pages/AdminNetworkDashboard"));
const AdminUserManagement = lazy(() => import("./pages/AdminUserManagement"));
const AdminRiskMaps = lazy(() => import("./pages/AdminRiskMaps"));
const AdminStories = lazy(() => import("./pages/AdminStories"));
const StoryEditor = lazy(() => import("./pages/StoryEditor"));
const ContentManager = lazy(() => import("./pages/ContentManager"));
const AdminClubePais = lazy(() => import("./pages/AdminClubePais"));
const OperationsCenter = lazy(() => import("./pages/OperationsCenter"));
const RelationshipsManager = lazy(() => import("./pages/admin/RelationshipsManager"));

// ABA
const AbaNeuroPlay = lazy(() => import("./pages/AbaNeuroPlay"));

// Stories & Routines
const SocialStories = lazy(() => import("./pages/SocialStories"));
const StoryReader = lazy(() => import("./pages/StoryReader"));
const RoutinesPage = lazy(() => import("./pages/RoutinesPage"));
const RoutineViewer = lazy(() => import("./pages/RoutineViewer"));

// Reports & Analytics (consolidated)
const UnifiedReports = lazy(() => import("./pages/UnifiedReports"));
const RiskAnalysisPage = lazy(() => import("./pages/RiskAnalysisPage"));
const EmotionalHistoryDashboard = lazy(() => import("./pages/EmotionalHistoryDashboard"));
const ProfessionalAnalytics = lazy(() => import("./pages/ProfessionalAnalytics"));

// Education
const EducacaoDashboard = lazy(() => import("./pages/EducacaoDashboard"));
const SchoolDirectorDashboard = lazy(() => import("./pages/SchoolDirectorDashboard"));
const SecretariaDashboard = lazy(() => import("./pages/SecretariaDashboard"));

// Community & Messaging
const Community = lazy(() => import("./pages/Community"));
const SecureMessaging = lazy(() => import("./pages/SecureMessaging"));

// Institutional & Billing
const InstitutionalDashboard = lazy(() => import("./pages/InstitutionalDashboard"));
const BillingDashboard = lazy(() => import("./pages/BillingDashboard"));
const ImpactDashboard = lazy(() => import("./pages/ImpactDashboard"));

// Privacy & Compliance (consolidated 4→1)
const PrivacyCompliancePage = lazy(() => import("./pages/PrivacyCompliancePage"));

// Settings & Profile
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const AccessibilitySettings = lazy(() => import("./pages/AccessibilitySettings"));
const Assinatura = lazy(() => import("./pages/Assinatura"));
const ApiIntegrations = lazy(() => import("./pages/ApiIntegrations"));
const InstallApp = lazy(() => import("./pages/InstallApp"));
const PlatformManual = lazy(() => import("./pages/PlatformManual"));
const BeneficiosTerapeuticos = lazy(() => import("./pages/BeneficiosTerapeuticos"));

// Clube dos Pais
const ClubePais = lazy(() => import("./pages/ClubePais"));
const ParceiroClube = lazy(() => import("./pages/ParceiroClube"));

// Helpers
const L = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

/** Protected + Lazy: wraps a page with role guard and suspense */
const P = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => (
  <Suspense fallback={<Loading />}>
    <ProtectedRoute allowedRoles={roles as any}>{children}</ProtectedRoute>
  </Suspense>
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
                  
                  {/* Dashboards */}
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="/dashboard-pais" element={<P roles={['parent']}><DashboardPais /></P>} />
                  <Route path="/clinical" element={<P roles={['therapist']}><ClinicalDashboard /></P>} />
                  <Route path="/student-hub" element={<P roles={['patient']}><StudentHub /></P>} />
                  
                  {/* Diagnostics */}
                  <Route path="/diagnostico-completo" element={<P roles={['therapist']}><DiagnosticoCompleto /></P>} />
                  <Route path="/cognitive-diagnostic" element={<Navigate to="/diagnostico-completo" replace />} />
                  <Route path="/diagnostic-tests" element={<Navigate to="/diagnostico-completo" replace />} />
                  
                  {/* Games - open to all authenticated */}
                  <Route path="/games" element={<P><Games /></P>} />
                  <Route path="/neuroplasticity" element={<P><Neuroplasticity /></P>} />
                  <Route path="/learning-dashboard" element={<P><LearningDashboard /></P>} />
                  
                  {/* Games - Individual (open to all authenticated) */}
                  <Route path="/games/memoria-colorida" element={<P><MemoriaColorida /></P>} />
                  <Route path="/games/caca-foco" element={<P><CacaFoco /></P>} />
                  <Route path="/games/logica-rapida" element={<P><LogicaRapida /></P>} />
                  <Route path="/games/ritmo-musical" element={<P><RitmoMusical /></P>} />
                  <Route path="/games/caca-letras" element={<P><CacaLetras /></P>} />
                  <Route path="/games/silaba-magica" element={<P><SilabaMagica /></P>} />
                  <Route path="/games/quebra-cabeca-magico" element={<P><QuebraCabecaMagico /></P>} />
                  <Route path="/games/aventura-numeros" element={<P><AventuraNumeros /></P>} />
                  <Route path="/games/contador-historias" element={<P><ContadorHistorias /></P>} />
                  <Route path="/games/mindful-breath" element={<P><MindfulBreath /></P>} />
                  <Route path="/games/social-scenarios" element={<P><SocialScenarios /></P>} />
                  <Route path="/games/emotional-weather" element={<P><EmotionalWeather /></P>} />
                  <Route path="/games/sensory-flow" element={<P><SensoryFlow /></P>} />
                  <Route path="/games/visual-sync" element={<P><VisualSync /></P>} />
                  <Route path="/games/stack-tower" element={<P><StackTower /></P>} />
                  <Route path="/games/cosmic-sequence" element={<P><CosmicSequence /></P>} />
                  <Route path="/games/tower-defense" element={<P><TowerDefense /></P>} />
                  
                  {/* Games - Phase System */}
                  <Route path="/games/executive-processing-phases" element={<P><ExecutiveProcessingPhases /></P>} />
                  <Route path="/games/executive-processing-play" element={<P><ExecutiveProcessingPlay /></P>} />
                  <Route path="/games/attention-sustained-phases" element={<P><AttentionSustainedPhases /></P>} />
                  <Route path="/games/attention-sustained-play" element={<P><AttentionSustainedPlay /></P>} />
                  <Route path="/games/foco-rapido-phases" element={<P><FocoRapidoPhases /></P>} />
                  <Route path="/games/foco-rapido-play" element={<P><FocoRapido /></P>} />
                  <Route path="/games/cognitive-flexibility-phases" element={<P><CognitiveFlexibilityPhases /></P>} />
                  <Route path="/games/cognitive-flexibility-play" element={<P><CognitiveFlexibilityPlay /></P>} />
                  <Route path="/games/visuomotor-coordination" element={<P><VisuomotorCoordination /></P>} />
                  <Route path="/games/behavioral-persistence" element={<P><BehavioralPersistence /></P>} />
                  <Route path="/bateria-cognitiva" element={<P><CognitiveBattery /></P>} />
                  
                  {/* Games - Standalone */}
                  <Route path="/games/phonological-processing" element={<P><PhonologicalProcessing /></P>} />
                  <Route path="/games/memory-workload" element={<P><MemoryWorkload /></P>} />
                  <Route path="/games/theory-of-mind" element={<P><TheoryOfMind /></P>} />
                  <Route path="/games/emotion-lab" element={<P><EmotionLab /></P>} />
                  <Route path="/games/spatial-architect" element={<P><SpatialArchitect /></P>} />
                  
                  
                  {/* Gamification & Student */}
                  <Route path="/sistema-planeta-azul" element={<P><SistemaPlanetaAzul /></P>} />
                  <Route path="/planeta/:planetaId" element={<P><PlanetaDetalhes /></P>} />
                  <Route path="/avatar-evolution" element={<P roles={['patient']}><AvatarEvolutionPage /></P>} />
                  <Route path="/conquistas" element={<P><AchievementsPage /></P>} />
                  <Route path="/mapa" element={<P><WorldMap /></P>} />
                  
                  {/* Screening */}
                  <Route path="/screening" element={<P roles={['therapist', 'teacher']}><ScreeningSelection /></P>} />
                  <Route path="/screening/dislexia" element={<P roles={['therapist', 'teacher']}><DislexiaScreening /></P>} />
                  <Route path="/screening/tdah" element={<P roles={['therapist', 'teacher']}><TDAHScreening /></P>} />
                  <Route path="/screening/tea" element={<P roles={['therapist', 'teacher']}><TEAScreening /></P>} />
                  <Route path="/screening/result" element={<P roles={['therapist', 'teacher']}><ScreeningResult /></P>} />
                  
                  {/* Therapist Routes */}
                  <Route path="/agenda" element={<P roles={['therapist', 'parent']}><AgendaClinica /></P>} />
                  <Route path="/inventario-habilidades" element={<P roles={['therapist']}><InventarioHabilidades /></P>} />
                  <Route path="/teleconsultas" element={<P roles={['therapist']}><Teleconsultas /></P>} />
                  <Route path="/teleconsulta/:sessionId" element={<P roles={['therapist', 'parent']}><TeleconsultaSession /></P>} />
                  <Route path="/minhas-teleconsultas" element={<P roles={['parent']}><MinhasTeleconsultas /></P>} />
                  <Route path="/agendar-teleconsulta" element={<P roles={['parent']}><AgendarTeleconsulta /></P>} />
                  <Route path="/therapist/patients" element={<P roles={['therapist']}><TherapistPatients /></P>} />
                  <Route path="/therapist/patient/:patientId" element={<P roles={['therapist']}><TherapistDashboard /></P>} />
                  <Route path="/prontuario/:childId" element={<P roles={['therapist']}><ProntuarioUnificado /></P>} />
                  <Route path="/anamnese" element={<P roles={['therapist']}><AnamneseList /></P>} />
                  <Route path="/anamnese/:childId" element={<P roles={['therapist']}><AnamneseInfantil /></P>} />
                  <Route path="/therapeutic-chat" element={<P roles={['therapist']}><TherapeuticChatPage /></P>} />
                  <Route path="/chat" element={<Navigate to="/therapeutic-chat" replace />} />
                  
                  {/* Teacher Routes */}
                  <Route path="/teacher-dashboard" element={<P roles={['teacher', 'admin']}><TeacherDashboard /></P>} />
                  <Route path="/teacher/classes" element={<P roles={['teacher', 'admin']}><TeacherClasses /></P>} />
                  <Route path="/teacher/class/:classId" element={<P roles={['teacher', 'admin']}><TeacherClassView /></P>} />
                  <Route path="/teacher/student/:studentId" element={<P roles={['teacher', 'admin']}><TeacherStudentView /></P>} />
                  <Route path="/pei" element={<P roles={['therapist', 'teacher', 'admin']}><PEIView /></P>} />
                  <Route path="/pei/:patientId" element={<P roles={['therapist', 'teacher', 'admin']}><PEIView /></P>} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<P roles={['admin']}><AdminDashboard /></P>} />
                  <Route path="/admin/network" element={<P roles={['admin']}><AdminNetworkDashboard /></P>} />
                  <Route path="/admin/users" element={<P roles={['admin']}><AdminUserManagement /></P>} />
                  <Route path="/admin/relationships" element={<P roles={['admin']}><RelationshipsManager /></P>} />
                  <Route path="/admin/risk-maps" element={<P roles={['admin']}><AdminRiskMaps /></P>} />
                  <Route path="/admin/stories" element={<P roles={['admin']}><AdminStories /></P>} />
                  <Route path="/admin/story-editor" element={<P roles={['admin']}><StoryEditor /></P>} />
                  <Route path="/admin/story-editor/:storyId" element={<P roles={['admin']}><StoryEditor /></P>} />
                  <Route path="/admin/content" element={<P roles={['admin']}><ContentManager /></P>} />
                  <Route path="/admin/clube-pais" element={<P roles={['admin']}><AdminClubePais /></P>} />
                  <Route path="/operations" element={<P roles={['admin']}><OperationsCenter /></P>} />
                  
                  {/* ABA */}
                  <Route path="/aba-neuroplay" element={<P roles={['therapist']}><AbaNeuroPlay /></P>} />
                  <Route path="/aba-integration" element={<Navigate to="/aba-neuroplay" replace />} />
                  
                  {/* Stories (open to all authenticated) */}
                  <Route path="/stories" element={<P><SocialStories /></P>} />
                  <Route path="/stories/:storyId" element={<P><StoryReader /></P>} />
                  
                  {/* Reports & Analytics */}
                  <Route path="/relatorios" element={<P roles={['therapist', 'teacher', 'parent', 'admin']}><UnifiedReports /></P>} />
                  <Route path="/intelligent-reports" element={<Navigate to="/relatorios" replace />} />
                  <Route path="/reports" element={<Navigate to="/relatorios" replace />} />
                  <Route path="/risk-analysis" element={<P roles={['therapist', 'teacher']}><RiskAnalysisPage /></P>} />
                  <Route path="/emotional-history" element={<P><EmotionalHistoryDashboard /></P>} />
                  <Route path="/professional-analytics" element={<P roles={['therapist']}><ProfessionalAnalytics /></P>} />
                  
                  {/* Routines (open to all authenticated) */}
                  <Route path="/rotinas" element={<P><RoutinesPage /></P>} />
                  <Route path="/rotinas/:routineId" element={<P><RoutineViewer /></P>} />
                  
                  {/* Education */}
                  <Route path="/educacao" element={<P roles={['teacher']}><EducacaoDashboard /></P>} />
                  <Route path="/escola-dashboard" element={<P roles={['teacher']}><SchoolDirectorDashboard /></P>} />
                  <Route path="/secretaria-educacao" element={<P roles={['admin']}><SecretariaDashboard /></P>} />
                  <Route path="/training" element={<P><ParentTraining /></P>} />
                  <Route path="/training/:moduleId" element={<P><TrainingModule /></P>} />
                  <Route path="/parent-coaching" element={<P roles={['parent']}><ParentCoaching /></P>} />
                  
                  {/* Community & Messaging */}
                  <Route path="/comunidade" element={<P><Community /></P>} />
                  <Route path="/mensagens" element={<P><SecureMessaging /></P>} />
                  
                  {/* AI → redirect to relatorios */}
                  <Route path="/ia-contextual" element={<Navigate to="/relatorios" replace />} />
                  
                  {/* Institutional & Billing */}
                  <Route path="/institutional" element={<P roles={['admin']}><InstitutionalDashboard /></P>} />
                  <Route path="/assinatura" element={<P roles={['parent']}><Assinatura /></P>} />
                  <Route path="/faturamento" element={<P roles={['admin']}><BillingDashboard /></P>} />
                  <Route path="/impacto" element={<P roles={['admin']}><ImpactDashboard /></P>} />
                  
                  {/* Privacy & Compliance */}
                  <Route path="/privacidade" element={<P><PrivacyCompliancePage /></P>} />
                  <Route path="/consentimentos" element={<Navigate to="/privacidade" replace />} />
                  <Route path="/governanca-dados" element={<Navigate to="/privacidade" replace />} />
                  <Route path="/admin/compliance" element={<Navigate to="/privacidade" replace />} />
                  
                  {/* Integrations */}
                  <Route path="/integracoes-api" element={<P roles={['admin']}><ApiIntegrations /></P>} />
                  
                  {/* Clube dos Pais */}
                  <Route path="/clube-pais" element={<P roles={['parent']}><ClubePais /></P>} />
                  <Route path="/parceiro-clube" element={<P roles={['parent']}><ParceiroClube /></P>} />
                  
                  {/* Settings & Profile (open to all authenticated) */}
                  <Route path="/settings" element={<P><Settings /></P>} />
                  <Route path="/profile" element={<P><Profile /></P>} />
                  <Route path="/accessibility" element={<P><AccessibilitySettings /></P>} />
                  <Route path="/instalar" element={<P><InstallApp /></P>} />
                  <Route path="/platform-manual" element={<P><PlatformManual /></P>} />
                  <Route path="/beneficios-terapeuticos" element={<P><BeneficiosTerapeuticos /></P>} />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
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
