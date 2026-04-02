import { requirePractice } from "@/lib/auth";
import { getFindingsForPractice } from "@/db/queries/findings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export default async function ActionsPage() {
  const practice = await requirePractice();
  // Fetch actionable findings (those with recommended actions)
  const allFindings = await getFindingsForPractice(practice.id);

  const openFindings = allFindings.filter(
    (f) => f.actionStatus === "open" || f.actionStatus === "in_progress"
  );
  const resolvedFindings = allFindings.filter(
    (f) => f.actionStatus === "resolved" || f.actionStatus === "dismissed"
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Actions</h1>
        <p className="text-muted-foreground text-sm">
          Track recommended actions from your claims analysis
        </p>
      </div>

      {allFindings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">
              No actions yet. Upload claims data to generate recommendations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">
              Open ({openFindings.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedFindings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="space-y-3 mt-4">
            {openFindings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  All caught up! No open actions.
                </CardContent>
              </Card>
            ) : (
              openFindings.map((finding) => (
                <Card key={finding.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Badge
                        variant="outline"
                        className={severityStyles[finding.severity] ?? ""}
                      >
                        {finding.severity}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{finding.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {finding.description}
                        </p>
                        {finding.recommendedAction && (
                          <div className="mt-3 rounded-md bg-muted p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Recommended Action
                            </p>
                            <p className="text-sm">
                              {finding.recommendedAction}
                            </p>
                          </div>
                        )}
                      </div>
                      {finding.estimatedImpact && (
                        <span className="text-sm font-semibold whitespace-nowrap">
                          €{Number(finding.estimatedImpact).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-3 mt-4">
            {resolvedFindings.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No resolved actions yet.
                </CardContent>
              </Card>
            ) : (
              resolvedFindings.map((finding) => (
                <Card key={finding.id} className="opacity-75">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">
                        {statusLabels[finding.actionStatus]}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{finding.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {finding.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
