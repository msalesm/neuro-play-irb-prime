import { describe, it, expect } from 'vitest';
import {
  realMetric,
  derivedMetric,
  simulatedMetric,
  clinicalOnly,
  isClinicalSafe,
  dataSourceSummary,
} from '@/modules/data-classification';

describe('Data Classification Layer', () => {
  it('creates real metrics with confidence 1.0', () => {
    const m = realMetric(85, 'game_session');
    expect(m.source).toBe('real');
    expect(m.confidence).toBe(1.0);
    expect(m.value).toBe(85);
  });

  it('creates derived metrics with configurable confidence', () => {
    const m = derivedMetric(72, 'z_score_calculation', 0.85);
    expect(m.source).toBe('derived');
    expect(m.confidence).toBe(0.85);
  });

  it('creates simulated metrics with confidence 0', () => {
    const m = simulatedMetric(50);
    expect(m.source).toBe('simulated');
    expect(m.confidence).toBe(0);
  });

  it('filters out simulated data for clinical use', () => {
    const metrics = [
      realMetric(90, 'game'),
      derivedMetric(80, 'calc'),
      simulatedMetric(50),
    ];
    const safe = clinicalOnly(metrics);
    expect(safe).toHaveLength(2);
    expect(safe.every(m => m.source !== 'simulated')).toBe(true);
  });

  it('detects unsafe clinical datasets', () => {
    const withSimulated = [realMetric(90, 'game'), simulatedMetric(50)];
    const withoutSimulated = [realMetric(90, 'game'), derivedMetric(80, 'calc')];
    
    expect(isClinicalSafe(withSimulated)).toBe(false);
    expect(isClinicalSafe(withoutSimulated)).toBe(true);
  });

  it('summarizes data sources correctly', () => {
    const metrics = [
      realMetric(90, 'game'),
      realMetric(85, 'game'),
      derivedMetric(80, 'calc'),
      simulatedMetric(50),
    ];
    const summary = dataSourceSummary(metrics);
    expect(summary.real).toBe(2);
    expect(summary.derived).toBe(1);
    expect(summary.simulated).toBe(1);
  });
});
