import { describe, it, expect } from "vitest";
import {
  analyzePerformance,
  detectFrustration,
  type PerformanceSnapshot,
} from "../adaptive-engine";

// ─── Fixtures ─────────────────────────────────────────────

function makeSnapshot(overrides: Partial<PerformanceSnapshot> = {}): PerformanceSnapshot {
  return {
    accuracy: 0.75,
    reactionTimeMs: 600,
    persistenceSeconds: 120,
    decisionLatencyMs: 800,
    errorsCount: 2,
    totalAttempts: 10,
    sessionDurationSeconds: 300,
    ...overrides,
  };
}

// ─── detectFrustration ────────────────────────────────────

describe("detectFrustration", () => {
  it("returns 'calm' for a high-accuracy fast session", () => {
    const snap = makeSnapshot({ accuracy: 0.90, errorsCount: 1, totalAttempts: 10, persistenceSeconds: 200 });
    expect(detectFrustration(snap)).toBe("calm");
  });

  it("returns 'high' when accuracy is very low and error rate is high", () => {
    const snap = makeSnapshot({
      accuracy: 0.30,
      errorsCount: 7,
      totalAttempts: 10,
      persistenceSeconds: 30,
    });
    expect(detectFrustration(snap)).toBe("high");
  });

  it("returns 'moderate' for borderline performance", () => {
    const snap = makeSnapshot({
      accuracy: 0.45,
      errorsCount: 5,
      totalAttempts: 10,
      persistenceSeconds: 90,
    });
    const result = detectFrustration(snap);
    expect(["moderate", "high"]).toContain(result);
  });

  it("detects frustration from declining block performance", () => {
    const snap = makeSnapshot({
      accuracy: 0.55,
      blockPerformance: [90, 85, 60, 40], // steep decline
    });
    const result = detectFrustration(snap);
    expect(["moderate", "high"]).toContain(result);
  });

  it("returns 'calm' or 'mild' when block performance is stable", () => {
    const snap = makeSnapshot({
      accuracy: 0.80,
      blockPerformance: [80, 82, 79, 81],
    });
    const result = detectFrustration(snap);
    expect(["calm", "mild"]).toContain(result);
  });

  it("low persistence alone increases frustration score", () => {
    const calm = makeSnapshot({ persistenceSeconds: 200 });
    const tired = makeSnapshot({ persistenceSeconds: 30 });
    const calmLevel = detectFrustration(calm);
    const tiredLevel = detectFrustration(tired);
    const order = ["calm", "mild", "moderate", "high"];
    expect(order.indexOf(tiredLevel)).toBeGreaterThanOrEqual(order.indexOf(calmLevel));
  });
});

// ─── analyzePerformance ───────────────────────────────────

describe("analyzePerformance", () => {
  it("returns an AdaptiveProfile with the correct childId", () => {
    const profile = analyzePerformance("child-42", makeSnapshot(), 5);
    expect(profile.childId).toBe("child-42");
  });

  it("currentDifficulty matches the input", () => {
    const profile = analyzePerformance("c", makeSnapshot(), 7);
    expect(profile.currentDifficulty).toBe(7);
  });

  it("recommendedDifficulty is between 1 and 10", () => {
    const highSnap = makeSnapshot({ accuracy: 0.95 });
    const lowSnap = makeSnapshot({ accuracy: 0.30 });
    const p1 = analyzePerformance("c", highSnap, 5);
    const p2 = analyzePerformance("c", lowSnap, 5);
    [p1, p2].forEach((p) => {
      expect(p.recommendedDifficulty).toBeGreaterThanOrEqual(1);
      expect(p.recommendedDifficulty).toBeLessThanOrEqual(10);
    });
  });

  it("reduces difficulty by more than 1 when frustration is high", () => {
    const snap = makeSnapshot({
      accuracy: 0.25,
      errorsCount: 8,
      totalAttempts: 10,
      persistenceSeconds: 20,
    });
    const profile = analyzePerformance("c", snap, 6);
    expect(profile.recommendedDifficulty).toBeLessThan(5); // high frustration drops by 2
  });

  it("interventionType is a recognised value", () => {
    const profile = analyzePerformance("c", makeSnapshot(), 5);
    const valid = ["maintain", "simplify", "challenge", "reinforce", "break"];
    expect(valid).toContain(profile.interventionType);
  });

  it("adjustments are sorted by priority descending", () => {
    const profile = analyzePerformance("c", makeSnapshot({ accuracy: 0.30, persistenceSeconds: 20 }), 5);
    const priorities = profile.adjustments.map((a) => a.priority);
    for (let i = 1; i < priorities.length; i++) {
      expect(priorities[i - 1]).toBeGreaterThanOrEqual(priorities[i]);
    }
  });

  it("all adjustment priorities are between 1 and 5", () => {
    const profile = analyzePerformance("c", makeSnapshot(), 5);
    profile.adjustments.forEach((a) => {
      expect(a.priority).toBeGreaterThanOrEqual(1);
      expect(a.priority).toBeLessThanOrEqual(5);
    });
  });

  it("engagement is classified as a recognised value", () => {
    const profile = analyzePerformance("c", makeSnapshot(), 5);
    expect(["high", "moderate", "low", "disengaged"]).toContain(profile.engagementLevel);
  });

  it("persistence is classified as a recognised value", () => {
    const profile = analyzePerformance("c", makeSnapshot(), 5);
    expect(["strong", "moderate", "weak"]).toContain(profile.persistenceClassification);
  });

  it("updatedAt is a valid ISO string", () => {
    const profile = analyzePerformance("c", makeSnapshot(), 5);
    expect(() => new Date(profile.updatedAt)).not.toThrow();
    expect(new Date(profile.updatedAt).getTime()).not.toBeNaN();
  });
});
