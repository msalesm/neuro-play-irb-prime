import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Brain, BookOpen, Users, BarChart3 } from 'lucide-react';
import { AbaProgramsList } from './AbaProgramsList';
import { AbaSkillsLibrary } from './AbaSkillsLibrary';
import { AbaTrialCollector } from './AbaTrialCollector';
import { AbaProgramDetail } from './AbaProgramDetail';

export function AbaNeuroPlayDashboard() {
  const { profile } = useAuth();
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  if (selectedProgramId && selectedChildId) {
    return (
      <AbaProgramDetail
        programId={selectedProgramId}
        childId={selectedChildId}
        onBack={() => { setSelectedProgramId(null); setSelectedChildId(null); }}
      />
    );
  }

  const isTherapistOrAdmin = profile?.role === 'therapist' || profile?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          ABA NeuroPlay
        </h2>
        <p className="text-muted-foreground">
          Programas de Análise do Comportamento Aplicada integrados à plataforma
        </p>
      </div>

      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs" className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            Programas
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            Habilidades
          </TabsTrigger>
          {isTherapistOrAdmin && (
            <TabsTrigger value="collect" className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Coleta Rápida
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="programs">
          <AbaProgramsList
            onSelectProgram={(programId, childId) => {
              setSelectedProgramId(programId);
              setSelectedChildId(childId);
            }}
          />
        </TabsContent>

        <TabsContent value="skills">
          <AbaSkillsLibrary />
        </TabsContent>

        {isTherapistOrAdmin && (
          <TabsContent value="collect">
            <AbaTrialCollector />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
