/**
 * Intervention Protocol Engine
 * 
 * Auto-recommends evidence-based interventions based on
 * screening results and cognitive domain scores.
 */

export interface InterventionProtocol {
  id: string;
  domain: 'attention' | 'memory' | 'language' | 'executiveFunction' | 'socialCognition';
  title: string;
  description: string;
  frequency: string;         // e.g. "3x por semana"
  duration: string;          // e.g. "10 minutos"
  durationWeeks: number;     // protocol length
  activities: InterventionActivity[];
  targetImprovement: number; // expected % improvement
  evidenceLevel: 'high' | 'moderate' | 'emerging';
}

export interface InterventionActivity {
  name: string;
  gameId?: string;           // links to platform game
  description: string;
  durationMinutes: number;
}

export interface InterventionRecommendation {
  protocol: InterventionProtocol;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  currentScore: number;
}

// ── Protocol Library ──

const PROTOCOLS: InterventionProtocol[] = [
  {
    id: 'phonological-awareness',
    domain: 'language',
    title: 'Consciência Fonológica Intensiva',
    description: 'Exercícios de discriminação, segmentação e manipulação de fonemas para fortalecer a base da leitura.',
    frequency: '3x por semana',
    duration: '10 minutos',
    durationWeeks: 4,
    activities: [
      { name: 'Rimas e Aliterações', gameId: 'SilabaMagica', description: 'Identificar palavras que rimam ou começam com o mesmo som', durationMinutes: 3 },
      { name: 'Segmentação Silábica', gameId: 'CacaLetras', description: 'Separar palavras em sílabas com palmas', durationMinutes: 3 },
      { name: 'Manipulação Fonêmica', description: 'Trocar sons iniciais para formar novas palavras', durationMinutes: 4 },
    ],
    targetImprovement: 22,
    evidenceLevel: 'high',
  },
  {
    id: 'sustained-attention',
    domain: 'attention',
    title: 'Atenção Sustentada Progressiva',
    description: 'Treino gradual de foco com aumento progressivo de duração e complexidade.',
    frequency: '4x por semana',
    duration: '8 minutos',
    durationWeeks: 3,
    activities: [
      { name: 'Caça ao Foco', gameId: 'CacaFoco', description: 'Identificar estímulos-alvo entre distratores', durationMinutes: 3 },
      { name: 'Respiração Consciente', gameId: 'MindfulBreath', description: 'Exercício de atenção plena com respiração guiada', durationMinutes: 2 },
      { name: 'Sequência Visual', description: 'Memorizar e reproduzir sequências visuais crescentes', durationMinutes: 3 },
    ],
    targetImprovement: 18,
    evidenceLevel: 'high',
  },
  {
    id: 'working-memory-training',
    domain: 'memory',
    title: 'Memória Operacional Estruturada',
    description: 'Exercícios de span crescente para ampliar a capacidade de memória de trabalho.',
    frequency: '3x por semana',
    duration: '10 minutos',
    durationWeeks: 4,
    activities: [
      { name: 'Memória Colorida', gameId: 'MemoriaColorida', description: 'Recordar sequências de cores crescentes', durationMinutes: 4 },
      { name: 'Sequência Numérica', gameId: 'AventuraNumeros', description: 'Repetir sequências numéricas de trás para frente', durationMinutes: 3 },
      { name: 'Dual-task', description: 'Lembrar itens enquanto classifica por categoria', durationMinutes: 3 },
    ],
    targetImprovement: 15,
    evidenceLevel: 'moderate',
  },
  {
    id: 'executive-flexibility',
    domain: 'executiveFunction',
    title: 'Flexibilidade Cognitiva e Planejamento',
    description: 'Atividades de alternância de regras e resolução de problemas.',
    frequency: '3x por semana',
    duration: '10 minutos',
    durationWeeks: 4,
    activities: [
      { name: 'Quebra-Cabeça Estratégico', gameId: 'QuebraCabecaMagico', description: 'Resolver problemas com mudança de estratégia', durationMinutes: 4 },
      { name: 'Alternância de Regras', description: 'Jogos com mudança de critérios de classificação', durationMinutes: 3 },
      { name: 'Planejamento Sequencial', description: 'Organizar passos para atingir um objetivo', durationMinutes: 3 },
    ],
    targetImprovement: 16,
    evidenceLevel: 'moderate',
  },
  {
    id: 'social-cognition-stories',
    domain: 'socialCognition',
    title: 'Cognição Social por Histórias',
    description: 'Uso de histórias sociais para desenvolver teoria da mente e empatia.',
    frequency: '2x por semana',
    duration: '12 minutos',
    durationWeeks: 6,
    activities: [
      { name: 'Histórias Sociais', gameId: 'ContadorHistorias', description: 'Interpretar emoções e intenções de personagens', durationMinutes: 5 },
      { name: 'Role-play Guiado', description: 'Simular situações sociais com perspectivas diferentes', durationMinutes: 4 },
      { name: 'Diário Emocional', description: 'Identificar e nomear emoções do dia', durationMinutes: 3 },
    ],
    targetImprovement: 20,
    evidenceLevel: 'emerging',
  },
];

/**
 * Generate intervention recommendations from domain scores
 */
export function generateInterventions(domains: {
  attention: number;
  memory: number;
  language: number;
  executiveFunction: number;
  socialCognition?: number;
}): InterventionRecommendation[] {
  const recommendations: InterventionRecommendation[] = [];

  const domainMap: Array<{
    key: keyof typeof domains;
    protocolDomain: InterventionProtocol['domain'];
    score: number;
    riskLabel: string;
  }> = [
    { key: 'language', protocolDomain: 'language', score: domains.language, riskLabel: 'linguagem baixa' },
    { key: 'attention', protocolDomain: 'attention', score: domains.attention, riskLabel: 'atenção reduzida' },
    { key: 'memory', protocolDomain: 'memory', score: domains.memory, riskLabel: 'memória operacional fraca' },
    { key: 'executiveFunction', protocolDomain: 'executiveFunction', score: domains.executiveFunction, riskLabel: 'função executiva abaixo do esperado' },
  ];

  if (domains.socialCognition !== undefined) {
    domainMap.push({
      key: 'socialCognition' as any,
      protocolDomain: 'socialCognition',
      score: domains.socialCognition,
      riskLabel: 'cognição social baixa',
    });
  }

  for (const d of domainMap) {
    if (d.score < 70) {
      const protocol = PROTOCOLS.find(p => p.domain === d.protocolDomain);
      if (protocol) {
        recommendations.push({
          protocol,
          reason: `Score de ${d.riskLabel}: ${d.score}/100`,
          priority: d.score < 40 ? 'high' : d.score < 55 ? 'medium' : 'low',
          currentScore: d.score,
        });
      }
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Generate class-level interventions from average scores
 */
export function generateClassInterventions(avgScores: {
  attention: number;
  memory: number;
  language: number;
  executiveFunction: number;
}): InterventionRecommendation[] {
  return generateInterventions({
    ...avgScores,
  });
}

export { PROTOCOLS as INTERVENTION_PROTOCOLS };
