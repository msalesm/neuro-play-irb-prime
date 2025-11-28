import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { RoleSelectionStep } from './steps/RoleSelectionStep';
import { UserDataStep } from './steps/UserDataStep';
import { TermsStep } from './steps/TermsStep';
import { ConsentsStep } from './steps/ConsentsStep';
import { ChildProfileStep } from './steps/ChildProfileStep';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type OnboardingData = {
  // Step 1: Role Selection
  selectedRole: 'parent' | 'therapist' | 'user' | 'admin' | null;
  
  // Step 2: User Data
  fullName: string;
  email: string;
  phone: string;
  
  // Step 3: Terms (just acceptance)
  termsAccepted: boolean;
  privacyAccepted: boolean;
  
  // Step 4: Consents (LGPD granular)
  consentAnonymousData: boolean;
  consentResearch: boolean;
  consentClinicalSharing: boolean;
  
  // Step 5: Child Profile (only for parents)
  childName: string;
  childBirthDate: string;
  childGender: string;
  childAvatar?: {
    id: string;
    name: string;
    emoji: string;
    category: 'animals' | 'robots' | 'heroes';
  };
  diagnosedConditions: string[];
  sensoryProfile: {
    soundSensitivity: number;
    lightSensitivity: number;
    touchSensitivity: number;
    visualStimulation: number;
  };
};

const STEPS = [
  { id: 1, title: 'Seu Perfil', description: 'Como você usará a plataforma' },
  { id: 2, title: 'Dados Pessoais', description: 'Informações básicas' },
  { id: 3, title: 'Termos de Uso', description: 'Aceite os termos' },
  { id: 4, title: 'Consentimentos LGPD', description: 'Suas escolhas de privacidade' },
  { id: 5, title: 'Perfil da Criança', description: 'Configuração terapêutica' },
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    selectedRole: null,
    fullName: '',
    email: '',
    phone: '',
    termsAccepted: false,
    privacyAccepted: false,
    consentAnonymousData: false,
    consentResearch: false,
    consentClinicalSharing: false,
    childName: '',
    childBirthDate: '',
    childGender: '',
    diagnosedConditions: [],
    sensoryProfile: {
      soundSensitivity: 5,
      lightSensitivity: 5,
      touchSensitivity: 5,
      visualStimulation: 5,
    },
  });

  const progress = (currentStep / STEPS.length) * 100;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.selectedRole !== null;
      case 2:
        return data.fullName && data.email && data.phone;
      case 3:
        return data.termsAccepted && data.privacyAccepted;
      case 4:
        return true; // Consents are optional
      case 5:
        // Child profile only required for parents
        if (data.selectedRole === 'parent') {
          return data.childName && data.childBirthDate;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Save user role
      if (data.selectedRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: data.selectedRole,
          });

        if (roleError) throw roleError;
      }

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          email: data.email,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Save consents
      const consents = [
        { type: 'anonymous_data', given: data.consentAnonymousData },
        { type: 'research', given: data.consentResearch },
        { type: 'clinical_sharing', given: data.consentClinicalSharing },
      ];

      for (const consent of consents) {
        await supabase.from('data_consents').insert({
          user_id: user.id,
          consent_type: consent.type,
          consent_given: consent.given,
          consent_version: '1.0',
        });
      }

      // Create child profile (only for parents)
      if (data.selectedRole === 'parent') {
        const { error: childError } = await supabase
          .from('children')
          .insert({
            parent_id: user.id,
            name: data.childName,
            birth_date: data.childBirthDate,
            gender: data.childGender || null,
            avatar_url: data.childAvatar ? JSON.stringify(data.childAvatar) : null,
            neurodevelopmental_conditions: data.diagnosedConditions,
            sensory_profile: data.sensoryProfile,
            consent_data_usage: data.consentAnonymousData,
            consent_research: data.consentResearch,
          });

        if (childError) throw childError;
      }

      toast.success('Perfil criado com sucesso!');
      
      // Navigate based on role
      switch (data.selectedRole) {
        case 'parent':
          navigate('/dashboard');
          break;
        case 'therapist':
          navigate('/therapist/patients');
          break;
        case 'user': // teacher
          navigate('/teacher/classes');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Erro ao finalizar onboarding:', error);
      toast.error(error.message || 'Erro ao salvar dados');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RoleSelectionStep data={data} updateData={updateData} />;
      case 2:
        return <UserDataStep data={data} updateData={updateData} />;
      case 3:
        return <TermsStep data={data} updateData={updateData} />;
      case 4:
        return <ConsentsStep data={data} updateData={updateData} />;
      case 5:
        // Only show child profile for parents
        if (data.selectedRole === 'parent') {
          return <ChildProfileStep data={data} updateData={updateData} />;
        }
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-irb-petrol mb-2">Pronto para começar!</h3>
            <p className="text-muted-foreground">
              Clique em Finalizar para acessar sua área profissional.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-strong">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl font-bold text-irb-petrol">
                Bem-vindo à NeuroPlay
              </CardTitle>
              <CardDescription className="text-base mt-1">
                Configure seu perfil terapêutico em {data.selectedRole === 'parent' ? '5' : '4'} etapas
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Etapa</div>
              <div className="text-2xl font-bold text-irb-blue">
                {currentStep} / {STEPS.length}
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex gap-2 mt-4">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  step.id === currentStep
                    ? 'border-irb-blue bg-secondary/10'
                    : step.id < currentStep
                    ? 'border-green-500 bg-green-50'
                    : 'border-border bg-muted/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {step.id < currentStep ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                      {step.id}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{step.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{step.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="flex-1"
            >
              Voltar
            </Button>
            
            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 bg-irb-blue hover:bg-irb-petrol"
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!canProceed() || isSubmitting}
                className="flex-1 bg-gradient-gold hover:opacity-90"
              >
                {isSubmitting ? 'Salvando...' : 'Finalizar'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
