import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Games from "./pages/Games";
import GameMap from "./components/GameMap";
import Dashboard from "./pages/Dashboard";
import MindfulBreath from "./pages/games/MindfulBreath";
import FocusForest from "./pages/games/FocusForest";
import FocusQuest from "./pages/games/FocusQuest";
import SocialScenarios from "./pages/games/SocialScenarios";
import SocialCompass from "./pages/games/SocialCompass";
import EmotionalWeather from "./pages/games/EmotionalWeather";
import BalanceQuest from "./pages/games/BalanceQuest";
import SensoryFlow from "./pages/games/SensoryFlow";
import VisualSync from "./pages/games/VisualSync";
import TouchMapper from "./pages/games/TouchMapper";
import TouchMapperKeyboard from "./pages/games/TouchMapperKeyboard";
import NotFound from "./pages/NotFound";

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
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/game-map" element={<GameMap />} />
              <Route path="/games" element={<Games />} />
              <Route path="/games/mindful-breath" element={<MindfulBreath />} />
              <Route path="/games/focus-forest" element={<FocusForest />} />
              <Route path="/games/focus-quest" element={<FocusQuest />} />
              <Route path="/games/social-scenarios" element={<SocialScenarios />} />
              <Route path="/games/social-compass" element={<SocialCompass />} />
              <Route path="/games/emotional-weather" element={<EmotionalWeather />} />
              <Route path="/games/balance-quest" element={<BalanceQuest />} />
              <Route path="/games/sensory-flow" element={<SensoryFlow />} />
              <Route path="/games/visual-sync" element={<VisualSync />} />
              <Route path="/games/touch-mapper" element={<TouchMapper />} />
              <Route path="/games/touch-mapper-keyboard" element={<TouchMapperKeyboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
