import { useState } from 'react';

export function useBehavioralAnalysis() {
  const [loading, setLoading] = useState(false);

  return {
    loading,
    trackEvent: async () => {},
    getMetrics: () => [],
    getPatterns: () => [],
  };
}
