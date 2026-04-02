import { pgTable, text, timestamp, integer, varchar, boolean } from "drizzle-orm/pg-core";
import { practices } from "./practices";
import { uploads } from "./uploads";

// Claims Health Score — 0 to 100, weighted components
export const healthScores = pgTable("health_scores", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  practiceId: text("practice_id")
    .notNull()
    .references(() => practices.id, { onDelete: "cascade" }),
  uploadId: text("upload_id")
    .notNull()
    .references(() => uploads.id, { onDelete: "cascade" }),
  // Overall score (0-100, 100 = no issues)
  overallScore: integer("overall_score").notNull(),
  // Component scores (each 0-100)
  clawbackRiskScore: integer("clawback_risk_score").notNull(),
  underclaimingScore: integer("underclaiming_score").notNull(),
  complianceScore: integer("compliance_score").notNull(),
  dataQualityScore: integer("data_quality_score").notNull(),
  // Coverage metric — what % of claim types were checked by at least one rule
  ruleCoveragePercent: integer("rule_coverage_percent"),
  // Whether this score has been human-validated
  // "Preliminary" badge shown until this is true
  humanValidated: boolean("human_validated").notNull().default(false),
  // Suppress score if insufficient data
  suppressedReason: varchar("suppressed_reason", { length: 100 }),
  // "insufficient_data" | "too_few_claims" | null
  // Finding counts for summary
  totalFindings: integer("total_findings").notNull().default(0),
  criticalFindings: integer("critical_findings").notNull().default(0),
  highFindings: integer("high_findings").notNull().default(0),
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
