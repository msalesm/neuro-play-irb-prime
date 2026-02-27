import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { Brain, Gamepad2, Trophy, BarChart3, LogOut, Menu, X, Activity } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AdminNavLink } from "@/components/AdminNavLink";

export const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navigation = [
    { name: t('nav.games'), href: '/games', icon: Gamepad2 },
    { name: t('nav.diagnosticTests'), href: '/diagnostic-tests', icon: Trophy },
    { name: t('nav.clinical'), href: '/clinical', icon: Brain },
    { name: t('nav.myProgress'), href: '/dashboard', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-transparent backdrop-blur-sm border-b border-white/10 sticky top-0 z-40" role="banner">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 sm:gap-3" 
            onClick={closeMobileMenu}
            aria-label="Neuro IRB Prime - Página inicial"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
            </div>
            <span className="font-heading text-xl sm:text-2xl font-bold text-white">
              Neuro IRB Prime
            </span>
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            <AdminNavLink />
          
          <Link
            to="/clinical"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
              location.pathname === '/clinical'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            aria-label="Painel Clínico com IA"
          >
            <Activity className="h-5 w-5" aria-hidden="true" />
            <span className="font-medium">Painel Clínico</span>
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 text-xs px-1.5 py-0.5 ml-1" aria-label="Inteligência Artificial">
              IA
            </Badge>
          </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/80 hidden md:block" aria-label={`Usuário: ${user.user_metadata?.name || user.email?.split('@')[0]}`}>
                  {user.user_metadata?.name || user.email?.split('@')[0]}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="bg-card/50 border-border text-foreground hover:bg-accent"
                  aria-label="Sair da conta"
                >
                  <LogOut className="h-4 w-4 md:mr-2" aria-hidden="true" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                asChild 
                className="bg-card/50 border-border text-foreground hover:bg-accent"
                aria-label="Entrar na plataforma"
              >
                <Link to="/auth">Entrar</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            <div className="flex items-center justify-center gap-4 pb-3 border-b border-white/10">
              <LanguageSelector />
            </div>
            
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};