"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ── Severity badge styles ──────────────────────────────────────────
const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

const statusStyles: Record<string, string> = {
  open: "bg-slate-100 text-slate-700 border-slate-200",
  "in-progress": "bg-blue-100 text-blue-700 border-blue-200",
  submitted: "bg-purple-100 text-purple-700 border-purple-200",
  confirmed: "bg-green-100 text-green-700 border-green-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  dismissed: "bg-gray-100 text-gray-500 border-gray-200",
};

// ── HSE Health Regions with county mappings ────────────────────────
// 6 regions established under HSE reform (2024)
const hseRegions = [
  {
    name: "HSE Dublin & North East",
    counties: ["Dublin", "Meath", "Louth", "Cavan", "Monaghan"],
    contact: "Regional office, Dr Steevens' Hospital, Dublin 8",
    phone: "01 635 2500",
  },
  {
    name: "HSE Dublin & Midlands",
    counties: ["Dublin (West)", "Kildare", "Laois", "Offaly", "Westmeath", "Longford"],
    contact: "Regional office, Tullamore, Co. Offaly",
    phone: "057 935 7800",
  },
  {
    name: "HSE South East",
    counties: ["Wicklow", "Wexford", "Waterford", "Kilkenny", "Carlow", "Tipperary (South)"],
    contact: "Regional office, Lacken, Kilkenny",
    phone: "056 778 4100",
  },
  {
    name: "HSE South West",
    counties: ["Cork", "Kerry"],
    contact: "Regional office, Model Business Park, Cork",
    phone: "021 492 8500",
  },
  {
    name: "HSE West & North West",
    counties: ["Galway", "Mayo", "Roscommon", "Sligo", "Leitrim", "Donegal"],
    contact: "Regional office, Merlin Park, Galway",
    phone: "091 775 400",
  },
  {
    name: "HSE Mid West",
    counties: ["Clare", "Limerick", "Tipperary (North)"],
    contact: "Regional office, Catherine Street, Limerick",
    phone: "061 483 369",
  },
];

// ── PCRS Resource Links ───────────────────────────────────────────
const pcrsResources = [
  {
    label: "PCRS Online (GP Suite)",
    url: "https://www.sspcrs.ie/portal/nmco-api/login",
    description: "Submit and manage STC claims, view payment schedules",
  },
  {
    label: "GP Circulars",
    url: "https://www.hse.ie/eng/staff/pcrs/circulars/gp/",
    description: "Latest PCRS circulars, fee updates, and policy changes",
  },
  {
    label: "PCRS Doctors Handbook",
    url: "https://assets.hse.ie/media/documents/PCRS_handbook_for_Doctors.pdf",
    description: "Complete reference for GMS claim types and procedures",
  },
  {
    label: "CDM Programme Guide",
    url: "https://www.hse.ie/eng/about/who/gmscontracts/2019agreement/chronic-disease-management-programme/",
    description: "Chronic Disease Management claiming rules and templates",
  },
  {
    label: "Contact PCRS",
    url: "https://www.hse.ie/eng/staff/pcrs/contact-pcrs/",
    description: "Full PCRS contact details and office information",
  },
  {
    label: "GMS Contract (2019 Agreement)",
    url: "https://www.hse.ie/eng/about/who/gmscontracts/2019agreement/",
    description: "Full GMS contract terms including CDM and STC schedules",
  },
];

// ── Action playbooks with step-by-step workflows ──────────────────
type ActionStatus = "open" | "in-progress" | "submitted" | "confirmed";

interface PlaybookStep {
  step: number;
  title: string;
  detail: string;
  link?: { label: string; url: string };
}

interface ActionItem {
  id: string;
  severity: string;
  status: ActionStatus;
  title: string;
  description: string;
  impact: number | null;
  category: string;
  playbook: PlaybookStep[];
}

const openActions: ActionItem[] = [
  {
    id: "1",
    severity: "critical",
    status: "open",
    title: "23 potential duplicate claims detected",
    description:
      "8 groups of claims with matching code, date, and patient reference may be flagged for clawback.",
    impact: 4850,
    category: "Clawback Prevention",
    playbook: [
      {
        step: 1,
        title: "Log in to PCRS Online (GP Suite)",
        detail:
          "Access your practice account at sspcrs.ie and navigate to the Claims History section.",
        link: {
          label: "Open PCRS Online",
          url: "https://www.sspcrs.ie/portal/nmco-api/login",
        },
      },
      {
        step: 2,
        title: "Review each duplicate group",
        detail:
          "Cross-reference the 8 flagged groups against your clinical records. Check if they are genuine duplicates or legitimate repeat visits on the same day.",
      },
      {
        step: 3,
        title: "Void genuine duplicates",
        detail:
          "For confirmed duplicates, submit a void request through GP Suite BEFORE the next PCRS reconciliation date. This prevents automatic clawback.",
      },
      {
        step: 4,
        title: "Add clinical notes for legitimate claims",
        detail:
          "For legitimate repeat visits, add distinguishing clinical notes to each claim to justify the separate billing.",
      },
      {
        step: 5,
        title: "Confirm resolution",
        detail:
          "Check the next PCRS payment schedule to verify no clawback was applied. Mark this action as confirmed once verified.",
      },
    ],
  },
  {
    id: "2",
    severity: "high",
    status: "open",
    title: "Chronic Disease Management severely under-claimed",
    description:
      "Practice has 380 GMS patients but only 3 CDM claims. National average is ~35% uptake.",
    impact: 18200,
    category: "Revenue Recovery",
    playbook: [
      {
        step: 1,
        title: "Run patient register report",
        detail:
          "In your practice management system, filter GMS patients with diagnosed chronic conditions: diabetes, COPD, CVD, asthma. This is your eligible cohort.",
      },
      {
        step: 2,
        title: "Review CDM programme requirements",
        detail:
          "Each CDM claim requires a structured annual review using the approved template. Review the CDM programme guide for current requirements.",
        link: {
          label: "CDM Programme Guide",
          url: "https://www.hse.ie/eng/about/who/gmscontracts/2019agreement/chronic-disease-management-programme/",
        },
      },
      {
        step: 3,
        title: "Activate CDM templates",
        detail:
          "Ensure your clinical system has the structured CDM review templates enabled. These auto-populate required fields for the data return.",
      },
      {
        step: 4,
        title: "Schedule CDM review clinics",
        detail:
          "Block 2-3 clinic sessions per week specifically for CDM reviews. Work through your eligible patient list systematically.",
      },
      {
        step: 5,
        title: "Submit CDM data returns",
        detail:
          "CDM claims are submitted via your practice management software data return (not GP Suite). Ensure returns are submitted quarterly.",
      },
      {
        step: 6,
        title: "Verify payment on schedule",
        detail:
          "CDM payments appear on your PCRS payment schedule. Expected recovery: ~€18,200/year at 35% uptake. Mark confirmed once first payments arrive.",
      },
    ],
  },
  {
    id: "3",
    severity: "high",
    status: "open",
    title: "No Heartwatch claims submitted",
    description:
      "Practice appears eligible for Heartwatch but has zero claims this period.",
    impact: 8500,
    category: "Revenue Recovery",
    playbook: [
      {
        step: 1,
        title: "Confirm Heartwatch registration",
        detail:
          "Contact PCRS to verify your practice's Heartwatch registration status. If not registered, request enrolment.",
        link: {
          label: "Contact PCRS",
          url: "https://www.hse.ie/eng/staff/pcrs/contact-pcrs/",
        },
      },
      {
        step: 2,
        title: "Identify eligible patients",
        detail:
          "From your cardiovascular risk register, identify patients eligible for Heartwatch annual reviews (patients with established CVD or high CV risk).",
      },
      {
        step: 3,
        title: "Schedule Heartwatch clinics",
        detail:
          "Heartwatch reviews require structured assessments. Schedule dedicated clinics and use the approved Heartwatch assessment template.",
      },
      {
        step: 4,
        title: "Submit claims via GP Suite",
        detail:
          "Heartwatch claims are submitted as STCs through PCRS Online (GP Suite). Ensure each claim has the correct Heartwatch item code.",
        link: {
          label: "Open PCRS Online",
          url: "https://www.sspcrs.ie/portal/nmco-api/login",
        },
      },
      {
        step: 5,
        title: "Track quarterly progress",
        detail:
          "Monitor Heartwatch claim volume quarterly. Target: at least 85% of eligible patients reviewed annually. Expected recovery: ~€8,500/year.",
      },
    ],
  },
  {
    id: "4",
    severity: "medium",
    status: "open",
    title: "34% of claims missing clinician ID",
    description:
      "478 of 1,406 claims lack a clinician identifier, limiting per-GP analysis.",
    impact: null,
    category: "Data Quality",
    playbook: [
      {
        step: 1,
        title: "Check practice management export settings",
        detail:
          "Open your practice management system's PCRS export configuration. Locate the field mapping for 'Practitioner' or 'Clinician ID'.",
      },
      {
        step: 2,
        title: "Enable clinician ID in exports",
        detail:
          "Ensure the clinician identifier field is included in all PCRS data exports. This is usually a GP Medical Council number or PCRS practitioner number.",
      },
      {
        step: 3,
        title: "Re-export and re-upload",
        detail:
          "Generate a fresh export with the corrected settings and re-upload to the Claims Intelligence Platform for more accurate per-clinician analysis.",
      },
    ],
  },
  {
    id: "5",
    severity: "medium",
    status: "open",
    title: 'Low claim volume for Special Items of Service',
    description:
      "Only 7 SIS claims — well below median for a 3-GP practice.",
    impact: 3400,
    category: "Revenue Recovery",
    playbook: [
      {
        step: 1,
        title: "Review SIS eligible procedures",
        detail:
          "Check the PCRS Doctors Handbook for the full list of Special Items of Service. Common missed items: suturing, I&D, ECGs, spirometry, excisions.",
        link: {
          label: "PCRS Doctors Handbook",
          url: "https://assets.hse.ie/media/documents/PCRS_handbook_for_Doctors.pdf",
        },
      },
      {
        step: 2,
        title: "Audit recent procedural consultations",
        detail:
          "Review the last 3 months of consultations involving procedures. Cross-reference against SIS claim submissions to identify unclaimed items.",
      },
      {
        step: 3,
        title: "Submit retrospective SIS claims",
        detail:
          "SIS claims can be submitted retrospectively (within the allowed window). Submit via PCRS Online for any eligible procedures that were missed.",
        link: {
          label: "Open PCRS Online",
          url: "https://www.sspcrs.ie/portal/nmco-api/login",
        },
      },
      {
        step: 4,
        title: "Set up claiming workflow",
        detail:
          "Add SIS claim prompts to your practice workflow: after each eligible procedure, the treating GP should immediately log the SIS claim in GP Suite.",
      },
    ],
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

// ── Chevron icon (no external deps) ───────────────────────────────
function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="h-3 w-3 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// ── County lookup component ───────────────────────────────────────
function CountyLookup() {
  const [selectedCounty, setSelectedCounty] = useState("");
  const counties = hseRegions.flatMap((r) => r.counties).sort();
  const matchedRegion = selectedCounty
    ? hseRegions.find((r) => r.counties.includes(selectedCounty))
    : null;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Find your HSE Health Region</label>
      <select
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={selectedCounty}
        onChange={(e) => setSelectedCounty(e.target.value)}
      >
        <option value="">Select your county...</option>
        {counties.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      {matchedRegion && (
        <div className="rounded-md bg-blue-50 border border-blue-200 p-3 space-y-2">
          <p className="text-sm font-semibold text-blue-900">
            {matchedRegion.name}
          </p>
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <MapPinIcon />
            <span>{matchedRegion.contact}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <PhoneIcon />
            <span>{matchedRegion.phone}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Action card with expandable playbook ──────────────────────────
function ActionCard({ action }: { action: ActionItem }) {
  const [expanded, setExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ActionStatus>(action.status);

  const statusFlow: ActionStatus[] = ["open", "in-progress", "submitted", "confirmed"];
  const currentIdx = statusFlow.indexOf(currentStatus);

  function advanceStatus() {
    if (currentIdx < statusFlow.length - 1) {
      setCurrentStatus(statusFlow[currentIdx + 1]);
    }
  }

  const nextLabel: Record<string, string> = {
    open: "Start Working",
    "in-progress": "Mark Submitted",
    submitted: "Mark Confirmed",
    confirmed: "Completed",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <Badge
            variant="outline"
            className={severityStyles[action.severity] ?? ""}
          >
            {action.severity}
          </Badge>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-medium">{action.title}</h3>
              <Badge
                variant="outline"
                className={statusStyles[currentStatus] ?? ""}
              >
                {currentStatus}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {action.description}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium">Category:</span> {action.category}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {action.impact && (
              <span className="text-sm font-semibold text-green-700 whitespace-nowrap">
                €{action.impact.toLocaleString()}
              </span>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Playbook
              <ChevronDown open={expanded} />
            </button>
          </div>
        </div>

        {/* Expandable playbook */}
        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Progress bar */}
            <div className="flex items-center gap-1">
              {statusFlow.map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div
                    className={`h-1.5 flex-1 rounded-full ${
                      i <= currentIdx ? "bg-primary" : "bg-muted"
                    }`}
                  />
                  {i < statusFlow.length - 1 && (
                    <div className="h-1.5 w-1.5 rounded-full bg-muted" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
              {statusFlow.map((s) => (
                <span key={s} className={s === currentStatus ? "font-semibold text-foreground" : ""}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              ))}
            </div>

            {/* Step-by-step playbook */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Step-by-step playbook
              </p>
              <ol className="space-y-3">
                {action.playbook.map((step) => (
                  <li key={step.step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {step.step}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.detail}
                      </p>
                      {step.link && (
                        <a
                          href={step.link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-medium text-primary hover:underline mt-1"
                        >
                          {step.link.label}
                          <ExternalLinkIcon />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Action button */}
            {currentStatus !== "confirmed" && (
              <button
                onClick={advanceStatus}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {nextLabel[currentStatus]}
              </button>
            )}
            {currentStatus === "confirmed" && (
              <div className="flex items-center justify-center gap-2 rounded-md bg-green-50 border border-green-200 p-3">
                <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-green-700">
                  Action completed and confirmed
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function PreviewActionsPage() {
  const totalImpact = openActions.reduce((sum, a) => sum + (a.impact ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Actions</h1>
        <p className="text-muted-foreground text-sm">
          Guided workflows to recover revenue and prevent clawbacks
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground">
              Open Actions
            </p>
            <p className="text-2xl font-bold mt-1">{openActions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground">
              Potential Recovery
            </p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              €{totalImpact.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-muted-foreground">
              Resolved
            </p>
            <p className="text-2xl font-bold mt-1">{resolvedActions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="actions">
        <TabsList>
          <TabsTrigger value="actions">
            Action Playbooks ({openActions.length})
          </TabsTrigger>
          <TabsTrigger value="resources">
            PCRS Resources
          </TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts & Directory
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({resolvedActions.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Action Playbooks tab ── */}
        <TabsContent value="actions" className="space-y-3 mt-4">
          <p className="text-xs text-muted-foreground">
            Click <strong>Playbook</strong> on any action to see the step-by-step
            guide. Track your progress from Open → In Progress → Submitted → Confirmed.
          </p>
          {openActions.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </TabsContent>

        {/* ── PCRS Resources tab ── */}
        <TabsContent value="resources" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PCRS Portals & Forms</CardTitle>
              <CardDescription>
                Direct links to the systems and documents you need to submit and
                manage claims
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pcrsResources.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <ExternalLinkIcon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.description}
                    </p>
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Claim Submission Quick Reference</CardTitle>
              <CardDescription>
                How each claim type is submitted to PCRS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-2 pr-4 font-medium">Claim Type</th>
                      <th className="pb-2 pr-4 font-medium">Submission Method</th>
                      <th className="pb-2 font-medium">Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-2 pr-4 font-medium">GMS Capitation</td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        Automatic via GMS panel registration
                      </td>
                      <td className="py-2 text-muted-foreground">Monthly</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        STCs (Special Type Consultations)
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        GP Suite (sspcrs.ie) — fee per service
                      </td>
                      <td className="py-2 text-muted-foreground">Per claim</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        CDM (Chronic Disease Mgmt)
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        Practice management software data return
                      </td>
                      <td className="py-2 text-muted-foreground">Quarterly</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Vaccinations</td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        GP Suite Online — batch or individual
                      </td>
                      <td className="py-2 text-muted-foreground">Per claim</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">
                        Special Items of Service
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        GP Suite (sspcrs.ie) — SIS claim form
                      </td>
                      <td className="py-2 text-muted-foreground">Per claim</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Heartwatch</td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        GP Suite (sspcrs.ie) — STC item code
                      </td>
                      <td className="py-2 text-muted-foreground">Per review</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Contacts & Directory tab ── */}
        <TabsContent value="contacts" className="mt-4 space-y-4">
          {/* PCRS Central Office */}
          <Card>
            <CardHeader>
              <CardTitle>PCRS Central Office</CardTitle>
              <CardDescription>
                Primary contact for all PCRS claims, payments, and registrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <PhoneIcon />
                <div>
                  <p className="text-sm font-medium">01 864 7100</p>
                  <p className="text-xs text-muted-foreground">
                    Monday to Friday, 9:00 – 17:00
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium">pcrs@hse.ie</p>
                  <p className="text-xs text-muted-foreground">
                    General enquiries and claim queries
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPinIcon />
                <div>
                  <p className="text-sm font-medium">
                    PCRS, Exit 5 M50, North Road, Finglas, Dublin 11
                  </p>
                  <p className="text-xs text-muted-foreground">
                    D11 XKF3
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HSE Health Region Lookup */}
          <Card>
            <CardHeader>
              <CardTitle>HSE Health Region Lookup</CardTitle>
              <CardDescription>
                Select your county to find your regional HSE contact for local
                queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CountyLookup />
            </CardContent>
          </Card>

          {/* All Regions Overview */}
          <Card>
            <CardHeader>
              <CardTitle>All HSE Health Regions</CardTitle>
              <CardDescription>
                6 regions covering the 26 counties of Ireland
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hseRegions.map((region) => (
                <div
                  key={region.name}
                  className="rounded-md border p-3 space-y-1"
                >
                  <p className="text-sm font-semibold">{region.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {region.counties.join(", ")}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <PhoneIcon />
                      {region.phone}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPinIcon />
                      {region.contact}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Resolved tab ── */}
        <TabsContent value="resolved" className="space-y-3 mt-4">
          {resolvedActions.map((item) => (
            <Card key={item.id} className="opacity-75">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className={statusStyles[item.status] ?? ""}
                  >
                    {item.status}
                  </Badge>
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
