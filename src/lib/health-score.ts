import { HEALTH_SCORE_WEIGHTS } from "@/types";

type FindingCounts = {
  clawbackRisk: { critical: number; high: number; medium: number; low: number };
  underclaiming: { critical: number; high: number; medium: number; low: number };
  compliance: { critical: number; high: number; medium: number; low: number };
  dataQuality: { critical: number; high: number; medium: number; low: number };
};

// Severity weights for scoring: how much each severity level deducts from 100
const SEVERITY_DEDUCTIONS = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
} as const;

// Calculate component score (0-100) from finding counts
// 100 = no issues, deducted based on count and severity
function calculateComponentScore(counts: {
  critical: number;
  high: number;
  medium: number;
  low: number;
}): number {
  const totalDeduction =
    counts.critical * SEVERITY_DEDUCTIONS.critical +
    counts.high * SEVERITY_DEDUCTIONS.high +
    counts.medium * SEVERITY_DEDUCTIONS.medium +
    counts.low * SEVERITY_DEDUCTIONS.low;

  return Math.max(0, 100 - totalDeduction);
}

// Calculate overall health score from component scores
export function calculateHealthScore(findingCounts: FindingCounts) {
  const clawbackRiskScore = calculateComponentScore(findingCounts.clawbackRisk);
  const underclaimingScore = calculateComponentScore(findingCounts.underclaiming);
  const complianceScore = calculateComponentScore(findingCounts.compliance);
  const dataQualityScore = calculateComponentScore(findingCounts.dataQuality);

  // Weighted average
  const overallScore = Math.round(
    clawbackRiskScore * HEALTH_SCORE_WEIGHTS.clawbackRisk +
    underclaimingScore * HEALTH_SCORE_WEIGHTS.underclaiming +
    complianceScore * HEALTH_SCORE_WEIGHTS.compliance +
    dataQualityScore * HEALTH_SCORE_WEIGHTS.dataQuality
  );

  return {
    overallScore,
    clawbackRiskScore,
    underclaimingScore,
    complianceScore,
    dataQualityScore,
  };
}
