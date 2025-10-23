import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { School, Building2, Users, CheckCircle } from 'lucide-react';

const partners = [
  { name: 'Escola Inovação', logo: '🏫' },
  { name: 'Clínica NeuroMente', logo: '🏥' },
  { name: 'Instituto Cognitivo', logo: '🎓' },
  { name: 'Centro Terapêutico', logo: '💙' },
];

const benefits = [
  'Acompanhamento coletivo de alunos/pacientes',
  'Relatórios detalhados por turma',
  'Suporte técnico prioritário',
  'Treinamento para educadores e terapeutas',
];

export function InstitutionalSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <School className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Para Escolas e Clínicas</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Instituições podem usar o Neuro-Play para acompanhar o progresso cognitivo de alunos e pacientes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Benefits Card */}
          <Card className="border-2">
            <CardContent className="p-8">
              <Building2 className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-6">Benefícios Institucionais</h3>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* CTA Card */}
          <Card className="border-2 bg-gradient-to-br from-primary/10 to-secondary/5">
            <CardContent className="p-8 flex flex-col justify-center h-full">
              <Users className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Interessado?</h3>
              <p className="text-muted-foreground mb-6">
                Entre em contato com nossa equipe para conhecer os planos institucionais e agendar uma demonstração.
              </p>
              <Button size="lg" className="w-full">
                Solicitar Acesso Institucional
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Partners Logos */}
        <div>
          <h3 className="text-center text-lg font-semibold text-muted-foreground mb-8">
            Instituições Parceiras
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {partners.map((partner) => (
              <Card key={partner.name} className="hover:shadow-glow transition-smooth">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{partner.logo}</div>
                  <p className="text-sm font-medium text-muted-foreground">{partner.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
