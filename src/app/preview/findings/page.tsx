"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

const typeLabels: Record<string, string> = {
  underclaiming: "Underclaiming",
  grant: "Grant / Subsidy",
  compliance: "Compliance",
  leave: "Leave Entitlement",
  programme: "Programme Uptake",
  process: "Process Improvement",
};

// ── Findings derived from Asumpta's real PCRS analysis report ────
const mockFindings = [
  // ── Critical: Medical Indemnity ──
  {
    id: "mi-1",
    severity: "critical",
    type: "underclaiming",
    gp: "Dr A",
    title: "Medical indemnity refund unclaimed — 75% band",
    description:
      "Panel 1,022–1,099 qualifies for 75% refund. No cover letter with renewed certificate submitted to CHO in 36 months.",
    impact: 9546,
    direction: "positive",
    status: "open",
  },
  {
    id: "mi-2",
    severity: "critical",
    type: "underclaiming",
    gp: "Dr B",
    title: "Medical indemnity refund unclaimed — 50% band",
    description:
      "Panel 913–972 qualifies for 50% refund. Annual submission to CHO required but not done.",
    impact: 6364,
    direction: "positive",
    status: "open",
  },
  {
    id: "mi-3",
    severity: "critical",
    type: "underclaiming",
    gp: "Dr C",
    title: "Medical indemnity refund unclaimed — 95% band (highest tier)",
    description:
      "Panel reached 1,257 = highest 95% refund tier. Estimated €4,031/year unclaimed. This is the single largest individual GP gap.",
    impact: 12092,
    direction: "positive",
    status: "open",
  },
  // ── Critical: Practice Grant ──
  {
    id: "pg-1",
    severity: "critical",
    type: "grant",
    gp: "Practice",
    title: "€45,000 Practice Support Grant not applied for",
    description:
      "3 qualifying GPs × €15,000 grant. Secretary hired Dec 2023 received €0 subsidy over 14 months — strongest case. Nurse hired Aug 2025 provides current active case.",
    impact: 45000,
    direction: "positive",
    status: "open",
  },
  // ── High: Leave ──
  {
    id: "lv-1",
    severity: "high",
    type: "leave",
    gp: "Dr A",
    title: "Leave year 2022/23: 28 days annual leave unclaimed",
    description:
      "Entitlement 28 days (panel 1,000+) at €197.24/day. Zero days claimed for this leave year. May be outside claimable window.",
    impact: 5523,
    direction: "positive",
    status: "open",
  },
  {
    id: "lv-2",
    severity: "high",
    type: "leave",
    gp: "Dr C",
    title: "Leave year 2022/23: 30 days annual leave unclaimed",
    description:
      "Entitlement 30 days (panel 1,200+) at €197.24/day. Zero days claimed — Sep 2022 claim processed at 0 days/€0.",
    impact: 5917,
    direction: "positive",
    status: "open",
  },
  {
    id: "lv-3",
    severity: "high",
    type: "leave",
    gp: "All GPs",
    title: "Study leave significantly under-claimed across practice",
    description:
      "Dr A: 11/30 days claimed. Dr B: 5/30 days claimed. Dr C: 6/30 days claimed. Combined ~64 unclaimed study leave days.",
    impact: 12624,
    direction: "positive",
    status: "open",
  },
  {
    id: "lv-4",
    severity: "medium",
    type: "leave",
    gp: "Dr B",
    title: "Leave year 2024/25: 8 days annual leave balance at risk",
    description:
      "17 of 25 days claimed with 8 remaining. Must be claimed before 31 March deadline.",
    impact: 1578,
    direction: "positive",
    status: "open",
  },
  // ── High: Programme uptake ──
  {
    id: "ac-1",
    severity: "high",
    type: "programme",
    gp: "All GPs",
    title: "Under-6 Asthma Cycle of Care — 1 registration in 36 months",
    description:
      "Combined Under-6 panel of 409 children but only 1 Asthma CoC registration (Dr B, Apr 2023). Registration fee €50 + ongoing capitation €3.75–€11.25/month per child.",
    impact: null,
    direction: "positive",
    status: "open",
  },
  {
    id: "pp-1",
    severity: "medium",
    type: "programme",
    gp: "All GPs",
    title: "CDM Prevention Programme under-utilised",
    description:
      "Only 85 PP consultations in 2025 across practice vs 350+ patients aged 65+ eligible. €82 + superannuation per consultation. CDM Treatment active and growing but PP lagging.",
    impact: null,
    direction: "positive",
    status: "open",
  },
  // ── Medium: Process ──
  {
    id: "pr-1",
    severity: "medium",
    type: "process",
    gp: "Practice",
    title: "M&I Scheme still on paper-based claiming",
    description:
      "All three GPs still using paper-based M&I claiming. Online submission would improve cash flow and reduce processing delays.",
    impact: null,
    direction: null,
    status: "open",
  },
  {
    id: "pr-2",
    severity: "low",
    type: "process",
    gp: "Practice",
    title: "No quarterly PCRS statement review process in place",
    description:
      "Implementing quarterly reviews against entitlements would catch emerging gaps early and prevent systemic under-claiming.",
    impact: null,
    direction: null,
    status: "open",
  },
];

type FilterType = "all" | "critical" | "high" | "medium" | "low";
type GPFilter = "all" | "Dr A" | "Dr B" | "Dr C" | "All GPs" | "Practice";

export default function PreviewFindingsPage() {
  const [severityFilter, setSeverityFilter] = useState<FilterType>("all");
  const [gpFilter, setGpFilter] = useState<GPFilter>("all");

  const filtered = mockFindings.filter((f) => {
    if (severityFilter !== "all" && f.severity !== severityFilter) return false;
    if (gpFilter !== "all" && f.gp !== gpFilter) return false;
    return true;
  });

  const totalImpact = mockFindings
    .filter((f) => f.impact && f.status === "open")
    .reduce((sum, f) => sum + (f.impact ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Findings</h1>
        <p className="text-muted-foreground text-sm">
          Gap analysis across 36 months of PCRS payment data for 3 panel holders
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Findings</p>
            <p className="text-2xl font-bold">{mockFindings.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-red-700">Critical</p>
            <p className="text-2xl font-bold text-red-700">
              {mockFindings.filter((f) => f.severity === "critical").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-orange-700">High</p>
            <p className="text-2xl font-bold text-orange-700">
              {mockFindings.filter((f) => f.severity === "high").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-green-700">Recoverable</p>
            <p className="text-2xl font-bold text-green-700">
              €{totalImpact.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Severity:
          </span>
          {(["all", "critical", "high", "medium", "low"] as FilterType[]).map(
            (level) => (
              <button
                key={level}
                onClick={() => setSeverityFilter(level)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  severityFilter === level
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">GP:</span>
          {(["all", "Dr A", "Dr B", "Dr C", "All GPs", "Practice"] as GPFilter[]).map(
            (gp) => (
              <button
                key={gp}
                onClick={() => setGpFilter(gp)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  gpFilter === gp
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {gp === "all" ? "All" : gp}
              </button>
            )
          )}
        </div>
      </div>

      {/* Findings table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {filtered.length} Finding{filtered.length !== 1 ? "s" : ""}
            {severityFilter !== "all" || gpFilter !== "all"
              ? " (filtered)"
              : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>GP</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Finding</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((finding) => (
                <TableRow key={finding.id}>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={severityStyles[finding.severity] ?? ""}
                    >
                      {finding.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{finding.gp}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {typeLabels[finding.type] ?? finding.type}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[350px]">
                      <p className="text-sm font-medium">{finding.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {finding.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {finding.impact ? (
                      <span className="text-green-600 font-medium">
                        +€{finding.impact.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{finding.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Per-GP gap summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gap Summary by GP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-medium">Gap Area</th>
                  <th className="pb-2 pr-4 font-medium text-right">Dr A</th>
                  <th className="pb-2 pr-4 font-medium text-right">Dr B</th>
                  <th className="pb-2 pr-4 font-medium text-right">Dr C</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                  <th className="pb-2 pl-4 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 pr-4 font-medium">Medical Indemnity</td>
                  <td className="py-2 pr-4 text-right">€9,546</td>
                  <td className="py-2 pr-4 text-right">€6,364</td>
                  <td className="py-2 pr-4 text-right">€12,092</td>
                  <td className="py-2 text-right font-semibold text-green-700">€28,002</td>
                  <td className="py-2 pl-4">
                    <Badge variant="outline" className={severityStyles.critical}>HIGH</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">Unclaimed Leave</td>
                  <td className="py-2 pr-4 text-right">€9,468</td>
                  <td className="py-2 pr-4 text-right">€5,523</td>
                  <td className="py-2 pr-4 text-right">€10,651</td>
                  <td className="py-2 text-right font-semibold text-green-700">€25,642</td>
                  <td className="py-2 pl-4">
                    <Badge variant="outline" className={severityStyles.critical}>HIGH</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">Practice Grant</td>
                  <td className="py-2 pr-4 text-right text-muted-foreground" colSpan={3}>
                    Practice-wide: 3 × €15,000
                  </td>
                  <td className="py-2 text-right font-semibold text-green-700">€45,000</td>
                  <td className="py-2 pl-4">
                    <Badge variant="outline" className={severityStyles.critical}>HIGH</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">U6 Asthma CoC</td>
                  <td className="py-2 pr-4 text-right text-muted-foreground">0 reg</td>
                  <td className="py-2 pr-4 text-right text-muted-foreground">1 reg</td>
                  <td className="py-2 pr-4 text-right text-muted-foreground">0 reg</td>
                  <td className="py-2 text-right text-muted-foreground">1 total</td>
                  <td className="py-2 pl-4">
                    <Badge variant="outline" className={severityStyles.high}>HIGH</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-medium">PP Under-utilisation</td>
                  <td className="py-2 pr-4 text-right text-muted-foreground">21</td>
                  <td className="py-2 pr-4 text-right text-muted-foreground">26</td>
                  <td className="py-2 pr-4 text-right text-muted-foreground">38</td>
                  <td className="py-2 text-right text-muted-foreground">85 consults</td>
                  <td className="py-2 pl-4">
                    <Badge variant="outline" className={severityStyles.medium}>MED</Badge>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="pt-2 pr-4">Total Quantifiable</td>
                  <td className="pt-2 pr-4" colSpan={3}></td>
                  <td className="pt-2 text-right text-green-700">€98,644</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
