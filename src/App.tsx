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

// Eager
import Home from "./pages/Home";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Auth & Onboarding
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const JoinScan = lazy(() => import("./pages/JoinScan"));

// Student (aluno)
const StudentHub = lazy(() => import("./pages/StudentHub"));
const SistemaPlanetaAzul = lazy(() => import("./pages/SistemaPlanetaAzul"));
const PlanetaDetalhes = lazy(() => import("./pages/PlanetaDetalhes"));
const AvatarEvolutionPage = lazy(() => import("./pages/AvatarEvolutionPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const WorldMap = lazy(() => import("./pages/WorldMap"));

// Games hub
const Games = lazy(() => import("./pages/Games"));
const CognitiveBattery = lazy(() => import("./pages/CognitiveBattery"));
const LearningDashboard = lazy(() => import("./pages/LearningDashboard"));

// Games — individual
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
const EmotionalWeather = lazy(() => import("./pages/games/EmotionalWeather"));
const SensoryFlow = lazy(() => import("./pages/games/SensoryFlow"));
const VisualSync = lazy(() => import("./pages/games/VisualSync"));
const StackTower = lazy(() => import("./pages/games/StackTower"));
const CosmicSequence = lazy(() => import("./pages/games/CosmicSequence"));
const TowerDefense = lazy(() => import("./pages/games/TowerDefense"));

// Games — phase system
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

// Games — standalone
const PhonologicalProcessing = lazy(() => import("./pages/games/PhonologicalProcessingGame"));
const MemoryWorkload = lazy(() => import("./pages/games/MemoryWorkload"));
const TheoryOfMind = lazy(() => import("./pages/games/TheoryOfMind"));
const EmotionLab = lazy(() => import("./pages/games/EmotionLab"));
const SpatialArchitect = lazy(() => import("./pages/games/SpatialArchitect"));

// Screening
const ScreeningSelection = lazy(() => import("./pages/ScreeningSelection"));
const DislexiaScreening = lazy(() => import("./pages/games/DislexiaScreening"));
const TDAHScreening = lazy(() => import("./pages/games/TDAHScreening"));
const TEAScreening = lazy(() => import("./pages/games/TEAScreening"));
const ScreeningResult = lazy(() => import("./pages/ScreeningResult"));

// Teacher
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const TeacherClasses = lazy(() => import("./pages/TeacherClasses"));
const TeacherClassView = lazy(() => import("./pages/TeacherClassView"));
const TeacherStudentView = lazy(() => import("./pages/TeacherStudentView"));
const PEIView = lazy(() => import("./pages/PEIView"));
const TeacherTraining = lazy(() => import("./pages/TeacherTraining"));
const TrainingModule = lazy(() => import("./pages/TrainingModule"));

// Education
const EducacaoDashboard = lazy(() => import("./pages/EducacaoDashboard"));
const SchoolDirectorDashboard = lazy(() => import("./pages/SchoolDirectorDashboard"));

// Settings
const Settings = lazy(() => import("./pages/Settings"));
const AccessibilitySettings = lazy(() => import("./pages/AccessibilitySettings"));

// Helpers
const L = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

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
              <Sonner position="top-center" className="!z-[100]" toastOptions={{ className: '!z-[100]' }} />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppLayout>
                  <Routes>
                    {/* Public */}
                    <Route path="/" element={<Index />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/join" element={<L><JoinScan /></L>} />
                    <Route path="/aceitar-convite" element={<L><AcceptInvite /></L>} />

                    {/* Student area */}
                    <Route path="/student-hub" element={<P roles={['student']}><StudentHub /></P>} />
                    <Route path="/sistema-planeta-azul" element={<P><SistemaPlanetaAzul /></P>} />
                    <Route path="/planeta/:planetaId" element={<P><PlanetaDetalhes /></P>} />
                    <Route path="/avatar-evolution" element={<P roles={['student']}><AvatarEvolutionPage /></P>} />
                    <Route path="/conquistas" element={<P><AchievementsPage /></P>} />
                    <Route path="/mapa" element={<P><WorldMap /></P>} />

                    {/* Games */}
                    <Route path="/games" element={<P><Games /></P>} />
                    <Route path="/learning-dashboard" element={<P><LearningDashboard /></P>} />
                    <Route path="/bateria-cognitiva" element={<P><CognitiveBattery /></P>} />

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

                    <Route path="/games/phonological-processing" element={<P><PhonologicalProcessing /></P>} />
                    <Route path="/games/memory-workload" element={<P><MemoryWorkload /></P>} />
                    <Route path="/games/theory-of-mind" element={<P><TheoryOfMind /></P>} />
                    <Route path="/games/emotion-lab" element={<P><EmotionLab /></P>} />
                    <Route path="/games/spatial-architect" element={<P><SpatialArchitect /></P>} />

                    {/* Screening */}
                    <Route path="/screening" element={<P roles={['teacher','admin']}><ScreeningSelection /></P>} />
                    <Route path="/screening/dislexia" element={<P roles={['teacher','admin']}><DislexiaScreening /></P>} />
                    <Route path="/screening/tdah" element={<P roles={['teacher','admin']}><TDAHScreening /></P>} />
                    <Route path="/screening/tea" element={<P roles={['teacher','admin']}><TEAScreening /></P>} />
                    <Route path="/screening/result" element={<P roles={['teacher','admin']}><ScreeningResult /></P>} />

                    {/* Teacher */}
                    <Route path="/teacher-dashboard" element={<P roles={['teacher','admin']}><TeacherDashboard /></P>} />
                    <Route path="/teacher/classes" element={<P roles={['teacher','admin']}><TeacherClasses /></P>} />
                    <Route path="/teacher/class/:classId" element={<P roles={['teacher','admin']}><TeacherClassView /></P>} />
                    <Route path="/teacher/student/:studentId" element={<P roles={['teacher','admin']}><TeacherStudentView /></P>} />
                    <Route path="/pei" element={<P roles={['teacher','admin']}><PEIView /></P>} />
                    <Route path="/pei/:patientId" element={<P roles={['teacher','admin']}><PEIView /></P>} />
                    <Route path="/training" element={<P><TeacherTraining /></P>} />
                    <Route path="/training/:moduleId" element={<P><TrainingModule /></P>} />

                    {/* Education / School */}
                    <Route path="/educacao" element={<P roles={['teacher','admin']}><EducacaoDashboard /></P>} />
                    <Route path="/escola-dashboard" element={<P roles={['admin','teacher']}><SchoolDirectorDashboard /></P>} />

                    {/* Settings */}
                    <Route path="/settings" element={<P><Settings /></P>} />
                    <Route path="/accessibility" element={<P><AccessibilitySettings /></P>} />

                    {/* Legacy redirects */}
                    <Route path="/dashboard" element={<Navigate to="/teacher-dashboard" replace />} />
                    <Route path="/dashboard-pais" element={<Navigate to="/teacher-dashboard" replace />} />
                    <Route path="/clinical" element={<Navigate to="/teacher-dashboard" replace />} />
                    <Route path="/therapist/patients" element={<Navigate to="/teacher/classes" replace />} />
                    <Route path="/admin/network" element={<Navigate to="/escola-dashboard" replace />} />

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
