import { requirePractice } from "@/lib/auth";
import { getFindingsForPractice } from "@/db/queries/findings";
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
  clawback_risk: "Clawback Risk",
  underclaiming: "Underclaiming",
  compliance: "Compliance",
  data_quality: "Data Quality",
};

export default async function FindingsPage() {
  const practice = await requirePractice();
  const findings = await getFindingsForPractice(practice.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Findings</h1>
        <p className="text-muted-foreground text-sm">
          All analysis findings across your claims data
        </p>
      </div>

      {findings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">
              No findings yet. Upload claims data to generate analysis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {findings.length} Finding{findings.length !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Finding</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={severityStyles[finding.severity] ?? ""}
                      >
                        {finding.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {typeLabels[finding.type] ?? finding.type}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px]">
                        <p className="text-sm font-medium">{finding.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {finding.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {finding.estimatedImpact ? (
                        <span
                          className={
                            finding.impactDirection === "positive"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {finding.impactDirection === "positive" ? "+" : "-"}€
                          {Number(finding.estimatedImpact).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          finding.actionStatus === "resolved"
                            ? "default"
                            : "outline"
                        }
                      >
                        {finding.actionStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
