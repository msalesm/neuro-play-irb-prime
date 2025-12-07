import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernPageLayout } from '@/components/ModernPageLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, Check, X, Zap, Building2, Users, Star,
  CreditCard, Calendar, AlertCircle, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  plan_type: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  trial_days: number;
  sort_order: number;
}

interface Subscription {
  id: string;
  status: string;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  trial_ends_at: string | null;
  plan: SubscriptionPlan;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Load plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (plansError) throw plansError;
      setPlans((plansData || []).map(p => ({
        ...p,
        features: (typeof p.features === 'object' && p.features !== null ? p.features : {}) as Record<string, boolean>,
        limits: (typeof p.limits === 'object' && p.limits !== null ? p.limits : {}) as Record<string, number>
      })) as SubscriptionPlan[]);

      // Load current subscription
      if (user) {
        const { data: subData } = await supabase
          .from('subscriptions')
          .select(`
            *,
            plan:plan_id (*)
          `)
          .eq('user_id', user.id)
          .in('status', ['active', 'trial'])
          .single();

        if (subData) {
          setCurrentSubscription({
            ...subData,
            plan: subData.plan as unknown as SubscriptionPlan
          } as Subscription);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeDialog(true);
  };

  const handleStartTrial = async () => {
    if (!selectedPlan || !user) return;

    try {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + selectedPlan.trial_days);

      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: selectedPlan.id,
          status: selectedPlan.trial_days > 0 ? 'trial' : 'pending',
          billing_cycle: billingCycle,
          current_period_end: periodEnd.toISOString(),
          trial_ends_at: selectedPlan.trial_days > 0 ? trialEnd.toISOString() : null
        });

      if (error) throw error;

      toast.success(
        selectedPlan.trial_days > 0 
          ? `Trial de ${selectedPlan.trial_days} dias iniciado!` 
          : 'Plano selecionado! Configure o pagamento.'
      );
      setShowUpgradeDialog(false);
      loadData();
    } catch (error) {
      console.error('Error starting subscription:', error);
      toast.error('Erro ao iniciar assinatura');
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', currentSubscription.id);

      if (error) throw error;

      toast.success('Assinatura cancelada. Você terá acesso até o fim do período.');
      loadData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Erro ao cancelar assinatura');
    }
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'free': return <Star className="w-6 h-6" />;
      case 'pro_family': return <Users className="w-6 h-6" />;
      case 'pro_therapist': return <Crown className="w-6 h-6" />;
      case 'institutional': return <Building2 className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'free': return 'from-gray-500/20 to-gray-600/10 border-gray-500/30';
      case 'pro_family': return 'from-blue-500/20 to-blue-600/10 border-blue-500/30';
      case 'pro_therapist': return 'from-purple-500/20 to-purple-600/10 border-purple-500/30';
      case 'institutional': return 'from-amber-500/20 to-amber-600/10 border-amber-500/30';
      default: return 'from-gray-500/20 to-gray-600/10 border-gray-500/30';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getFeaturesList = (features: Record<string, boolean>) => {
    const featureLabels: Record<string, string> = {
      stories: 'Histórias Sociais',
      basic_routines: 'Rotinas Básicas',
      limited_games: 'Jogos Limitados',
      unlimited_stories: 'Histórias Ilimitadas',
      unlimited_routines: 'Rotinas Ilimitadas',
      all_games: 'Todos os Jogos',
      progress_reports: 'Relatórios de Progresso',
      priority_support: 'Suporte Prioritário',
      clinical_reports: 'Relatórios Clínicos',
      patient_management: 'Gestão de Pacientes',
      custom_content: 'Conteúdo Personalizado',
      everything: 'Todos os Recursos',
      multi_user: 'Multi-usuário',
      admin_dashboard: 'Dashboard Admin',
      bulk_import: 'Importação em Massa',
      api_access: 'Acesso à API',
      white_label: 'White Label',
      dedicated_support: 'Suporte Dedicado'
    };

    return Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => featureLabels[key] || key);
  };

  if (loading) {
    return (
      <ModernPageLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white mb-4">Minha Assinatura</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Planos e Assinatura</h1>
          <p className="text-white/70">Escolha o plano ideal para suas necessidades</p>
        </div>
        {/* Current Subscription */}
        {currentSubscription && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    {getPlanIcon(currentSubscription.plan.plan_type)}
                  </div>
                  <div>
                    <CardTitle>Seu Plano Atual: {currentSubscription.plan.name}</CardTitle>
                    <CardDescription>
                      {currentSubscription.status === 'trial' 
                        ? `Trial até ${new Date(currentSubscription.trial_ends_at!).toLocaleDateString('pt-BR')}`
                        : `Renova em ${new Date(currentSubscription.current_period_end).toLocaleDateString('pt-BR')}`
                      }
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={currentSubscription.status === 'trial' ? 'secondary' : 'default'}>
                  {currentSubscription.status === 'trial' ? 'Trial' : 'Ativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => handleCancelSubscription()}>
                Cancelar Assinatura
              </Button>
              <Button>
                <CreditCard className="w-4 h-4 mr-2" />
                Gerenciar Pagamento
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}>
            <TabsList>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="yearly" className="relative">
                Anual
                <Badge className="absolute -top-2 -right-2 text-[10px] px-1" variant="secondary">
                  -17%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan.id === plan.id;
            const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
            const monthlyEquivalent = billingCycle === 'yearly' ? price / 12 : price;

            return (
              <Card 
                key={plan.id} 
                className={`relative bg-gradient-to-br ${getPlanColor(plan.plan_type)} ${
                  plan.plan_type === 'pro_therapist' ? 'ring-2 ring-purple-500/50' : ''
                }`}
              >
                {plan.plan_type === 'pro_therapist' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white">Mais Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto p-3 rounded-full bg-background/50 w-fit mb-2">
                    {getPlanIcon(plan.plan_type)}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{formatPrice(monthlyEquivalent)}</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                  {billingCycle === 'yearly' && price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(price)} cobrado anualmente
                    </p>
                  )}
                  {plan.trial_days > 0 && (
                    <Badge variant="outline" className="mt-2">
                      {plan.trial_days} dias grátis
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {getFeaturesList(plan.features as Record<string, boolean>).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </CardContent>

                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={isCurrentPlan ? 'secondary' : 'default'}
                    disabled={isCurrentPlan}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isCurrentPlan ? 'Plano Atual' : plan.trial_days > 0 ? 'Iniciar Trial' : 'Escolher Plano'}
                    {!isCurrentPlan && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Info Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Perguntas Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Posso cancelar a qualquer momento?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode cancelar sua assinatura a qualquer momento. O acesso continua até o fim do período pago.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Como funciona o trial?</h4>
              <p className="text-sm text-muted-foreground">
                Durante o período de trial você tem acesso completo ao plano. Não cobramos nada até o trial terminar.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Posso fazer upgrade do plano?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade a qualquer momento. O valor será calculado proporcionalmente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Plano: {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              {selectedPlan?.trial_days && selectedPlan.trial_days > 0
                ? `Você terá ${selectedPlan.trial_days} dias de trial gratuito.`
                : 'Confirme sua escolha de plano.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <span>Valor {billingCycle === 'yearly' ? 'anual' : 'mensal'}</span>
              <span className="font-bold">
                {formatPrice(billingCycle === 'yearly' 
                  ? selectedPlan?.price_yearly || 0 
                  : selectedPlan?.price_monthly || 0
                )}
              </span>
            </div>
            {selectedPlan?.trial_days && selectedPlan.trial_days > 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Cobrança apenas após o término do trial
              </p>
            )}
            <Button onClick={handleStartTrial} className="w-full">
              {selectedPlan?.trial_days && selectedPlan.trial_days > 0 
                ? 'Iniciar Trial Gratuito' 
                : 'Continuar para Pagamento'
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ModernPageLayout>
  );
}
