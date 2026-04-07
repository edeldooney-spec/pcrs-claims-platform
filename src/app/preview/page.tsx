"use client";

import { HealthScoreCard } from "@/components/health-score-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, Upload, TrendingUp } from "lucide-react";

// ── Mock data based on Asumpta's real PCRS analysis report ────────
// Pattern: preview pages use hardcoded data that mirrors real analysis output
// so the demo feels authentic to stakeholders

const mockHealthScore = {
  overall: 54,
  // Low scores reflect the significant gaps found in the real report
  clawbackRisk: 72, // no duplicate claims flagged, but M&I paper-based
  underclaiming: 32, // major gaps: asthma CoC, leave, medical indemnity, PP
  compliance: 65, // M&I paper claims, leave tracking gaps
  dataQuality: 78, // data mostly clean, some format issues
  humanValidated: false,
  suppressed: false,
};

const practiceStats = {
  name: "Xxxx Medical Practice, Killarney",
  gps: 3,
  combinedPanel: 3188,
  weightedPanel: 4368,
  threeYearGross: 4019386,
  threeYearNet: 3081015,
  totalGaps: 142065, // €97,065 + €45,000 practice grant
  periodStart: "Jan 2023",
  periodEnd: "Dec 2025",
};

const priorityFindings = [
  {
    id: "1",
    severity: "critical",
    title: "Medical indemnity refund unclaimed — all 3 GPs",
    description:
      "No medical indemnity refund submitted in 36 months across any GP. Combined loss: €28,002 (Dr A 75% band, Dr B 50% band, Dr C 95% band).",
    impact: 28002,
    direction: "positive",
  },
  {
    id: "2",
    severity: "critical",
    title: "€45,000 Practice Support Grant not applied for",
    description:
      "3 GPs × €15,000 grant available. Secretary hired Dec 2023 received €0 subsidy in 14 months — strongest case for immediate application.",
    impact: 45000,
    direction: "positive",
  },
  {
    id: "3",
    severity: "high",
    title: "Annual & study leave significantly under-claimed",
    description:
      "Combined €24,063 in unclaimed leave. Dr A: 28 days annual + 20 study days. Dr B: 8 days annual + 20 study. Dr C: 30 days annual + 24 study.",
    impact: 24063,
    direction: "positive",
  },
  {
    id: "4",
    severity: "high",
    title: "Under-6 Asthma Cycle of Care — 1 registration in 36 months",
    description:
      "Combined Under-6 panel of 409 children across 3 GPs but only 1 Asthma CoC registration. Registration fee + ongoing capitation available.",
    impact: null,
    direction: "positive",
  },
];

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function PreviewDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{practiceStats.name}</h1>
          <p className="text-muted-foreground text-sm">
            PCRS Payment Analysis — {practiceStats.periodStart} to{" "}
            {practiceStats.periodEnd} ({practiceStats.gps} GPs, combined panel{" "}
            {practiceStats.combinedPanel.toLocaleString()})
          </p>
        </div>
        <Link href="/preview/upload" className={buttonVariants()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Data
        </Link>
      </div>

      {/* Revenue recovery banner */}
      <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              Total Revenue Recovery Identified
            </p>
            <p className="text-xs text-green-600 mt-0.5">
              Across {practiceStats.gps} panel holders over{" "}
              {practiceStats.periodStart}–{practiceStats.periodEnd}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-700">
              €{practiceStats.totalGaps.toLocaleString()}
            </p>
            <Link
              href="/preview/actions"
              className="text-xs font-medium text-green-700 hover:underline"
            >
              Start recovery process →
            </Link>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Health Score */}
        <div className="lg:col-span-1">
          <HealthScoreCard healthScore={mockHealthScore} />
        </div>

        {/* Findings summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Total Findings</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">4</p>
                <p className="text-xs text-muted-foreground">
                  High / Critical
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  €97k
                </p>
                <p className="text-xs text-muted-foreground">
                  Quantifiable Gaps
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">€45k</p>
                <p className="text-xs text-muted-foreground">
                  Practice Grant
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/preview/findings"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full",
                })}
              >
                View All Findings
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Per-GP summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Per-GP Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  name: "Dr A",
                  panel: "1,057",
                  net: "€955,035",
                  gaps: "€19,014",
                },
                {
                  name: "Dr B",
                  panel: "931",
                  net: "€908,733",
                  gaps: "€11,887",
                },
                {
                  name: "Dr C",
                  panel: "1,204",
                  net: "€1,217,247",
                  gaps: "€21,164",
                },
              ].map((gp) => (
                <div
                  key={gp.name}
                  className="flex items-center justify-between rounded-lg border p-2.5"
                >
                  <div>
                    <p className="text-sm font-medium">{gp.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Panel: {gp.panel} | 3yr net: {gp.net}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-green-700">
                    {gp.gaps}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                + Practice Grant
              </span>
              <span className="text-sm font-semibold text-green-700">
                €45,000
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority findings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Priority Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {priorityFindings.map((finding) => (
              <div
                key={finding.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <Badge
                  variant="outline"
                  className={severityStyles[finding.severity] ?? ""}
                >
                  {finding.severity}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{finding.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {finding.description}
                  </p>
                </div>
                {finding.impact && (
                  <span className="text-sm font-medium whitespace-nowrap text-green-600">
                    +€{finding.impact.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/preview/actions"
              className={buttonVariants({
                size: "sm",
                className: "w-full",
              })}
            >
              Go to Recovery Centre →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 3-Year Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">3-Year Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-medium">Category</th>
                  <th className="pb-2 pr-4 font-medium text-right">Dr A</th>
                  <th className="pb-2 pr-4 font-medium text-right">Dr B</th>
                  <th className="pb-2 pr-4 font-medium text-right">Dr C</th>
                  <th className="pb-2 font-medium text-right">Practice</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { cat: "Capitation", a: 724404, b: 604086, c: 908155 },
                  { cat: "Special Type / OOH", a: 276340, b: 263451, c: 315161 },
                  { cat: "Practice Support", a: 181303, b: 156671, c: 214090 },
                  { cat: "CDM Programme", a: 113029, b: 106702, c: 153853 },
                  { cat: "Vaccinations", a: 28456, b: 24260, c: 39305 },
                  { cat: "Contraception STCs", a: 11300, b: 13290, c: 9350 },
                  { cat: "Locum Expenses", a: 24260, b: 18244, c: 19033 },
                ].map((row) => (
                  <tr key={row.cat}>
                    <td className="py-2 pr-4 font-medium">{row.cat}</td>
                    <td className="py-2 pr-4 text-right text-muted-foreground">
                      €{row.a.toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-right text-muted-foreground">
                      €{row.b.toLocaleString()}
                    </td>
                    <td className="py-2 pr-4 text-right text-muted-foreground">
                      €{row.c.toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-medium">
                      €{(row.a + row.b + row.c).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td className="pt-2 pr-4">Total Gross</td>
                  <td className="pt-2 pr-4 text-right">€1,250,236</td>
                  <td className="pt-2 pr-4 text-right">€1,181,117</td>
                  <td className="pt-2 pr-4 text-right">€1,588,033</td>
                  <td className="pt-2 text-right text-green-700">€4,019,386</td>
                </tr>
                <tr className="font-semibold">
                  <td className="pt-1 pr-4">Total Net</td>
                  <td className="pt-1 pr-4 text-right">€955,035</td>
                  <td className="pt-1 pr-4 text-right">€908,733</td>
                  <td className="pt-1 pr-4 text-right">€1,217,247</td>
                  <td className="pt-1 text-right text-green-700">€3,081,015</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
