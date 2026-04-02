"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types";

// Color coding: 80-100 green, 60-79 amber, 0-59 red
function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

function progressColor(score: number) {
  if (score >= 80) return "[&>div]:bg-green-500";
  if (score >= 60) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
}

const componentLabels: Record<string, string> = {
  clawbackRisk: "Clawback Risk",
  underclaiming: "Underclaiming",
  compliance: "Compliance",
  dataQuality: "Data Quality",
};

const componentWeights: Record<string, string> = {
  clawbackRisk: "40%",
  underclaiming: "30%",
  compliance: "20%",
  dataQuality: "10%",
};

type HealthScoreProps = {
  healthScore: NonNullable<DashboardSummary["healthScore"]>;
};

export function HealthScoreCard({ healthScore }: HealthScoreProps) {
  const components = [
    { key: "clawbackRisk", score: healthScore.clawbackRisk },
    { key: "underclaiming", score: healthScore.underclaiming },
    { key: "compliance", score: healthScore.compliance },
    { key: "dataQuality", score: healthScore.dataQuality },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Claims Health Score</CardTitle>
          <div className="flex gap-2">
            {!healthScore.humanValidated && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                Preliminary
              </Badge>
            )}
            {healthScore.suppressed && (
              <Badge variant="destructive">Suppressed</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {healthScore.suppressed ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">
              Score suppressed: {healthScore.suppressedReason}
            </p>
          </div>
        ) : (
          <>
            {/* Overall score - large display */}
            <div className="text-center mb-6">
              <span
                className={cn(
                  "text-5xl font-bold tabular-nums",
                  scoreColor(healthScore.overall)
                )}
              >
                {healthScore.overall}
              </span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>

            {/* Component scores */}
            <div className="space-y-3">
              {components.map(({ key, score }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {componentLabels[key]}
                    </span>
                    <span className="text-muted-foreground">
                      {score}/100{" "}
                      <span className="text-xs">
                        ({componentWeights[key]})
                      </span>
                    </span>
                  </div>
                  <Progress
                    value={score}
                    className={cn("h-2", progressColor(score))}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
