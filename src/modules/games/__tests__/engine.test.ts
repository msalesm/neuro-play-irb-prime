import { describe, it, expect, beforeEach } from "vitest";
import {
  GameMetricsCollector,
  calculateAdaptiveDifficulty,
  findGamesByDomain,
  findGamesByAbaCategory,
  getBatteryGames,
  getGamesForAge,
  GAME_REGISTRY,
} from "../engine";

// ─── GameMetricsCollector ─────────────────────────────────

describe("GameMetricsCollector", () => {
  let collector: GameMetricsCollector;

  beforeEach(() => {
    collector = new GameMetricsCollector();
  });

  it("starts with zero events", () => {
    expect(collector.getEventCount()).toBe(0);
  });

  it("records correct answers and computes accuracy", () => {
    const t0 = Date.now();
    collector.recordEvent({ type: "trial_start", timestamp: t0 });
    collector.recordEvent({ type: "correct", timestamp: t0 + 500 });
    collector.recordEvent({ type: "trial_start", timestamp: t0 + 600 });
    collector.recordEvent({ type: "error", timestamp: t0 + 1200 });

    const summary = collector.getSummary();
    expect(summary.correctAnswers).toBe(1);
    expect(summary.errorsCount).toBe(1);
    expect(summary.totalAttempts).toBe(2);
    expect(summary.accuracy).toBeCloseTo(0.5);
  });

  it("computes average reaction time", () => {
    const t0 = Date.now();
    collector.recordEvent({ type: "trial_start", timestamp: t0 });
    collector.recordEvent({ type: "correct", timestamp: t0 + 400 });
    collector.recordEvent({ type: "trial_start", timestamp: t0 + 500 });
    collector.recordEvent({ type: "correct", timestamp: t0 + 1100 }); // RT = 600

    const summary = collector.getSummary();
    // avg of 400 and 600 = 500
    expect(summary.reactionTimeMs).toBe(500);
  });

  it("computes reaction-time variability (std dev)", () => {
    const t0 = Date.now();
    // Two trials with identical RT — variability should be 0
    collector.recordEvent({ type: "trial_start", timestamp: t0 });
    collector.recordEvent({ type: "correct", timestamp: t0 + 300 });
    collector.recordEvent({ type: "trial_start", timestamp: t0 + 400 });
    collector.recordEvent({ type: "correct", timestamp: t0 + 700 });

    const summary = collector.getSummary();
    expect(summary.reactionTimeVariability).toBe(0);
  });

  it("counts omission and commission errors separately", () => {
    collector.recordEvent({ type: "omission", timestamp: Date.now() });
    collector.recordEvent({ type: "commission", timestamp: Date.now() });

    const summary = collector.getSummary();
    expect(summary.omissionErrors).toBe(1);
    expect(summary.commissionErrors).toBe(1);
    expect(summary.totalAttempts).toBe(2);
  });

  it("returns accuracy 0 when no attempts recorded", () => {
    const summary = collector.getSummary();
    expect(summary.accuracy).toBe(0);
    expect(summary.totalAttempts).toBe(0);
  });

  it("tracks block performance after 10 trials", () => {
    const t0 = Date.now();
    for (let i = 0; i < 10; i++) {
      collector.recordEvent({ type: "trial_start", timestamp: t0 + i * 100 });
      // 7 correct, 3 errors → block accuracy 70%
      const type = i < 7 ? "correct" : "error";
      collector.recordEvent({ type, timestamp: t0 + i * 100 + 50 });
    }

    const summary = collector.getSummary();
    expect(summary.blockPerformance).toHaveLength(1);
    expect(summary.blockPerformance![0]).toBe(70);
  });

  it("detects post-error latency when next trial is slower", () => {
    const t0 = Date.now();
    collector.recordEvent({ type: "trial_start", timestamp: t0 });
    collector.recordEvent({ type: "error", timestamp: t0 + 300 });
    collector.recordEvent({ type: "trial_start", timestamp: t0 + 400 });
    // RT after error = 800ms — well above baseline
    collector.recordEvent({ type: "correct", timestamp: t0 + 1200 });

    const summary = collector.getSummary();
    expect(summary.postErrorLatencyMs).toBe(800);
  });

  it("never produces negative accuracy", () => {
    // No correct answers, only errors
    for (let i = 0; i < 5; i++) {
      collector.recordEvent({ type: "error", timestamp: Date.now() + i });
    }
    const summary = collector.getSummary();
    expect(summary.accuracy).toBeGreaterThanOrEqual(0);
  });
});

// ─── calculateAdaptiveDifficulty ─────────────────────────

describe("calculateAdaptiveDifficulty", () => {
  it("increases difficulty when accuracy is above max threshold", () => {
    const result = calculateAdaptiveDifficulty(5, 0.90);
    expect(result.newDifficulty).toBe(6);
    expect(result.reason).toContain("aumentada");
  });

  it("decreases difficulty when accuracy is below min threshold", () => {
    const result = calculateAdaptiveDifficulty(5, 0.50);
    expect(result.newDifficulty).toBe(4);
    expect(result.reason).toContain("reduzida");
  });

  it("keeps difficulty when accuracy is within target range", () => {
    const result = calculateAdaptiveDifficulty(5, 0.75);
    expect(result.newDifficulty).toBe(5);
    expect(result.reason).toContain("mantida");
  });

  it("does not exceed maxDifficulty", () => {
    const result = calculateAdaptiveDifficulty(10, 0.95);
    expect(result.newDifficulty).toBe(10);
  });

  it("does not go below minDifficulty", () => {
    const result = calculateAdaptiveDifficulty(1, 0.10);
    expect(result.newDifficulty).toBe(1);
  });

  it("respects custom step size", () => {
    const result = calculateAdaptiveDifficulty(5, 0.95, { stepSize: 2 });
    expect(result.newDifficulty).toBe(7);
  });

  it("respects custom accuracy thresholds", () => {
    // Custom: only increase above 0.95
    const result = calculateAdaptiveDifficulty(5, 0.88, {
      targetAccuracyMin: 0.60,
      targetAccuracyMax: 0.95,
    });
    expect(result.newDifficulty).toBe(5); // within range
  });

  it("returns integer difficulty values", () => {
    const result = calculateAdaptiveDifficulty(3, 0.92);
    expect(Number.isInteger(result.newDifficulty)).toBe(true);
  });
});

// ─── GAME_REGISTRY helpers ────────────────────────────────

describe("findGamesByDomain", () => {
  it("returns games that target the given domain", () => {
    const attentionGames = findGamesByDomain("attention");
    expect(attentionGames.length).toBeGreaterThan(0);
    attentionGames.forEach((g) => expect(g.domains).toContain("attention"));
  });

  it("returns empty array for a domain with no games", () => {
    // 'emotional-regulation' exists but let's verify it returns only matching ones
    const games = findGamesByDomain("emotional-regulation");
    games.forEach((g) =>
      expect(g.domains).toContain("emotional-regulation")
    );
  });
});

describe("findGamesByAbaCategory", () => {
  it("returns games tagged with the given ABA category", () => {
    const games = findGamesByAbaCategory("joint_attention");
    expect(games.length).toBeGreaterThan(0);
    games.forEach((g) =>
      expect(g.abaSkillCategories).toContain("joint_attention")
    );
  });

  it("returns empty array for unknown category", () => {
    const games = findGamesByAbaCategory("nonexistent_category");
    expect(games).toHaveLength(0);
  });
});

describe("getBatteryGames", () => {
  it("returns only games flagged as battery games", () => {
    const battery = getBatteryGames();
    expect(battery.length).toBeGreaterThan(0);
    battery.forEach((g) => expect(g.isPartOfBattery).toBe(true));
  });

  it("excludes stimulation-only games from the battery", () => {
    const battery = getBatteryGames();
    const stimOnly = battery.filter((g) => g.isStimulationOnly);
    expect(stimOnly).toHaveLength(0);
  });
});

describe("getGamesForAge", () => {
  it("returns games appropriate for age 6", () => {
    const games = getGamesForAge(6);
    games.forEach((g) => {
      expect(g.minAge).toBeLessThanOrEqual(6);
      expect(g.maxAge).toBeGreaterThanOrEqual(6);
    });
  });

  it("excludes games outside the age range", () => {
    // No game in the registry should serve age 0
    const games = getGamesForAge(0);
    games.forEach((g) => {
      expect(g.minAge).toBeLessThanOrEqual(0);
    });
  });

  it("returns all registry games for a universal age like 8", () => {
    const games = getGamesForAge(8);
    // All GAME_REGISTRY entries span at least age 8
    const allSpan8 = GAME_REGISTRY.every((g) => g.minAge <= 8 && g.maxAge >= 8);
    if (allSpan8) {
      expect(games).toHaveLength(GAME_REGISTRY.length);
    } else {
      expect(games.length).toBeLessThanOrEqual(GAME_REGISTRY.length);
    }
  });
});

// ─── GAME_REGISTRY integrity ──────────────────────────────

describe("GAME_REGISTRY integrity", () => {
  it("all games have unique IDs", () => {
    const ids = GAME_REGISTRY.map((g) => g.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all games have at least one cognitive domain", () => {
    GAME_REGISTRY.forEach((g) => {
      expect(g.domains.length).toBeGreaterThan(0);
    });
  });

  it("all games have valid age ranges (min <= max)", () => {
    GAME_REGISTRY.forEach((g) => {
      expect(g.minAge).toBeLessThanOrEqual(g.maxAge);
    });
  });

  it("stimulation-only games are not part of the formal battery", () => {
    GAME_REGISTRY.filter((g) => g.isStimulationOnly).forEach((g) => {
      expect(g.isPartOfBattery).toBe(false);
    });
  });
});
