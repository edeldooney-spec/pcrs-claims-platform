import { db } from "@/db";
import { findings } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export type FindingRow = typeof findings.$inferSelect;

// Fetch all findings for a practice, newest first
export async function getFindingsForPractice(
  practiceId: string,
  options?: {
    severity?: string;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }
) {
  const conditions = [eq(findings.practiceId, practiceId)];

  if (options?.severity) {
    conditions.push(eq(findings.severity, options.severity));
  }
  if (options?.type) {
    conditions.push(eq(findings.type, options.type));
  }
  if (options?.status) {
    conditions.push(eq(findings.actionStatus, options.status));
  }

  const result = await db
    .select()
    .from(findings)
    .where(and(...conditions))
    .orderBy(desc(findings.createdAt))
    .limit(options?.limit ?? 50)
    .offset(options?.offset ?? 0);

  return result;
}

// Fetch top findings for dashboard (critical + high, most recent)
export async function getTopFindings(practiceId: string, limit = 5) {
  const result = await db
    .select()
    .from(findings)
    .where(
      and(
        eq(findings.practiceId, practiceId),
        eq(findings.actionStatus, "open"),
        sql`${findings.severity} in ('critical', 'high')`
      )
    )
    .orderBy(desc(findings.createdAt))
    .limit(limit);

  return result;
}

// Count findings by type for a practice
export async function getFindingsCountByType(practiceId: string) {
  const result = await db
    .select({
      type: findings.type,
      count: sql<number>`count(*)::int`,
    })
    .from(findings)
    .where(eq(findings.practiceId, practiceId))
    .groupBy(findings.type);

  return result;
}
