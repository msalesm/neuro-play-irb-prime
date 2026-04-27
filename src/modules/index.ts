/**
 * NeuroPlay EDU Modules
 * Educational platform: games, screening, school, assessment.
 */

export * as Games from './games';
export * as Assessment from './assessment';
export * as School from './school';

// Cross-cutting
export { type AIProvider, type AICompletionResponse } from './ai-provider';
export { type ClassifiedMetric, type DataSource, clinicalOnly, isClinicalSafe } from './data-classification';
