/**
 * Data Classification Layer
 * 
 * Separates real, derived, and simulated metrics to prevent
 * pseudo-clinical data from appearing in clinical dashboards.
 * 
 * RULE: Clinical dashboards MUST only use 'real' or 'derived' data.
 * Simulated data is allowed ONLY in development/demo mode.
 */

export type DataSource = 'real' | 'derived' | 'simulated';

export interface ClassifiedMetric<T = number> {
  value: T;
  source: DataSource;
  collectedAt: string;
  confidence: number; // 0-1, where 1 = fully validated real data
  origin: string; // e.g. 'game_session', 'aba_trial', 'routine_completion'
}

/**
 * Create a classified metric from a real data source.
 */
export function realMetric<T = number>(
  value: T,
  origin: string,
  collectedAt?: string
): ClassifiedMetric<T> {
  return {
    value,
    source: 'real',
    collectedAt: collectedAt || new Date().toISOString(),
    confidence: 1.0,
    origin,
  };
}

/**
 * Create a derived metric (calculated from real data).
 */
export function derivedMetric<T = number>(
  value: T,
  origin: string,
  confidence: number = 0.9
): ClassifiedMetric<T> {
  return {
    value,
    source: 'derived',
    collectedAt: new Date().toISOString(),
    confidence: Math.min(1, Math.max(0, confidence)),
    origin,
  };
}

/**
 * Create a simulated metric (for demo/development only).
 * NEVER use in clinical dashboards.
 */
export function simulatedMetric<T = number>(
  value: T,
  origin: string = 'simulation'
): ClassifiedMetric<T> {
  return {
    value,
    source: 'simulated',
    collectedAt: new Date().toISOString(),
    confidence: 0,
    origin,
  };
}

/**
 * Filter metrics to only include clinical-safe data (real + derived).
 */
export function clinicalOnly<T>(
  metrics: ClassifiedMetric<T>[]
): ClassifiedMetric<T>[] {
  return metrics.filter(m => m.source === 'real' || m.source === 'derived');
}

/**
 * Check if a dataset is safe for clinical display.
 * Returns false if any simulated data is present.
 */
export function isClinicalSafe<T>(metrics: ClassifiedMetric<T>[]): boolean {
  return metrics.every(m => m.source !== 'simulated');
}

/**
 * Get a summary of data sources in a dataset.
 */
export function dataSourceSummary<T>(
  metrics: ClassifiedMetric<T>[]
): Record<DataSource, number> {
  const summary: Record<DataSource, number> = { real: 0, derived: 0, simulated: 0 };
  for (const m of metrics) {
    summary[m.source]++;
  }
  return summary;
}

/**
 * Validate that no Math.random() values leak into clinical contexts.
 * Use as a development-time guard.
 */
export function assertNoClinicalSimulation<T>(
  metrics: ClassifiedMetric<T>[],
  context: string
): void {
  const simulated = metrics.filter(m => m.source === 'simulated');
  if (simulated.length > 0) {
    console.error(
      `[DATA INTEGRITY] ${simulated.length} simulated metrics found in clinical context: ${context}. ` +
      `This data MUST NOT be used for clinical decisions.`
    );
  }
}
