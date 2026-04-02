import { requirePractice } from "@/lib/auth";
import { getDashboardSummary } from "@/db/queries/dashboard";
import { getTopFindings } from "@/db/queries/findings";
import { HealthScoreCard } from "@/components/health-score-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import {
  AlertTriangle,
  Upload,
  TrendingUp,
  FileText,
} from "lucide-react";

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

export default async function DashboardPage() {
  const practice = await requirePractice();
  const [summary, topFindings] = await Promise.all([
    getDashboardSummary(practice.id),
    getTopFindings(practice.id),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{practice.name}</h1>
          <p className="text-muted-foreground text-sm">
            Claims analysis dashboard
          </p>
        </div>
        <Link href="/upload" className={buttonVariants()}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Data
        </Link>
      </div>

      {/* Empty state — no uploads yet */}
      {!summary.lastUpload && !summary.healthScore && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Welcome to Claims Intelligence
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Upload your PCRS claims data to get an AI-powered analysis of
              clawback risks, underclaiming opportunities, and compliance
              issues.
            </p>
            <Link href="/upload" className={buttonVariants({ size: "lg" })}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Your First File
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Main grid — show when data exists */}
      {(summary.healthScore || summary.lastUpload) && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Health Score */}
          <div className="lg:col-span-1">
            {summary.healthScore ? (
              <HealthScoreCard healthScore={summary.healthScore} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Claims Health Score</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground text-sm">
                    Processing your data...
                  </p>
                </CardContent>
              </Card>
            )}
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
                  <p className="text-3xl font-bold">
                    {summary.findingsCounts.total}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {summary.findingsCounts.resolved}
                  </p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">
                    {summary.findingsCounts.critical}
                  </p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {summary.findingsCounts.high}
                  </p>
                  <p className="text-xs text-muted-foreground">High</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/findings" className={buttonVariants({ variant: "outline", size: "sm", className: "w-full" })}>
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
              {summary.lastUpload ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium truncate">
                      {summary.lastUpload.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(summary.lastUpload.date).toLocaleDateString(
                        "en-IE",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        summary.lastUpload.status === "complete"
                          ? "default"
                          : summary.lastUpload.status === "failed"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {summary.lastUpload.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {summary.lastUpload.totalRecords.toLocaleString()} records
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No uploads yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top findings list */}
      {topFindings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Priority Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topFindings.map((finding) => (
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
                  {finding.estimatedImpact && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {finding.impactDirection === "positive" ? "+" : "-"}€
                      {Number(finding.estimatedImpact).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
