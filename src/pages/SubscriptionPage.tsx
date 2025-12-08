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
  CreditCard, Calendar, AlertCircle, ArrowRight, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSearchParams } from 'react-router-dom';

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

interface StripeSubscription {
  subscribed: boolean;
  plan_type: string | null;
  subscription_end: string | null;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [stripeSubscription, setStripeSubscription] = useState<StripeSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    // Handle Stripe redirect
    if (searchParams.get('success') === 'true') {
      toast.success('Assinatura realizada com sucesso!');
    } else if (searchParams.get('cancelled') === 'true') {
      toast.info('Checkout cancelado');
    }
    
    loadData();
  }, [user, searchParams]);

  const loadData = async () => {
    try {
      // Load plans from database
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

      // Check Stripe subscription status
      if (user) {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        if (!error && data) {
          setStripeSubscription(data as StripeSubscription);
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.plan_type === 'free') {
      toast.info('Plano gratuito já disponível para todos os usuários');
      return;
    }
    setSelectedPlan(plan);
    setShowUpgradeDialog(true);
  };

  const handleStripeCheckout = async () => {
    if (!selectedPlan || !user) return;

    try {
      setCheckoutLoading(true);
      
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          planType: selectedPlan.plan_type,
          billingCycle
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('Could not create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Erro ao iniciar checkout');
    } finally {
      setCheckoutLoading(false);
      setShowUpgradeDialog(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setCheckoutLoading(true);
      
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('Could not create portal session');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Erro ao abrir portal de gerenciamento');
    } finally {
      setCheckoutLoading(false);
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

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case 'free': return 'Gratuito';
      case 'pro_family': return 'Pro Família';
      case 'pro_therapist': return 'Pro Terapeuta';
      case 'institutional': return 'Institucional';
      default: return planType;
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

        {/* Current Stripe Subscription */}
        {stripeSubscription?.subscribed && (
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    {getPlanIcon(stripeSubscription.plan_type || 'free')}
                  </div>
                  <div>
                    <CardTitle>Seu Plano Atual: {getPlanLabel(stripeSubscription.plan_type || 'free')}</CardTitle>
                    <CardDescription>
                      {stripeSubscription.subscription_end 
                        ? `Renova em ${new Date(stripeSubscription.subscription_end).toLocaleDateString('pt-BR')}`
                        : 'Assinatura ativa'
                      }
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="default">Ativo</Badge>
              </div>
            </CardHeader>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                disabled={checkoutLoading}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Gerenciar Assinatura
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
            const isCurrentPlan = stripeSubscription?.plan_type === plan.plan_type;
            const price = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
            const monthlyEquivalent = billingCycle === 'yearly' ? price / 12 : price;

            return (
              <Card 
                key={plan.id} 
                className={`relative bg-gradient-to-br ${getPlanColor(plan.plan_type)} ${
                  plan.plan_type === 'pro_therapist' ? 'ring-2 ring-purple-500/50' : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}`}
              >
                {plan.plan_type === 'pro_therapist' && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white">Mais Popular</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-500 text-white">Seu Plano</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto p-3 rounded-full bg-background/50 w-fit mb-2">
                    {getPlanIcon(plan.plan_type)}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-4">
                    {price === 0 ? (
                      <span className="text-3xl font-bold">Grátis</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">{formatPrice(monthlyEquivalent)}</span>
                        <span className="text-muted-foreground">/mês</span>
                      </>
                    )}
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
                    disabled={isCurrentPlan || plan.plan_type === 'free'}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    {isCurrentPlan ? 'Plano Atual' : plan.plan_type === 'free' ? 'Disponível' : 'Escolher Plano'}
                    {!isCurrentPlan && plan.plan_type !== 'free' && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
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
              <h4 className="font-medium">Como funciona o pagamento?</h4>
              <p className="text-sm text-muted-foreground">
                Utilizamos Stripe para processar pagamentos de forma segura. Aceitamos cartões de crédito e débito.
              </p>
            </div>
            <div>
              <h4 className="font-medium">Posso fazer upgrade do plano?</h4>
              <p className="text-sm text-muted-foreground">
                Sim! Você pode fazer upgrade a qualquer momento através do portal de gerenciamento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assinar: {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Você será redirecionado para o checkout seguro do Stripe.
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="w-4 h-4" />
              <span>Pagamento seguro processado por Stripe</span>
            </div>
            <Button 
              onClick={handleStripeCheckout} 
              className="w-full"
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Continuar para Checkout
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ModernPageLayout>
  );
}
