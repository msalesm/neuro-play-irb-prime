/**
 * Trait Profile Engine
 *
 * Maps the UnifiedProfile (cognitive + socioemotional + executive scores)
 * to playful pedagogical traits used to communicate the child's profile
 * with families and teachers.
 *
 * IMPORTANT: These are NOT clinical labels. They are observed behavioral
 * tendencies expressed in a positive, strengths-first language.
 */

import type { UnifiedProfile, DomainScore } from './engine';

export type TraitId =
  | 'curious'
  | 'reflective'
  | 'leader'
  | 'dreamer'
  | 'persistent'
  | 'creative'
  | 'empathic'
  | 'organized'
  | 'explorer'
  | 'communicator'
  | 'focused'
  | 'flexible';

export interface Trait {
  id: TraitId;
  name: string;
  emoji: string;
  description: string;
  /** 0-100 — strength of evidence for this trait */
  intensity: number;
  /** Pedagogical strategy suggestions (short, classroom-friendly) */
  suggestions: string[];
}

export interface TraitProfile {
  childId: string;
  generatedAt: string;
  /** Top 3-5 traits ordered by intensity */
  dominantTraits: Trait[];
  /** Traits that are emerging (intensity 40-65) */
  emergingTraits: Trait[];
  /** Single-sentence narrative of the child's profile */
  narrative: string;
  /** Quick win suggestions a teacher can apply today */
  classroomQuickWins: string[];
  dataCompleteness: number;
}

// ─── Trait Catalog ────────────────────────────────────────
// Each entry knows how to score itself from the UnifiedProfile.

type TraitDefinition = {
  id: TraitId;
  name: string;
  emoji: string;
  description: string;
  /** Returns 0-100 intensity given the unified profile */
  score: (p: UnifiedProfile) => number;
  suggestions: string[];
};

const s = (d: DomainScore | undefined) => d?.score ?? 50;

const TRAITS: TraitDefinition[] = [
  {
    id: 'curious',
    name: 'Curioso',
    emoji: '🔎',
    description: 'Explora novidades com entusiasmo e faz muitas perguntas.',
    score: (p) => (s(p.cognitive.flexibility) * 0.6 + s(p.cognitive.attention) * 0.4),
    suggestions: [
      'Ofereça desafios com elementos novos a cada semana',
      'Permita perguntas abertas no fim das atividades',
    ],
  },
  {
    id: 'reflective',
    name: 'Reflexivo',
    emoji: '💭',
    description: 'Pensa antes de agir e responde com cuidado.',
    score: (p) =>
      (s(p.socioemotional.impulseControl) * 0.55 + s(p.cognitive.memory) * 0.25 + s(p.cognitive.attention) * 0.2),
    suggestions: [
      'Dê tempo extra para responder antes de chamar o próximo aluno',
      'Valorize respostas elaboradas, não apenas as mais rápidas',
    ],
  },
  {
    id: 'leader',
    name: 'Líder',
    emoji: '🌟',
    description: 'Organiza colegas e toma iniciativa em grupo.',
    score: (p) =>
      (s(p.executive.taskInitiation) * 0.4 + s(p.socioemotional.socialFlexibility) * 0.35 + s(p.executive.organization) * 0.25),
    suggestions: [
      'Designe pequenos papéis de coordenação em atividades colaborativas',
      'Convide para apresentar instruções de jogos aos colegas',
    ],
  },
  {
    id: 'dreamer',
    name: 'Sonhador',
    emoji: '☁️',
    description: 'Tem pensamento criativo e imaginação fértil.',
    score: (p) =>
      (Math.max(0, 100 - s(p.cognitive.attention)) * 0.4 +
        s(p.cognitive.flexibility) * 0.4 +
        s(p.socioemotional.empathy) * 0.2),
    suggestions: [
      'Inclua atividades de invenção, desenho livre ou contação de histórias',
      'Use ancoragens visuais leves para apoiar transições de foco',
    ],
  },
  {
    id: 'persistent',
    name: 'Persistente',
    emoji: '🧗',
    description: 'Insiste em tarefas difíceis até completar.',
    score: (p) =>
      (s(p.cognitive.persistence) * 0.6 +
        s(p.socioemotional.frustrationTolerance) * 0.25 +
        s(p.executive.completion) * 0.15),
    suggestions: [
      'Reconheça o esforço, não só o acerto',
      'Proponha desafios escalonados em pequenos passos',
    ],
  },
  {
    id: 'creative',
    name: 'Criativo',
    emoji: '🎨',
    description: 'Encontra soluções incomuns e gosta de criar.',
    score: (p) => (s(p.cognitive.flexibility) * 0.6 + s(p.socioemotional.empathy) * 0.2 + s(p.cognitive.coordination) * 0.2),
    suggestions: [
      'Ofereça materiais abertos (desenho, montagem, dramatização)',
      'Aceite múltiplas respostas certas para o mesmo problema',
    ],
  },
  {
    id: 'empathic',
    name: 'Empático',
    emoji: '💗',
    description: 'Percebe sentimentos dos outros e oferece apoio.',
    score: (p) =>
      (s(p.socioemotional.empathy) * 0.7 + s(p.socioemotional.socialFlexibility) * 0.3),
    suggestions: [
      'Convide para mediar conflitos pequenos entre colegas',
      'Use narrativas com diferentes pontos de vista',
    ],
  },
  {
    id: 'organized',
    name: 'Organizado',
    emoji: '📋',
    description: 'Gosta de rotinas claras e sequência das tarefas.',
    score: (p) =>
      (s(p.executive.organization) * 0.55 + s(p.executive.completion) * 0.25 + s(p.cognitive.attention) * 0.2),
    suggestions: [
      'Compartilhe a agenda do dia logo no começo da aula',
      'Use listas visuais de "feito / fazendo / a fazer"',
    ],
  },
  {
    id: 'explorer',
    name: 'Explorador',
    emoji: '🧭',
    description: 'Aprende fazendo, mexendo, testando.',
    score: (p) =>
      (s(p.cognitive.coordination) * 0.45 + s(p.executive.taskInitiation) * 0.3 + s(p.cognitive.flexibility) * 0.25),
    suggestions: [
      'Inclua atividades manuais e jogos de movimento',
      'Permita escolhas entre 2-3 caminhos para a mesma tarefa',
    ],
  },
  {
    id: 'communicator',
    name: 'Comunicador',
    emoji: '💬',
    description: 'Expressa ideias com facilidade e gosta de conversar.',
    score: (p) =>
      (s(p.socioemotional.socialFlexibility) * 0.5 + s(p.socioemotional.empathy) * 0.3 + s(p.cognitive.flexibility) * 0.2),
    suggestions: [
      'Reserve momentos curtos de "roda de fala"',
      'Convide para explicar uma resposta em voz alta',
    ],
  },
  {
    id: 'focused',
    name: 'Focado',
    emoji: '🎯',
    description: 'Mantém atenção em tarefas longas com facilidade.',
    score: (p) =>
      (s(p.cognitive.attention) * 0.65 + s(p.cognitive.persistence) * 0.2 + s(p.executive.completion) * 0.15),
    suggestions: [
      'Ofereça desafios que demandem concentração estendida',
      'Conecte com colegas que se beneficiam de modelagem de foco',
    ],
  },
  {
    id: 'flexible',
    name: 'Flexível',
    emoji: '🌀',
    description: 'Adapta-se com tranquilidade a mudanças de plano.',
    score: (p) =>
      (s(p.cognitive.flexibility) * 0.6 + s(p.socioemotional.frustrationTolerance) * 0.4),
    suggestions: [
      'Aproveite para introduzir novidades sem grande aviso prévio',
      'Use como "pareamento positivo" para colegas que precisam de previsibilidade',
    ],
  },
];

// ─── Engine ───────────────────────────────────────────────

export function generateTraitProfile(profile: UnifiedProfile): TraitProfile {
  const scored: Trait[] = TRAITS.map((t) => ({
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    description: t.description,
    intensity: Math.round(Math.max(0, Math.min(100, t.score(profile)))),
    suggestions: t.suggestions,
  })).sort((a, b) => b.intensity - a.intensity);

  // Dominant: top 4 with intensity >= 65, but always show at least 3
  const candidatesDominant = scored.filter((t) => t.intensity >= 65).slice(0, 4);
  const dominantTraits = candidatesDominant.length >= 3 ? candidatesDominant : scored.slice(0, 3);

  const dominantIds = new Set(dominantTraits.map((t) => t.id));
  const emergingTraits = scored
    .filter((t) => !dominantIds.has(t.id) && t.intensity >= 40 && t.intensity < 65)
    .slice(0, 3);

  // Build narrative — short, positive, plural-aware.
  const top = dominantTraits.slice(0, 3).map((t) => t.name.toLowerCase());
  let narrative: string;
  if (top.length === 0) {
    narrative = 'Ainda estamos coletando observações para formar um perfil.';
  } else if (top.length === 1) {
    narrative = `Apresenta um perfil predominantemente ${top[0]}.`;
  } else {
    const last = top.pop();
    narrative = `Apresenta um perfil ${top.join(', ')} e ${last}, com várias forças que podem ser aproveitadas em sala.`;
  }

  // Classroom quick wins: take 1 suggestion from each of the top 3 traits, dedupe.
  const quickWins = Array.from(
    new Set(dominantTraits.slice(0, 3).map((t) => t.suggestions[0]).filter(Boolean))
  ).slice(0, 3);

  return {
    childId: profile.childId,
    generatedAt: new Date().toISOString(),
    dominantTraits,
    emergingTraits,
    narrative,
    classroomQuickWins: quickWins,
    dataCompleteness: profile.dataCompleteness,
  };
}

/** Color palette helper for UI badges based on intensity */
export function traitToneClass(intensity: number): string {
  if (intensity >= 80) return 'bg-primary/15 text-primary border-primary/30';
  if (intensity >= 65) return 'bg-chart-2/15 text-chart-2 border-chart-2/30';
  if (intensity >= 50) return 'bg-chart-3/15 text-chart-3 border-chart-3/30';
  return 'bg-muted text-muted-foreground border-border';
}