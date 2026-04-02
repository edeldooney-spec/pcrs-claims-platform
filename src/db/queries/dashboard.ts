import { db } from "@/db";
import { healthScores, findings, uploads } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import type { DashboardSummary } from "@/types";

// Fetch the latest health score for a practice
export async function getLatestHealthScore(practiceId: string) {
  const result = await db
    .select()
    .from(healthScores)
    .where(eq(healthScores.practiceId, practiceId))
    .orderBy(desc(healthScores.createdAt))
    .limit(1);

  return result[0] ?? null;
}

// Fetch finding counts by severity and status for a practice
export async function getFindingsCounts(practiceId: string) {
  const result = await db
    .select({
      total: sql<number>`count(*)::int`,
      critical: sql<number>`count(*) filter (where ${findings.severity} = 'critical')::int`,
      high: sql<number>`count(*) filter (where ${findings.severity} = 'high')::int`,
      medium: sql<number>`count(*) filter (where ${findings.severity} = 'medium')::int`,
      low: sql<number>`count(*) filter (where ${findings.severity} = 'low')::int`,
      open: sql<number>`count(*) filter (where ${findings.actionStatus} = 'open')::int`,
      resolved: sql<number>`count(*) filter (where ${findings.actionStatus} = 'resolved')::int`,
    })
    .from(findings)
    .where(eq(findings.practiceId, practiceId));

  return (
    result[0] ?? {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      open: 0,
      resolved: 0,
    }
  );
}

// Fetch the latest upload for a practice
export async function getLatestUpload(practiceId: string) {
  const result = await db
    .select()
    .from(uploads)
    .where(eq(uploads.practiceId, practiceId))
    .orderBy(desc(uploads.createdAt))
    .limit(1);

  return result[0] ?? null;
}

// Compose a full dashboard summary
export async function getDashboardSummary(
  practiceId: string
): Promise<DashboardSummary> {
  const [healthScore, findingsCounts, lastUpload] = await Promise.all([
    getLatestHealthScore(practiceId),
    getFindingsCounts(practiceId),
    getLatestUpload(practiceId),
  ]);

  return {
    healthScore: healthScore
      ? {
          overall: healthScore.overallScore,
          clawbackRisk: healthScore.clawbackRiskScore,
          underclaiming: healthScore.underclaimingScore,
          compliance: healthScore.complianceScore,
          dataQuality: healthScore.dataQualityScore,
          humanValidated: healthScore.humanValidated,
          suppressed: healthScore.suppressedReason !== null,
          suppressedReason: healthScore.suppressedReason ?? undefined,
        }
      : null,
    findingsCounts,
    lastUpload: lastUpload
      ? {
          date: lastUpload.createdAt.toISOString(),
          filename: lastUpload.originalFilename,
          status: lastUpload.status as DashboardSummary["lastUpload"] extends null ? never : NonNullable<DashboardSummary["lastUpload"]>["status"],
          totalRecords: lastUpload.totalRecords ?? 0,
        }
      : null,
  };
}
