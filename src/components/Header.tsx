import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { Brain, Gamepad2, Trophy, BarChart3, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Jogos', href: '/games', icon: Gamepad2 },
    { name: 'Painel Clínico', href: '/clinical', icon: Brain },
    { name: 'Meu Progresso', href: '/dashboard', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3" onClick={closeMobileMenu}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              NeuroPlay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4">
            {user && navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-smooth ${
                    isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden xl:block">
                  Olá, {user.user_metadata?.name || user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden xl:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Entrar</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4">
            {/* Mobile Navigation */}
            {user && (
              <nav className="space-y-2 mb-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-smooth ${
                        isActive(item.href)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Mobile Auth */}
            <div className="space-y-3">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    Olá, {user.user_metadata?.name || user.email}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                    className="w-full justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/auth" onClick={closeMobileMenu}>Entrar</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};