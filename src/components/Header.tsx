import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { Brain, Gamepad2, Trophy, BarChart3, LogOut } from "lucide-react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Mundos', href: '/games', icon: Gamepad2 },
    { name: 'Meu Progresso', href: '/dashboard', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl font-bold text-foreground">
              NeuroPlay
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
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

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Olá, {user.user_metadata?.name || user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth">Entrar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};