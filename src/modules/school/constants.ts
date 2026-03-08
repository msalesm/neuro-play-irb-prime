/**
 * School Mode Constants
 * 
 * Educational-only language — NO clinical or diagnostic terms.
 */

export const QUICK_ACTIVITY_DURATION_MS = 3 * 60 * 1000; // 3 minutes

/** Educational labels that replace clinical terminology */
export const EDUCATIONAL_LABELS = {
  // Domains (educational framing)
  attention: 'Foco e Concentração',
  memory: 'Memória e Aprendizagem',
  flexibility: 'Adaptabilidade',
  coordination: 'Coordenação',
  persistence: 'Persistência e Esforço',
  inhibition: 'Autocontrole',
  
  // Socioemotional (educational framing)
  empathy: 'Convivência Social',
  impulseControl: 'Autocontrole',
  socialFlexibility: 'Adaptação Social',
  frustrationTolerance: 'Resiliência',
  emotionalRegulation: 'Autorregulação',
  
  // Executive (educational framing)
  organization: 'Organização',
  autonomy: 'Autonomia',
  taskInitiation: 'Iniciativa',
  completion: 'Conclusão de Tarefas',

  // Risk levels → educational levels
  adequate: 'Desenvolvido',
  monitoring: 'Em Progresso',
  needsSupport: 'Necessita Apoio',
  intervention: 'Apoio Prioritário',

  // Trends
  up: 'Evoluindo',
  stable: 'Estável',
  down: 'Necessita Atenção',
} as const;

/** Quick activities available for 3-min school sessions */
export const QUICK_ACTIVITIES = [
  {
    id: 'foco-rapido',
    name: 'Foco Rápido',
    description: 'Encontre os alvos antes do tempo acabar',
    domain: 'attention' as const,
    path: '/games/foco-rapido-phases',
    durationSeconds: 120,
    icon: '🎯',
  },
  {
    id: 'memoria-colorida',
    name: 'Memória Colorida',
    description: 'Lembre a sequência de cores',
    domain: 'memory' as const,
    path: '/games/memoria-colorida',
    durationSeconds: 150,
    icon: '🌈',
  },
  {
    id: 'logica-rapida',
    name: 'Lógica Rápida',
    description: 'Resolva os padrões rapidamente',
    domain: 'flexibility' as const,
    path: '/games/logica-rapida',
    durationSeconds: 120,
    icon: '⚡',
  },
  {
    id: 'cosmic-sequence',
    name: 'Sequência Cósmica',
    description: 'Repita a sequência na ordem certa',
    domain: 'memory' as const,
    path: '/games/cosmic-sequence',
    durationSeconds: 150,
    icon: '🌟',
  },
  {
    id: 'visual-sync',
    name: 'Sincronia Visual',
    description: 'Combine os pares antes do tempo',
    domain: 'coordination' as const,
    path: '/games/visual-sync',
    durationSeconds: 120,
    icon: '👁️',
  },
  {
    id: 'social-story-quick',
    name: 'Momento Social',
    description: 'Uma história rápida sobre convivência',
    domain: 'empathy' as const,
    path: '/stories',
    durationSeconds: 180,
    icon: '💬',
  },
] as const;
