import { pgTable, text, timestamp, numeric, varchar, integer } from "drizzle-orm/pg-core";
import { practices } from "./practices";
import { uploads } from "./uploads";

// Analysis findings — output of rules engine + LLM enrichment
export const findings = pgTable("findings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  practiceId: text("practice_id")
    .notNull()
    .references(() => practices.id, { onDelete: "cascade" }),
  uploadId: text("upload_id")
    .notNull()
    .references(() => uploads.id, { onDelete: "cascade" }),
  // Finding classification
  type: varchar("type", { length: 20 }).notNull(),
  // "clawback_risk" | "underclaiming" | "compliance" | "data_quality"
  category: varchar("category", { length: 30 }).notNull(),
  severity: varchar("severity", { length: 10 }).notNull(),
  // "critical" | "high" | "medium" | "low"
  // Content
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  // LLM-generated narrative explanation (may be null if LLM failed)
  narrativeExplanation: text("narrative_explanation"),
  recommendedAction: text("recommended_action"),
  // Financial impact estimate
  estimatedImpact: numeric("estimated_impact", { precision: 10, scale: 2 }),
  impactDirection: varchar("impact_direction", { length: 10 }),
  // "positive" (money to recover) | "negative" (risk of clawback)
  // Which rule triggered this finding
  ruleId: varchar("rule_id", { length: 50 }),
  ruleVersion: varchar("rule_version", { length: 20 }),
  // LLM enrichment status
  enrichmentStatus: varchar("enrichment_status", { length: 20 })
    .notNull()
    .default("pending"),
  // "pending" | "completed" | "failed" | "skipped"
  // Action tracking (post-MVP Tier 1, but schema is cheap)
  actionStatus: varchar("action_status", { length: 20 })
    .notNull()
    .default("open"),
  // "open" | "in_progress" | "resolved" | "dismissed"
  // How many claims this finding affects
  affectedClaimsCount: integer("affected_claims_count"),
  // Clinician-specific (if data supports it)
  clinicianId: varchar("clinician_id", { length: 100 }),
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
});
