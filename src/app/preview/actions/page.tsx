import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

const openActions = [
  {
    id: "1",
    severity: "critical",
    title: "23 potential duplicate claims detected",
    description:
      "8 groups of claims with matching code, date, and patient reference may be flagged for clawback.",
    action:
      "Review each duplicate group in PCRS Online. For genuine duplicates, void the duplicate claim before the next PCRS reconciliation. For legitimate repeat visits, add distinguishing clinical notes.",
    impact: 4850,
  },
  {
    id: "2",
    severity: "high",
    title: "Chronic Disease Management severely under-claimed",
    description:
      "Practice has 380 GMS patients but only 3 CDM claims. National average is ~35% uptake.",
    action:
      "1) Run a patient register report to identify GMS patients with chronic conditions (diabetes, COPD, CVD). 2) Schedule CDM review clinics. 3) Ensure structured CDM templates are active in your clinical system. Potential recovery: ~€18,200/year.",
    impact: 18200,
  },
  {
    id: "3",
    severity: "high",
    title: "No Heartwatch claims submitted",
    description:
      "Practice appears eligible for Heartwatch but has zero claims this period.",
    action:
      "1) Confirm Heartwatch registration status with PCRS. 2) If registered, identify eligible patients from the cardiovascular risk register. 3) Schedule Heartwatch annual reviews and submit claims.",
    impact: 8500,
  },
  {
    id: "4",
    severity: "medium",
    title: "34% of claims missing clinician ID",
    description:
      "478 of 1,406 claims lack a clinician identifier, limiting per-GP analysis.",
    action:
      "Check your practice management system export settings. Ensure the 'Practitioner' field is included in PCRS export templates. Re-export and re-upload for more accurate per-clinician insights.",
    impact: null,
  },
  {
    id: "5",
    severity: "medium",
    title: 'Low claim volume for "Special Items of Service"',
    description:
      "Only 7 SIS claims — well below median for a 3-GP practice.",
    action:
      "Review your SIS claim eligibility checklist. Common missed items: suturing, I&D, ECGs, spirometry. Ensure all procedural consultations have an SIS claim attached.",
    impact: 3400,
  },
];

const resolvedActions = [
  {
    id: "8",
    status: "resolved",
    title: "Immunisation claims lack batch numbers",
    description:
      "14 immunisation claims updated with batch number data from vaccine fridge logs.",
  },
  {
    id: "9",
    status: "dismissed",
    title: "18 claims with €0 amount",
    description:
      "Confirmed as administrative placeholder claims — no action required.",
  },
  {
    id: "10",
    status: "resolved",
    title: "Inconsistent date formatting in 6 rows",
    description:
      "Fixed date format in practice management system export settings.",
  },
];

export default function PreviewActionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Actions</h1>
        <p className="text-muted-foreground text-sm">
          Track recommended actions from your claims analysis
        </p>
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">
            Open ({openActions.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedActions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-3 mt-4">
          {openActions.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className={severityStyles[item.severity] ?? ""}
                  >
                    {item.severity}
                  </Badge>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                    <div className="mt-3 rounded-md bg-muted p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Recommended Action
                      </p>
                      <p className="text-sm">{item.action}</p>
                    </div>
                  </div>
                  {item.impact && (
                    <span className="text-sm font-semibold whitespace-nowrap">
                      €{item.impact.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-3 mt-4">
          {resolvedActions.map((item) => (
            <Card key={item.id} className="opacity-75">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Badge variant="outline">{item.status}</Badge>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
