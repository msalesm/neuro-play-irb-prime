/**
 * Intervention Recommender
 * 
 * Generates specific intervention recommendations
 * based on adaptive analysis and performance patterns.
 */

import type { AdaptiveProfile, FrustrationState } from './adaptive-engine';
import type { CognitiveDomain } from '@/modules/games/engine';

// ─── Types ────────────────────────────────────────────────

export interface InterventionRecommendation {
  id: string;
  category: 'game' | 'routine' | 'story' | 'exercise' | 'break';
  title: string;
  description: string;
  targetDomain: CognitiveDomain | 'emotional-regulation' | 'executive';
  priority: 'high' | 'medium' | 'low';
  estimatedDurationMinutes: number;
  suggestedPath?: string;
}

// ─── Recommendation Generator ─────────────────────────────

export function generateInterventionRecommendations(
  profile: AdaptiveProfile,
  weakDomains: CognitiveDomain[] = []
): InterventionRecommendation[] {
  const recommendations: InterventionRecommendation[] = [];
  let idCounter = 0;
  const nextId = () => `rec_${++idCounter}`;

  // Frustration-based recommendations
  if (profile.frustrationLevel === 'high' || profile.frustrationLevel === 'moderate') {
    recommendations.push({
      id: nextId(),
      category: 'exercise',
      title: 'Exercício de Respiração',
      description: 'Respiração guiada para reduzir ansiedade antes da próxima atividade',
      targetDomain: 'emotional-regulation',
      priority: 'high',
      estimatedDurationMinutes: 2,
      suggestedPath: '/games/mindful-breath',
    });
  }

  // Persistence-based recommendations
  if (profile.persistenceClassification === 'weak') {
    recommendations.push({
      id: nextId(),
      category: 'game',
      title: 'Atividade Curta de Coordenação',
      description: 'Tarefa breve e gratificante para recuperar engajamento',
      targetDomain: 'coordination',
      priority: 'high',
      estimatedDurationMinutes: 3,
      suggestedPath: '/games/stack-tower',
    });
  }

  // Engagement-based recommendations
  if (profile.engagementLevel === 'disengaged' || profile.engagementLevel === 'low') {
    recommendations.push({
      id: nextId(),
      category: 'break',
      title: 'Pausa Ativa',
      description: 'Momento de descanso com atividade lúdica livre',
      targetDomain: 'emotional-regulation',
      priority: 'high',
      estimatedDurationMinutes: 5,
    });
    recommendations.push({
      id: nextId(),
      category: 'story',
      title: 'História Social Interativa',
      description: 'Engajar através de narrativa com escolhas',
      targetDomain: 'emotional-regulation',
      priority: 'medium',
      estimatedDurationMinutes: 5,
      suggestedPath: '/stories',
    });
  }

  // Domain-specific recommendations for weak areas
  for (const domain of weakDomains) {
    const rec = getDomainRecommendation(nextId(), domain);
    if (rec) recommendations.push(rec);
  }

  // Challenge recommendations for high performers
  if (profile.interventionType === 'challenge') {
    recommendations.push({
      id: nextId(),
      category: 'game',
      title: 'Desafio Avançado',
      description: 'Atividade de nível superior para estimular crescimento',
      targetDomain: 'flexibility',
      priority: 'medium',
      estimatedDurationMinutes: 5,
      suggestedPath: '/games/cognitive-flexibility-phases',
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function getDomainRecommendation(
  id: string,
  domain: CognitiveDomain
): InterventionRecommendation | null {
  const map: Record<CognitiveDomain, Omit<InterventionRecommendation, 'id'>> = {
    attention: {
      category: 'game',
      title: 'Treino de Atenção Sustentada',
      description: 'Atividade progressiva de foco com duração crescente',
      targetDomain: 'attention',
      priority: 'medium',
      estimatedDurationMinutes: 5,
      suggestedPath: '/games/attention-sustained-phases',
    },
    inhibition: {
      category: 'game',
      title: 'Controle Inibitório',
      description: 'Exercício Go/No-Go para treinar autocontrole',
      targetDomain: 'inhibition',
      priority: 'medium',
      estimatedDurationMinutes: 4,
      suggestedPath: '/games/executive-processing-phases',
    },
    memory: {
      category: 'game',
      title: 'Memória Operacional',
      description: 'Sequências crescentes para expandir span de memória',
      targetDomain: 'memory',
      priority: 'medium',
      estimatedDurationMinutes: 5,
      suggestedPath: '/games/cosmic-sequence',
    },
    flexibility: {
      category: 'game',
      title: 'Flexibilidade Cognitiva',
      description: 'Troca de regras para treinar adaptação mental',
      targetDomain: 'flexibility',
      priority: 'medium',
      estimatedDurationMinutes: 5,
      suggestedPath: '/games/cognitive-flexibility-phases',
    },
    coordination: {
      category: 'game',
      title: 'Coordenação Visomotora',
      description: 'Atividade de precisão e timing',
      targetDomain: 'coordination',
      priority: 'low',
      estimatedDurationMinutes: 4,
      suggestedPath: '/games/visuomotor-coordination',
    },
    persistence: {
      category: 'game',
      title: 'Persistência Comportamental',
      description: 'Desafio gradual com reforço positivo',
      targetDomain: 'persistence',
      priority: 'medium',
      estimatedDurationMinutes: 5,
      suggestedPath: '/games/behavioral-persistence',
    },
    'emotional-regulation': {
      category: 'exercise',
      title: 'Regulação Emocional',
      description: 'Atividade de reconhecimento e manejo emocional',
      targetDomain: 'emotional-regulation',
      priority: 'medium',
      estimatedDurationMinutes: 5,
      suggestedPath: '/games/emotional-weather',
    },
  };

  const rec = map[domain];
  return rec ? { id, ...rec } : null;
}
