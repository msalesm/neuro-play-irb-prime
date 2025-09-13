import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { Brain, Gamepad2, Trophy, BarChart3, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";

export const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navigation = [
    { name: t('nav.games'), href: '/games', icon: Gamepad2 },
    { name: 'Testes Diagnósticos', href: '/diagnostic-tests', icon: Trophy },
    { name: t('nav.clinical'), href: '/clinical', icon: Brain },
    { name: 'Meu Progresso', href: '/dashboard', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-transparent backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3" onClick={closeMobileMenu}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="font-heading text-xl sm:text-2xl font-bold text-white">
              NeuroPlay
            </span>
          </Link>

          {/* Desktop Auth - Simplified */}
          <div className="flex items-center gap-4">
            <LanguageSelector />
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/80 hidden md:block">
                  {user.user_metadata?.name || user.email?.split('@')[0]}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Link to="/auth">Entrar</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};