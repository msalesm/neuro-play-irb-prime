import { GeneralMetrics, BehavioralPatterns, TemporalDataPoint, NeurodiversityProfile } from "./types.ts";

const SYSTEM_PROMPT = `Você é um psicólogo clínico especializado em avaliação neuropsicológica infantil e de adolescentes, com expertise em:
- Transtorno do Espectro Autista (TEA)
- Transtorno de Déficit de Atenção e Hiperatividade (TDAH)
- Dislexia e dificuldades de aprendizagem
- Análise de perfis cognitivos

Sua tarefa é analisar dados de desempenho cognitivo coletados através de jogos educacionais e fornecer insights clínicos profissionais.

DIRETRIZES:
1. Use linguagem técnica mas acessível para profissionais de saúde mental
2. Baseie suas conclusões nos dados fornecidos
3. Seja cauteloso ao sugerir diagnósticos - use termos como "padrões compatíveis com" ou "indicadores sugestivos de"
4. Forneça recomendações práticas e baseadas em evidências
5. Destaque tanto pontos fortes quanto áreas de dificuldade
6. Considere o contexto do perfil de neurodiversidade quando fornecido

FORMATO DE RESPOSTA (JSON):
{
  "executiveSummary": "Sumário executivo em 3-4 parágrafos detalhados",
  "domainAnalysis": {
    "attention": "Análise específica do domínio de atenção",
    "memory": "Análise específica do domínio de memória",
    "executive": "Análise das funções executivas",
    "language": "Análise das habilidades linguísticas",
    "logic": "Análise do raciocínio lógico",
    "math": "Análise das habilidades matemáticas"
  },
  "strengths": ["Força 1 identificada", "Força 2 identificada", "..."],
  "areasOfConcern": ["Preocupação 1", "Preocupação 2", "..."],
  "recommendations": ["Recomendação específica 1", "Recomendação 2", "..."],
  "diagnosticIndicators": ["Indicador diagnóstico 1 (se aplicável)", "..."]
}`;

interface PromptData {
  startDate: string;
  endDate: string;
  neurodiversityProfile: NeurodiversityProfile | null;
  generalMetrics: GeneralMetrics;
  cognitiveScores: { [category: string]: any };
  temporalEvolution: TemporalDataPoint[];
  behavioralPatterns: BehavioralPatterns;
}

export function generateAIPrompt(data: PromptData): { system: string; user: string } {
  const {
    startDate,
    endDate,
    neurodiversityProfile,
    generalMetrics,
    cognitiveScores,
    temporalEvolution,
    behavioralPatterns
  } = data;

  // Format cognitive scores
  const cognitiveScoresFormatted = Object.entries(cognitiveScores)
    .map(([category, scores]) => {
      const categoryNames: { [key: string]: string } = {
        'attention': 'Atenção',
        'memory': 'Memória',
        'executive': 'Funções Executivas',
        'language': 'Linguagem',
        'logic': 'Lógica',
        'math': 'Matemática'
      };
      
      return `${categoryNames[category] || category}:
  - Nível inicial: ${scores.initialLevel}
  - Nível atual: ${scores.currentLevel}
  - XP total: ${scores.totalXP}
  - Sessões completadas: ${scores.sessionsCompleted}
  - Acurácia média: ${scores.avgAccuracy}%
  - Melhora: ${scores.improvement > 0 ? '+' : ''}${scores.improvement}%`;
    })
    .join('\n\n');

  // Format temporal evolution
  const temporalEvolutionFormatted = temporalEvolution
    .map(point => `${point.date}: Acurácia ${point.accuracy}% (${point.sessionCount} sessões, tempo médio: ${point.avgReactionTime}ms)`)
    .join('\n');

  // Format neurodiversity profile
  const profileInfo = neurodiversityProfile
    ? `Condições detectadas: ${neurodiversityProfile.detected_conditions?.join(', ') || 'Nenhuma'}`
    : 'Perfil de neurodiversidade não disponível';

  const userPrompt = `
DADOS DO PACIENTE
==================
Período analisado: ${startDate} até ${endDate}
${profileInfo}

MÉTRICAS GERAIS
===============
- Total de sessões: ${generalMetrics.totalSessions}
- Duração total: ${generalMetrics.totalDurationMinutes} minutos
- Taxa de acurácia média: ${generalMetrics.avgAccuracy}%
- Tempo de reação médio: ${generalMetrics.avgReactionTime}ms
- Taxa de conclusão: ${generalMetrics.completionRate}%

DESEMPENHO POR DOMÍNIO COGNITIVO
=================================
${cognitiveScoresFormatted}

EVOLUÇÃO TEMPORAL
=================
${temporalEvolutionFormatted}

PADRÕES COMPORTAMENTAIS
=======================
- Erros por impulsividade: ${behavioralPatterns.errorPatterns.impulsive}
- Erros por desatenção: ${behavioralPatterns.errorPatterns.attention}
- Erros cognitivos: ${behavioralPatterns.errorPatterns.cognitive}
- Melhor horário de performance: ${behavioralPatterns.bestPerformanceTime}
- Consistência entre sessões: ${behavioralPatterns.consistencyScore}/10
- Dificuldades detectadas: ${behavioralPatterns.strugglesDetected.length > 0 ? behavioralPatterns.strugglesDetected.join(', ') : 'Nenhuma dificuldade específica detectada'}

Por favor, forneça uma análise clínica completa no formato JSON especificado. Seja específico e detalhado nas suas análises, considerando os dados quantitativos apresentados.`;

  return {
    system: SYSTEM_PROMPT,
    user: userPrompt
  };
}
