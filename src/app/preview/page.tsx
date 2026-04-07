"use client";

import { HealthScoreCard } from "@/components/health-score-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, Upload, TrendingUp } from "lucide-react";

// Mock data for preview
const mockHealthScore = {
  overall: 72,
  clawbackRisk: 58,
  underclaiming: 81,
  compliance: 85,
  dataQuality: 64,
  humanValidated: false,
  suppressed: false,
};

const mockFindings = [
  {
    id: "1",
    severity: "critical",
    title: "23 potential duplicate claims detected",
    description:
      "Found 8 groups of claims with matching code, date, and patient reference. These may be flagged for clawback by PCRS.",
    impact: 4850,
    direction: "negative",
  },
  {
    id: "2",
    severity: "high",
    title: "12 claims have future dates",
    description:
      "Claims dated after today were found. This typically indicates data entry errors or incorrect date formatting in the PCRS export.",
    impact: null,
    direction: null,
  },
  {
    id: "3",
    severity: "medium",
    title: 'Low claim volume for "Chronic Disease Management"',
    description:
      'Only 3 claims in category "Chronic Disease Management" — this may indicate underclaiming. Compare with typical GP practice benchmarks.',
    impact: 12400,
    direction: "positive",
  },
  {
    id: "4",
    severity: "medium",
    title: "34% of claims missing clinician ID",
    description:
      "478 out of 1,406 claims have no clinician identifier. This limits per-clinician analysis.",
    impact: null,
    direction: null,
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
          <h1 className="text-2xl font-bold">Elm Road Surgery</h1>
          <p className="text-muted-foreground text-sm">
            Claims analysis dashboard
          </p>
        </div>
        <Link href="/preview/upload" className={buttonVariants()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Data
        </Link>
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
              Findings Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">17</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">4</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">2</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">5</p>
                <p className="text-xs text-muted-foreground">High</p>
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

        {/* Last upload status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Latest Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium truncate">
                  PCRS_Claims_Q1_2026.csv
                </p>
                <p className="text-xs text-muted-foreground">
                  3 Apr 2026, 14:32
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="default">complete</Badge>
                <span className="text-sm text-muted-foreground">
                  1,406 records
                </span>
              </div>
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
            {mockFindings.map((finding) => (
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
                  <span
                    className={`text-sm font-medium whitespace-nowrap ${finding.direction === "positive" ? "text-green-600" : "text-red-600"}`}
                  >
                    {finding.direction === "positive" ? "+" : "-"}€
                    {finding.impact.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
