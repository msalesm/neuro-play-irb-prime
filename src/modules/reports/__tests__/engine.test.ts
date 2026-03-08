import { describe, it, expect } from "vitest";
import { generateReport, type ReportConfig } from "../engine";
import type { UnifiedProfile, DomainScore } from "@/modules/behavioral/engine";

// ─── Fixtures ─────────────────────────────────────────────

function makeDomainScore(score: number): DomainScore {
  const classification =
    score >= 75
      ? "adequate"
      : score >= 50
      ? "monitoring"
      : score >= 25
      ? "attention"
      : "intervention";
  return { score, classification, trend: "stable", dataPoints: 5 };
}

function makeProfile(overrides: Partial<UnifiedProfile> = {}): UnifiedProfile {
  return {
    childId: "child-001",
    generatedAt: new Date().toISOString(),
    overallScore: 70,
    cognitive: {
      attention:    makeDomainScore(80),
      inhibition:   makeDomainScore(65),
      memory:       makeDomainScore(72),
      flexibility:  makeDomainScore(58),
      coordination: makeDomainScore(85),
      persistence:  makeDomainScore(60),
    },
    socioemotional: {
      empathy:              makeDomainScore(75),
      impulseControl:       makeDomainScore(55),
      socialFlexibility:    makeDomainScore(65),
      frustrationTolerance: makeDomainScore(50),
      emotionalRegulation:  makeDomainScore(70),
    },
    executive: {
      organization:    makeDomainScore(60),
      autonomy:        makeDomainScore(68),
      taskInitiation:  makeDomainScore(72),
      completion:      makeDomainScore(65),
    },
    strengths: ["Atenção", "Coordenação"],
    areasForDevelopment: ["Flexibilidade Cognitiva"],
    recommendations: ["Continuar jogos de flexibilidade"],
    evolutionTrend: "improving",
    dataCompleteness: 0.8,
    ...overrides,
  };
}

const BASE_CONFIG: ReportConfig = {
  type: "cognitive",
  childId: "child-001",
  childName: "João Silva",
  periodStart: "2025-01-01",
  periodEnd: "2025-03-31",
  generatedBy: "therapist-001",
  role: "therapist",
};

// ─── generateReport ───────────────────────────────────────

describe("generateReport", () => {
  it("returns a report with a non-empty unique ID", () => {
    const profile = makeProfile();
    const r1 = generateReport(BASE_CONFIG, profile);
    const r2 = generateReport(BASE_CONFIG, profile);
    expect(r1.id).toBeTruthy();
    expect(r1.id).not.toBe(r2.id);
  });

  it("cognitive report has at least one section", () => {
    const report = generateReport({ ...BASE_CONFIG, type: "cognitive" }, makeProfile());
    expect(report.sections.length).toBeGreaterThan(0);
  });

  it("aba report has at least one section", () => {
    const profile = makeProfile({
      aba: {
        overallIndependence: 72,
        activePrograms: 4,
        masteredSkills: 12,
        trendDirection: "up",
      },
    });
    const report = generateReport({ ...BASE_CONFIG, type: "aba" }, profile);
    expect(report.sections.length).toBeGreaterThan(0);
  });

  it("school report has at least one section", () => {
    const report = generateReport({ ...BASE_CONFIG, type: "school" }, makeProfile());
    expect(report.sections.length).toBeGreaterThan(0);
  });

  it("evolution report has at least one section", () => {
    const report = generateReport({ ...BASE_CONFIG, type: "evolution" }, makeProfile());
    expect(report.sections.length).toBeGreaterThan(0);
  });

  it("family report has at least one section", () => {
    const report = generateReport({ ...BASE_CONFIG, type: "family" }, makeProfile());
    expect(report.sections.length).toBeGreaterThan(0);
  });

  it("report includes the child name in title or subtitle", () => {
    const report = generateReport(BASE_CONFIG, makeProfile());
    const allText = report.title + report.subtitle;
    expect(allText).toContain("João Silva");
  });

  it("report summary is a non-empty string", () => {
    const report = generateReport(BASE_CONFIG, makeProfile());
    expect(typeof report.summary).toBe("string");
    expect(report.summary.length).toBeGreaterThan(0);
  });

  it("recommendations array is defined", () => {
    const report = generateReport(BASE_CONFIG, makeProfile());
    expect(Array.isArray(report.recommendations)).toBe(true);
  });

  it("alertFlags is an array (empty or not)", () => {
    const report = generateReport(BASE_CONFIG, makeProfile());
    expect(Array.isArray(report.alertFlags)).toBe(true);
  });

  it("each section has a non-empty title", () => {
    const report = generateReport(BASE_CONFIG, makeProfile());
    report.sections.forEach((s) => {
      expect(s.title.length).toBeGreaterThan(0);
    });
  });

  it("each section has a non-empty content string", () => {
    const report = generateReport(BASE_CONFIG, makeProfile());
    report.sections.forEach((s) => {
      expect(typeof s.content).toBe("string");
      expect(s.content.length).toBeGreaterThan(0);
    });
  });

  it("does not produce NaN or undefined in section data", () => {
    const report = generateReport(BASE_CONFIG, makeProfile());
    report.sections.forEach((s) => {
      if (s.data) {
        Object.values(s.data).forEach((v) => {
          if (typeof v === "number") expect(isNaN(v)).toBe(false);
          expect(v).not.toBeUndefined();
        });
      }
    });
  });

  it("generates a stable report for the same inputs (deterministic structure)", () => {
    const profile = makeProfile();
    const r1 = generateReport(BASE_CONFIG, profile);
    const r2 = generateReport(BASE_CONFIG, profile);
    // IDs differ (timestamp-based) but structure should be identical
    expect(r1.sections.map((s) => s.title)).toEqual(r2.sections.map((s) => s.title));
    expect(r1.recommendations.length).toBe(r2.recommendations.length);
  });
});
