import type { Rule } from "./engine";
import type { PcrsClaim } from "@/lib/parser/pcrs-parser";

// Rule registry — all rules are defined here
// Each rule is config-driven and versioned for auditability
// Add new rules here as the PCRS domain knowledge grows

export const rules: Rule[] = [
  // --- Clawback Risk Rules ---
  {
    id: "CLB-001",
    version: "1.0.0",
    name: "Duplicate Claims Detection",
    description:
      "Identifies claims with the same code, date, and patient within a single upload",
    type: "clawback_risk",
    severity: "critical",
    enabled: true,
    check: (claims: PcrsClaim[]) => {
      // Group by code + date + patient to find duplicates
      const seen = new Map<string, PcrsClaim[]>();
      for (const claim of claims) {
        const key = `${claim.claimCode}|${claim.claimDate.toISOString().split("T")[0]}|${claim.patientRef ?? ""}`;
        if (!seen.has(key)) seen.set(key, []);
        seen.get(key)!.push(claim);
      }

      const duplicates = [...seen.entries()].filter(
        ([, group]) => group.length > 1
      );

      if (duplicates.length === 0) return [];

      const totalDuplicates = duplicates.reduce(
        (sum, [, group]) => sum + group.length - 1,
        0
      );
      const estimatedImpact = duplicates.reduce(
        (sum, [, group]) =>
          sum + group.slice(1).reduce((s, c) => s + c.claimAmount, 0),
        0
      );

      return [
        {
          ruleId: "CLB-001",
          ruleVersion: "1.0.0",
          type: "clawback_risk",
          severity: "critical",
          title: `${totalDuplicates} potential duplicate claims detected`,
          description: `Found ${duplicates.length} groups of claims with matching code, date, and patient reference. These may be flagged for clawback by PCRS.`,
          estimatedImpact,
          impactDirection: "negative",
          affectedClaimsCount: totalDuplicates,
        },
      ];
    },
  },

  // --- Data Quality Rules ---
  {
    id: "DQ-001",
    version: "1.0.0",
    name: "Missing Clinician ID",
    description: "Identifies claims without a clinician identifier",
    type: "data_quality",
    severity: "medium",
    enabled: true,
    check: (claims: PcrsClaim[]) => {
      const missing = claims.filter((c) => !c.clinicianId);
      if (missing.length === 0) return [];

      const percentage = Math.round((missing.length / claims.length) * 100);

      return [
        {
          ruleId: "DQ-001",
          ruleVersion: "1.0.0",
          type: "data_quality",
          severity: percentage > 50 ? "high" : "medium",
          title: `${percentage}% of claims missing clinician ID`,
          description: `${missing.length} out of ${claims.length} claims have no clinician identifier. This limits per-clinician analysis and may indicate data export configuration issues.`,
          affectedClaimsCount: missing.length,
        },
      ];
    },
  },

  {
    id: "DQ-002",
    version: "1.0.0",
    name: "Future-Dated Claims",
    description: "Identifies claims with dates in the future",
    type: "data_quality",
    severity: "high",
    enabled: true,
    check: (claims: PcrsClaim[]) => {
      const now = new Date();
      const futureDated = claims.filter((c) => c.claimDate > now);
      if (futureDated.length === 0) return [];

      return [
        {
          ruleId: "DQ-002",
          ruleVersion: "1.0.0",
          type: "data_quality",
          severity: "high",
          title: `${futureDated.length} claims have future dates`,
          description: `Claims dated after today were found. This typically indicates data entry errors or incorrect date formatting in the PCRS export.`,
          affectedClaimsCount: futureDated.length,
        },
      ];
    },
  },

  // --- Compliance Rules ---
  {
    id: "CMP-001",
    version: "1.0.0",
    name: "Zero-Amount Claims",
    description: "Identifies claims submitted with zero euro amount",
    type: "compliance",
    severity: "low",
    enabled: true,
    check: (claims: PcrsClaim[]) => {
      const zeroAmount = claims.filter((c) => c.claimAmount === 0);
      if (zeroAmount.length === 0) return [];

      return [
        {
          ruleId: "CMP-001",
          ruleVersion: "1.0.0",
          type: "compliance",
          severity: "low",
          title: `${zeroAmount.length} claims with €0 amount`,
          description: `Claims submitted with zero value may indicate administrative claims, but should be reviewed for completeness.`,
          affectedClaimsCount: zeroAmount.length,
        },
      ];
    },
  },

  // --- Underclaiming Rules ---
  {
    id: "UC-001",
    version: "1.0.0",
    name: "Low Claim Frequency Detection",
    description:
      "Identifies claim categories with unusually low frequency compared to practice size",
    type: "underclaiming",
    severity: "medium",
    enabled: true,
    check: (claims: PcrsClaim[]) => {
      // Group by category and count
      const categoryCounts = new Map<string, number>();
      for (const claim of claims) {
        categoryCounts.set(
          claim.claimCategory,
          (categoryCounts.get(claim.claimCategory) ?? 0) + 1
        );
      }

      // Flag categories with very few claims (< 1% of total)
      // This is a rough heuristic — LLM enrichment will provide better analysis
      const threshold = Math.max(1, claims.length * 0.01);
      const lowFrequency = [...categoryCounts.entries()].filter(
        ([, count]) => count < threshold
      );

      if (lowFrequency.length === 0) return [];

      return lowFrequency.map(([category, count]) => ({
        ruleId: "UC-001",
        ruleVersion: "1.0.0",
        type: "underclaiming" as const,
        severity: "medium" as const,
        title: `Low claim volume for "${category}"`,
        description: `Only ${count} claims in category "${category}" — this may indicate underclaiming. Compare with typical GP practice benchmarks.`,
        affectedClaimsCount: count,
      }));
    },
  },
];
