import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAbaSkills } from '@/hooks/useAbaNeuroPlay';

const categoryLabels: Record<string, string> = {
  atencao_conjunta: 'Atenção Conjunta',
  imitacao: 'Imitação',
  comunicacao_funcional: 'Comunicação Funcional',
  instrucoes_simples: 'Instruções Simples',
  regulacao_emocional: 'Regulação Emocional',
  flexibilidade_cognitiva: 'Flexibilidade Cognitiva',
  interacao_social: 'Interação Social',
  autonomia: 'Autonomia',
};

const categoryColors: Record<string, string> = {
  atencao_conjunta: 'bg-info/10 text-info',
  imitacao: 'bg-primary/10 text-primary',
  comunicacao_funcional: 'bg-success/10 text-success',
  instrucoes_simples: 'bg-warning/10 text-warning',
  regulacao_emocional: 'bg-destructive/10 text-destructive',
  flexibilidade_cognitiva: 'bg-info/20 text-info',
  interacao_social: 'bg-warning/20 text-warning',
  autonomia: 'bg-success/20 text-success',
};

export function AbaSkillsLibrary() {
  const { data: skills, isLoading } = useAbaSkills();

  // Group by category
  const grouped = (skills || []).reduce((acc: Record<string, any[]>, s: any) => {
    const cat = s.skill_category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Biblioteca de Habilidades ABA</CardTitle>
          <CardDescription>Habilidades disponíveis para incluir em programas</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([category, catSkills]) => (
                <div key={category}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[category] || ''}`}>
                      {categoryLabels[category] || category}
                    </span>
                    <span className="text-sm text-muted-foreground">({(catSkills as any[]).length})</span>
                  </h3>
                  <div className="grid gap-2">
                    {(catSkills as any[]).map((skill) => (
                      <div key={skill.id} className="p-3 border rounded-lg">
                        <p className="font-medium text-sm">{skill.skill_name}</p>
                        {skill.description && (
                          <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
