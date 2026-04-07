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

const mockFindings = [
  {
    id: "1",
    severity: "critical",
    type: "clawback_risk",
    title: "23 potential duplicate claims detected",
    description:
      "Found 8 groups of claims with matching code, date, and patient reference.",
    impact: 4850,
    direction: "negative",
    status: "open",
  },
  {
    id: "2",
    severity: "critical",
    type: "clawback_risk",
    title: "Overlapping GMS consultation and out-of-hours claims",
    description:
      "5 instances where GMS consultations overlap with OOH claims on the same day for the same patient.",
    impact: 1200,
    direction: "negative",
    status: "open",
  },
  {
    id: "3",
    severity: "high",
    type: "data_quality",
    title: "12 claims have future dates",
    description:
      "Claims dated after today found — likely data entry errors or formatting issues.",
    impact: null,
    direction: null,
    status: "open",
  },
  {
    id: "4",
    severity: "high",
    type: "underclaiming",
    title: "Chronic Disease Management severely under-claimed",
    description:
      "Practice has 380 GMS patients but only 3 CDM claims. National average is ~35% uptake.",
    impact: 18200,
    direction: "positive",
    status: "open",
  },
  {
    id: "5",
    severity: "high",
    type: "underclaiming",
    title: "No Heartwatch claims submitted",
    description:
      "Practice appears eligible for Heartwatch but has zero claims in this period.",
    impact: 8500,
    direction: "positive",
    status: "in_progress",
  },
  {
    id: "6",
    severity: "medium",
    type: "data_quality",
    title: "34% of claims missing clinician ID",
    description:
      "478 out of 1,406 claims have no clinician identifier.",
    impact: null,
    direction: null,
    status: "open",
  },
  {
    id: "7",
    severity: "medium",
    type: "underclaiming",
    title: 'Low claim volume for "Special Items of Service"',
    description:
      "Only 7 SIS claims in this quarter — well below the median for a 3-GP practice.",
    impact: 3400,
    direction: "positive",
    status: "open",
  },
  {
    id: "8",
    severity: "medium",
    type: "compliance",
    title: "Immunisation claims lack batch numbers",
    description:
      "14 immunisation claims are missing vaccine batch number data.",
    impact: null,
    direction: null,
    status: "resolved",
  },
  {
    id: "9",
    severity: "low",
    type: "compliance",
    title: "18 claims with €0 amount",
    description:
      "Zero-value claims — may be administrative or incomplete.",
    impact: null,
    direction: null,
    status: "dismissed",
  },
  {
    id: "10",
    severity: "low",
    type: "data_quality",
    title: "Inconsistent date formatting in 6 rows",
    description:
      "Mixed DD/MM/YYYY and MM/DD/YYYY formats detected in the source file.",
    impact: null,
    direction: null,
    status: "resolved",
  },
];

export default function PreviewFindingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Findings</h1>
        <p className="text-muted-foreground text-sm">
          All analysis findings across your claims data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {mockFindings.length} Findings
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
              {mockFindings.map((finding) => (
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
                    {finding.impact ? (
                      <span
                        className={
                          finding.direction === "positive"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {finding.direction === "positive" ? "+" : "-"}€
                        {finding.impact.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        finding.status === "resolved" ? "default" : "outline"
                      }
                    >
                      {finding.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
