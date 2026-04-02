import type { PcrsClaim } from "@/lib/parser/pcrs-parser";
import type { FindingType, FindingSeverity } from "@/types";

// A rule definition — config-driven, versioned
export type Rule = {
  id: string;
  version: string;
  name: string;
  description: string;
  type: FindingType;
  severity: FindingSeverity;
  // The check function returns findings for claims that match
  check: (claims: PcrsClaim[]) => RuleFinding[];
  // Whether this rule is active
  enabled: boolean;
};

// Output of a single rule check
export type RuleFinding = {
  ruleId: string;
  ruleVersion: string;
  type: FindingType;
  severity: FindingSeverity;
  title: string;
  description: string;
  estimatedImpact?: number;
  impactDirection?: "positive" | "negative";
  affectedClaimsCount: number;
  clinicianId?: string;
};

// Run all enabled rules against a set of claims
export function runRulesEngine(
  claims: PcrsClaim[],
  rules: Rule[]
): RuleFinding[] {
  const findings: RuleFinding[] = [];

  for (const rule of rules) {
    if (!rule.enabled) continue;

    try {
      const ruleFindings = rule.check(claims);
      findings.push(...ruleFindings);
    } catch (error) {
      console.error(`Rule ${rule.id} (v${rule.version}) failed:`, error);
      // Rule failures shouldn't crash the pipeline — log and continue
    }
  }

  return findings;
}

// Aggregate findings into the counts needed for health score calculation
export function aggregateFindingCounts(findings: RuleFinding[]) {
  const counts = {
    clawbackRisk: { critical: 0, high: 0, medium: 0, low: 0 },
    underclaiming: { critical: 0, high: 0, medium: 0, low: 0 },
    compliance: { critical: 0, high: 0, medium: 0, low: 0 },
    dataQuality: { critical: 0, high: 0, medium: 0, low: 0 },
  };

  // Map finding types to health score component keys
  const typeMap: Record<FindingType, keyof typeof counts> = {
    clawback_risk: "clawbackRisk",
    underclaiming: "underclaiming",
    compliance: "compliance",
    data_quality: "dataQuality",
  };

  for (const finding of findings) {
    const component = typeMap[finding.type];
    if (component) {
      counts[component][finding.severity]++;
    }
  }

  return counts;
}
