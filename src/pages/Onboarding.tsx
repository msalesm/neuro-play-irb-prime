import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { OnboardingStep1 } from '@/components/onboarding/OnboardingStep1';
import { OnboardingStep2 } from '@/components/onboarding/OnboardingStep2';
import { OnboardingStep3 } from '@/components/onboarding/OnboardingStep3';
import { OnboardingStep4 } from '@/components/onboarding/OnboardingStep4';
import { DisclaimerModal } from '@/components/onboarding/DisclaimerModal';

export interface OnboardingData {
  // Step 1
  professionalRegistration?: string;
  
  // Step 2 (terms acceptance tracked separately)
  
  // Step 3
  consents: {
    dataProcessing: boolean;
    professionalSharing: boolean;
    research: boolean;
  };
  
  // Step 4
  children: Array<{
    name: string;
    birthDate: string;
    gender?: string;
    conditions: string[];
    sensoryProfile: {
      volume: 'low' | 'medium' | 'high' | 'off';
      contrast: 'normal' | 'high';
      animations: 'smooth' | 'off';
      responseTime: 'unlimited' | '30' | '60';
      feedback: 'visual' | 'audio' | 'both';
    };
  }>;
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [data, setData] = useState<OnboardingData>({
    consents: {
      dataProcessing: false,
      professionalSharing: false,
      research: false
    },
    children: []
  });

  const steps = [
    { title: 'Dados Profissionais', component: OnboardingStep1 },
    { title: 'Termos de Uso', component: OnboardingStep2 },
    { title: 'Consentimentos', component: OnboardingStep3 },
    { title: 'Perfil da Criança', component: OnboardingStep4 }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async (stepData: Partial<OnboardingData>) => {
    setData({ ...data, ...stepData });
    
    if (currentStep === steps.length - 1) {
      // Final step - save everything
      await saveOnboarding({ ...data, ...stepData });
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveOnboarding = async (finalData: OnboardingData) => {
    if (!user) return;

    try {
      // Get user's IP (best effort)
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;
      const ipAddress = ipData?.ip || null;

      // Update profile with professional registration if provided
      if (finalData.professionalRegistration) {
        await supabase
          .from('profiles')
          .update({ professional_registration: finalData.professionalRegistration })
          .eq('id', user.id);
      }

      // Save consents
      const consentsToSave = [
        {
          user_id: user.id,
          consent_type: 'data_processing',
          consent_given: finalData.consents.dataProcessing,
          consent_version: '1.0.0',
          ip_address: ipAddress,
          user_agent: navigator.userAgent
        },
        {
          user_id: user.id,
          consent_type: 'professional_sharing',
          consent_given: finalData.consents.professionalSharing,
          consent_version: '1.0.0',
          ip_address: ipAddress,
          user_agent: navigator.userAgent
        },
        {
          user_id: user.id,
          consent_type: 'research',
          consent_given: finalData.consents.research,
          consent_version: '1.0.0',
          ip_address: ipAddress,
          user_agent: navigator.userAgent
        }
      ];

      await supabase.from('data_consents').insert(consentsToSave);

      // Save children profiles
      for (const child of finalData.children) {
        const { error } = await supabase.from('children').insert({
          parent_id: user.id,
          name: child.name,
          birth_date: child.birthDate,
          gender: child.gender,
          neurodevelopmental_conditions: child.conditions,
          sensory_profile: child.sensoryProfile,
          consent_data_usage: finalData.consents.dataProcessing,
          consent_research: finalData.consents.research
        });

        if (error) throw error;
      }

      // Log audit
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'complete_onboarding',
        resource_type: 'onboarding',
        ip_address: ipAddress,
        user_agent: navigator.userAgent
      });

      toast.success('Onboarding concluído com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    }
  };

  if (showDisclaimer) {
    return (
      <DisclaimerModal
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo à NeuroPlay</CardTitle>
            <CardDescription>
              Etapa {currentStep + 1} de {steps.length}: {steps[currentStep].title}
            </CardDescription>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              data={data}
              onNext={handleNext}
              onBack={currentStep > 0 ? handleBack : undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
