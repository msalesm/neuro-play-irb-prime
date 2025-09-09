import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, MessageCircle, Heart, Clock } from "lucide-react";

const SocialScenarios = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSessionActive, setIsSessionActive] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <Card className="p-8 max-w-md mx-auto text-center">
          <Users className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Social Scenarios Simulator</h2>
          <p className="text-muted-foreground mb-6">
            Você precisa estar logado para acessar este jogo terapêutico.
          </p>
          <Button onClick={() => window.location.href = '/auth'} className="w-full">
            Fazer Login
          </Button>
        </Card>
      </div>
    );
  }

  const startSession = () => {
    setIsSessionActive(true);
    toast({
      title: "Jogo em Desenvolvimento",
      description: "Este jogo está sendo desenvolvido pela nossa equipe de terapeutas.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-purple-100 text-purple-800 mb-4">
            Social Skills
          </Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Social Scenarios Simulator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pratique interações sociais em ambientes seguros e controlados
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-card border-0 shadow-card">
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-32 h-32 bg-gradient-subtle rounded-full mx-auto flex items-center justify-center mb-6">
                    <Users className="h-16 w-16 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Jogo em Desenvolvimento</h3>
                  <p className="text-muted-foreground mb-6">
                    Nossa equipe de terapeutas e desenvolvedores está criando cenários
                    realistas para prática de habilidades sociais.
                  </p>
                </div>

                {!isSessionActive ? (
                  <div className="space-y-4">
                    <Button onClick={startSession} size="lg" className="w-full">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Prévia do Desenvolvimento
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Em breve: Cenários interativos com múltiplas escolhas e feedback construtivo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-6 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-3">Cenário de Exemplo:</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        "Você está em uma festa e não conhece ninguém. Como você se aproximaria
                        de um grupo de pessoas conversando?"
                      </p>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" disabled>
                          A) Esperar alguém falar comigo primeiro
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                          B) Me apresentar educadamente ao grupo
                        </Button>
                        <Button variant="outline" className="w-full justify-start" disabled>
                          C) Interromper a conversa com um comentário
                        </Button>
                      </div>
                    </div>
                    <Badge variant="secondary" className="mx-auto">
                      Funcionalidade em desenvolvimento
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Game Info */}
            <Card className="p-6 bg-card border-0 shadow-card">
              <h3 className="font-semibold mb-4">Detalhes do Jogo</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>12-30 anos</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>20-40 min</span>
                </div>
                <div className="flex items-center text-sm">
                  <Heart className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>1-4 jogadores</span>
                </div>
              </div>
            </Card>

            {/* Development Progress */}
            <Card className="p-6 bg-card border-0 shadow-card">
              <h3 className="font-semibold mb-4">Progresso do Desenvolvimento</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Conceito</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Design</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Desenvolvimento</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
              </div>
            </Card>

            {/* Features Preview */}
            <Card className="p-6 bg-card border-0 shadow-card">
              <h3 className="font-semibold mb-4">Recursos Planejados</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  Cenários reais de interação
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  Múltiplas escolhas com consequências
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  Feedback construtivo e positivo
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  Modo multiplayer cooperativo
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialScenarios;