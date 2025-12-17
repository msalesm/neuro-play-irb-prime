import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Check, Crown, Building2, Users, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";

const PLANS = [
  {
    id: "familia",
    name: "Pro Família",
    price: "R$ 49,90",
    priceId: "price_1Sc61lGmSkyNzKz8YegvzSjk",
    productId: "prod_TZEUaVojXRO8n5",
    description: "Acesso completo para famílias",
    icon: Users,
    features: [
      "Jogos terapêuticos ilimitados",
      "Relatórios de progresso",
      "Histórias sociais",
      "Chat terapêutico com IA",
      "Planeta Azul completo",
      "Suporte por email"
    ]
  },
  {
    id: "terapeuta",
    name: "Pro Terapeuta",
    price: "R$ 149,90",
    priceId: "price_1Sc625GmSkyNzKz8dEU0blXb",
    productId: "prod_TZEVsV95EtdA7N",
    description: "Para profissionais de saúde",
    icon: Crown,
    popular: true,
    features: [
      "Tudo do Plano Família",
      "Gestão de pacientes ilimitada",
      "Prontuário eletrônico",
      "Teleconsulta integrada",
      "Relatórios clínicos com IA",
      "PEI digital",
      "Suporte prioritário"
    ]
  },
  {
    id: "institucional",
    name: "Institucional",
    price: "R$ 499,90",
    priceId: "price_1Sc62KGmSkyNzKz8HHTqqjGX",
    productId: "prod_TZEVCQjCrb7cJy",
    description: "Para clínicas e escolas",
    icon: Building2,
    features: [
      "Tudo do Plano Terapeuta",
      "Multi-usuários ilimitados",
      "Dashboards institucionais",
      "Importação em massa (CSV)",
      "Relatórios de rede",
      "API de integração",
      "Gerente de conta dedicado"
    ]
  }
];

const Assinatura = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{
    subscribed: boolean;
    plan_name: string | null;
    subscription_end: string | null;
  } | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({
        title: "Assinatura ativada!",
        description: "Sua assinatura foi processada com sucesso.",
      });
      checkSubscription();
    } else if (searchParams.get("canceled") === "true") {
      toast({
        title: "Checkout cancelado",
        description: "O processo de checkout foi cancelado.",
        variant: "destructive"
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setCheckingSubscription(false);
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      setCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para assinar um plano.",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    setLoading(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro no checkout",
        description: "Não foi possível iniciar o checkout. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    setLoading("manage");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o portal de gerenciamento.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const currentPlan = PLANS.find(p => p.id === subscription?.plan_name);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Planos NeuroPlay
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para suas necessidades terapêuticas e clínicas
          </p>
        </div>

        {subscription?.subscribed && currentPlan && (
          <Alert className="mb-8 border-primary bg-primary/5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                Você está no plano <strong>{currentPlan.name}</strong>
                {subscription.subscription_end && (
                  <span className="text-muted-foreground ml-2">
                    (renova em {new Date(subscription.subscription_end).toLocaleDateString("pt-BR")})
                  </span>
                )}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManageSubscription}
                disabled={loading === "manage"}
              >
                {loading === "manage" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Gerenciar <ExternalLink className="h-3 w-3 ml-1" />
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = subscription?.plan_name === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? "border-primary shadow-lg" : ""} ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Mais Popular
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 right-4 bg-green-600">
                    Seu Plano
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : plan.popular ? "default" : "outline"}
                    disabled={loading === plan.id || checkingSubscription || isCurrentPlan}
                    onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrentPlan ? (
                      "Plano Atual"
                    ) : (
                      "Assinar Agora"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Pagamento seguro processado pelo Stripe. Cancele a qualquer momento.</p>
          <p className="mt-1">Dúvidas? Entre em contato: suporte@neuroplay.com.br</p>
        </div>
      </div>
    </div>
  );
};

export default Assinatura;
