/**
 * NeuroPlay Cognitive Index (NCI)
 * 
 * Proprietary 0-100 score combining 5 cognitive domains
 * into a single, trackable neurodevelopment metric.
 * 
 * Domains & Weights:
 *   Attention:          25%
 *   Working Memory:     25%
 *   Language:           20%
 *   Executive Function: 20%
 *   Social Cognition:   10%
 * 
 * Score bands:
 *   85-100  Avançado
 *   70-84   Adequado
 *   50-69   Atenção
 *   30-49   Intervenção
 *   0-29    Intervenção Urgente
 */

export interface NCIDomains {
  attention: number;       // 0-100
  memory: number;          // 0-100
  language: number;        // 0-100
  executiveFunction: number; // 0-100
  socialCognition?: number;  // 0-100 (optional, defaults to average of others)
}

export interface NCIResult {
  score: number;           // 0-100 composite
  band: NCIBand;
  domains: NCIDomains;
  timestamp: string;
}

export type NCIBand = 'advanced' | 'adequate' | 'monitoring' | 'intervention' | 'urgent';

export interface NCIBandInfo {
  key: NCIBand;
  label: string;
  labelPt: string;
  min: number;
  max: number;
  color: string;        // tailwind token
  description: string;
}

export const NCI_BANDS: NCIBandInfo[] = [
  { key: 'advanced', label: 'Advanced', labelPt: 'Avançado', min: 85, max: 100, color: 'text-chart-3', description: 'Desempenho acima do esperado para a faixa etária' },
  { key: 'adequate', label: 'Adequate', labelPt: 'Adequado', min: 70, max: 84, color: 'text-primary', description: 'Desenvolvimento dentro do esperado' },
  { key: 'monitoring', label: 'Monitoring', labelPt: 'Atenção', min: 50, max: 69, color: 'text-chart-4', description: 'Necessita acompanhamento e estímulo adicional' },
  { key: 'intervention', label: 'Intervention', labelPt: 'Intervenção', min: 30, max: 49, color: 'text-destructive', description: 'Recomendada intervenção pedagógica estruturada' },
  { key: 'urgent', label: 'Urgent', labelPt: 'Intervenção Urgente', min: 0, max: 29, color: 'text-destructive', description: 'Encaminhamento para avaliação especializada' },
];

const DOMAIN_WEIGHTS = {
  attention: 0.25,
  memory: 0.25,
  language: 0.20,
  executiveFunction: 0.20,
  socialCognition: 0.10,
};

/**
 * Calculate the NeuroPlay Cognitive Index from domain scores
 */
export function calculateNCI(domains: NCIDomains): NCIResult {
  const social = domains.socialCognition ?? Math.round(
    (domains.attention + domains.memory + domains.language + domains.executiveFunction) / 4
  );

  const score = Math.round(
    domains.attention * DOMAIN_WEIGHTS.attention +
    domains.memory * DOMAIN_WEIGHTS.memory +
    domains.language * DOMAIN_WEIGHTS.language +
    domains.executiveFunction * DOMAIN_WEIGHTS.executiveFunction +
    social * DOMAIN_WEIGHTS.socialCognition
  );

  const clampedScore = Math.max(0, Math.min(100, score));

  return {
    score: clampedScore,
    band: getBand(clampedScore),
    domains: { ...domains, socialCognition: social },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate NCI from scan result row (classroom scan data)
 */
export function calculateNCIFromScan(scanResult: {
  attention_score?: number | null;
  memory_score?: number | null;
  language_score?: number | null;
  executive_function_score?: number | null;
}): NCIResult {
  return calculateNCI({
    attention: scanResult.attention_score ?? 0,
    memory: scanResult.memory_score ?? 0,
    language: scanResult.language_score ?? 0,
    executiveFunction: scanResult.executive_function_score ?? 0,
  });
}

/**
 * Calculate class-average NCI from multiple student results
 */
export function calculateClassNCI(results: Array<{
  attention_score?: number | null;
  memory_score?: number | null;
  language_score?: number | null;
  executive_function_score?: number | null;
}>): NCIResult | null {
  if (!results.length) return null;

  const avg = (key: string) => Math.round(
    results.reduce((s, r) => s + (Number((r as any)[key]) || 0), 0) / results.length
  );

  return calculateNCI({
    attention: avg('attention_score'),
    memory: avg('memory_score'),
    language: avg('language_score'),
    executiveFunction: avg('executive_function_score'),
  });
}

export function getBand(score: number): NCIBand {
  if (score >= 85) return 'advanced';
  if (score >= 70) return 'adequate';
  if (score >= 50) return 'monitoring';
  if (score >= 30) return 'intervention';
  return 'urgent';
}

export function getBandInfo(band: NCIBand): NCIBandInfo {
  return NCI_BANDS.find(b => b.key === band) || NCI_BANDS[2];
}

export function getNCIColor(score: number): string {
  return getBandInfo(getBand(score)).color;
}

export function getNCILabel(score: number): string {
  return getBandInfo(getBand(score)).labelPt;
}
