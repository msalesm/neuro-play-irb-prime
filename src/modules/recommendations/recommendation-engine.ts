/**
 * Recommendation Engine
 * 
 * Generates role-specific practical recommendations based on child performance data.
 */

import { generateTeacherRecommendations } from './teacher-recommendations';
import { generateParentRecommendations } from './parent-recommendations';

// ─── Types ────────────────────────────────────────────────

export interface RoleRecommendation {
  id: string;
  category: 'attention' | 'memory' | 'flexibility' | 'persistence' | 'emotional' | 'executive' | 'social' | 'general';
  title: string;
  description: string;
  actionSteps: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  frequency?: string;
}

export interface RecommendationContext {
  domainScores: Record<string, number>; // domain → 0-100
  weakDomains: string[];
  strongDomains: string[];
  frustrationLevel?: 'calm' | 'mild' | 'moderate' | 'high';
  persistenceLevel?: 'strong' | 'moderate' | 'weak';
  ageGroup?: string;
}

// ─── Main Generator ───────────────────────────────────────

export function generateRoleRecommendations(
  role: 'teacher' | 'parent' | 'therapist',
  context: RecommendationContext
): RoleRecommendation[] {
  switch (role) {
    case 'teacher':
      return generateTeacherRecommendations(context);
    case 'parent':
      return generateParentRecommendations(context);
    case 'therapist':
      return generateTherapistRecommendations(context);
    default:
      return [];
  }
}

// ─── Therapist Recommendations ────────────────────────────

function generateTherapistRecommendations(context: RecommendationContext): RoleRecommendation[] {
  const recs: RoleRecommendation[] = [];
  let id = 0;

  for (const domain of context.weakDomains) {
    const score = context.domainScores[domain] ?? 50;
    
    if (domain === 'attention' && score < 45) {
      recs.push({
        id: `th_${++id}`,
        category: 'attention',
        title: 'Protocolo de Atenção Sustentada',
        description: 'Implementar treino de atenção com duração progressiva e monitoramento de fadiga atencional.',
        actionSteps: [
          'Iniciar com blocos de 2 minutos, aumentando 30s por sessão',
          'Monitorar curva de desempenho intra-sessão',
          'Documentar pontos de fadiga para ajuste do protocolo',
          'Usar reforço diferencial para respostas rápidas e corretas',
        ],
        priority: score < 35 ? 'high' : 'medium',
        estimatedImpact: 'Melhora de 10-15 pontos em 4-6 semanas com treino consistente',
        frequency: '3-4x por semana',
      });
    }

    if (domain === 'inhibition' && score < 45) {
      recs.push({
        id: `th_${++id}`,
        category: 'attention',
        title: 'Programa de Controle Inibitório',
        description: 'Treino Go/No-Go estruturado com aumento gradual de complexidade.',
        actionSteps: [
          'Começar com razão 80/20 (Go/No-Go) e reduzir para 50/50',
          'Incluir análise de erros de comissão vs omissão',
          'Integrar com estratégias de autorregulação verbal',
        ],
        priority: score < 35 ? 'high' : 'medium',
        estimatedImpact: 'Redução de impulsividade mensurável em 3-4 semanas',
        frequency: '3x por semana',
      });
    }

    if (domain === 'memory' && score < 45) {
      recs.push({
        id: `th_${++id}`,
        category: 'memory',
        title: 'Expansão de Memória Operacional',
        description: 'Treino de span com aumento gradual e estratégias de chunking.',
        actionSteps: [
          'Iniciar no span atual da criança (baseline)',
          'Aumentar 1 item a cada 3 sessões com sucesso ≥80%',
          'Ensinar estratégias de agrupamento e repetição',
        ],
        priority: 'medium',
        estimatedImpact: 'Aumento de 1-2 no span em 6-8 semanas',
        frequency: '4x por semana',
      });
    }
  }

  if (context.frustrationLevel === 'high') {
    recs.push({
      id: `th_${++id}`,
      category: 'emotional',
      title: 'Protocolo Anti-Frustração',
      description: 'Ajustar dificuldade e incluir regulação emocional antes das sessões.',
      actionSteps: [
        'Iniciar cada sessão com 2min de respiração guiada',
        'Reduzir dificuldade temporariamente para rebuildar confiança',
        'Aplicar reforço positivo baseado em esforço (não só em acerto)',
        'Monitorar sinais de desistência e intervir proativamente',
      ],
      priority: 'high',
      estimatedImpact: 'Redução de frustração e aumento de persistência',
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: `th_${++id}`,
      category: 'general',
      title: 'Manutenção e Evolução',
      description: 'Perfil adequado — manter estimulação variada com aumento gradual de complexidade.',
      actionSteps: [
        'Aumentar dificuldade gradualmente nos domínios fortes',
        'Monitorar consistência ao longo do tempo',
        'Introduzir desafios cross-domain (ex: memória + flexibilidade)',
      ],
      priority: 'low',
      estimatedImpact: 'Consolidação e generalização das habilidades',
    });
  }

  return recs;
}
