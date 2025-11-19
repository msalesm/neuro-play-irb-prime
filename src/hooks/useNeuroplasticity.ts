import { useState } from 'react';

export function useNeuroplasticity() {
  const [loading, setLoading] = useState(false);

  return {
    loading,
    scores: {},
    updateScores: async () => {},
  };
}
