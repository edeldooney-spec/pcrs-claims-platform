// Health score component weights (from design doc)
export const HEALTH_SCORE_WEIGHTS = {
  clawbackRisk: 0.4,
  underclaiming: 0.3,
  compliance: 0.2,
  dataQuality: 0.1,
} as const;

// Upload processing status FSM
export type UploadStatus =
  | "uploaded"
  | "parsing"
  | "analysing"
  | "enriching"
  | "complete"
  | "failed";

// Finding types
export type FindingType = "clawback_risk" | "underclaiming" | "compliance" | "data_quality";
export type FindingSeverity = "critical" | "high" | "medium" | "low";
export type FindingActionStatus = "open" | "in_progress" | "resolved" | "dismissed";
export type EnrichmentStatus = "pending" | "completed" | "failed" | "skipped";

// API response pattern from CLAUDE.md
export type ActionResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Dashboard summary for the main view
export type DashboardSummary = {
  healthScore: {
    overall: number;
    clawbackRisk: number;
    underclaiming: number;
    compliance: number;
    dataQuality: number;
    humanValidated: boolean;
    suppressed: boolean;
    suppressedReason?: string;
  } | null;
  findingsCounts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    open: number;
    resolved: number;
  };
  lastUpload: {
    date: string;
    filename: string;
    status: UploadStatus;
    totalRecords: number;
  } | null;
};
