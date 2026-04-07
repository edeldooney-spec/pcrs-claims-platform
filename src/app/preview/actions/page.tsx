"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIAssistant } from "@/components/ai-assistant";

// ── Types ─────────────────────────────────────────────────────────
type ActionStatus = "not-started" | "in-progress" | "submitted" | "confirmed";

interface PlaybookStep {
  step: number;
  title: string;
  detail: string;
  link?: { label: string; url: string };
}

interface ActionItem {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  status: ActionStatus;
  title: string;
  shortTitle: string;
  description: string;
  impact: number | null;
  category: string;
  estimatedTime: string;
  playbook: PlaybookStep[];
}

// ── Traffic light colours ─────────────────────────────────────────
const trafficLight: Record<ActionStatus, { dot: string; bg: string; label: string }> = {
  "not-started": { dot: "bg-red-500", bg: "bg-red-50 border-red-200", label: "Not Started" },
  "in-progress": { dot: "bg-amber-500", bg: "bg-amber-50 border-amber-200", label: "In Progress" },
  submitted: { dot: "bg-blue-500", bg: "bg-blue-50 border-blue-200", label: "Submitted" },
  confirmed: { dot: "bg-green-500", bg: "bg-green-50 border-green-200", label: "Confirmed" },
};

const severityStyles: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200",
};

// ── PCRS resources (used in stepper sidebar) ──────────────────────
const quickLinks = [
  { label: "PCRS Online (GP Suite)", url: "https://www.sspcrs.ie/portal/nmco-api/login" },
  { label: "GP Circulars", url: "https://www.hse.ie/eng/staff/pcrs/circulars/gp/" },
  { label: "Doctors Handbook (PDF)", url: "https://assets.hse.ie/media/documents/PCRS_handbook_for_Doctors.pdf" },
  { label: "CDM Programme", url: "https://www.hse.ie/eng/about/who/gmscontracts/2019agreement/chronic-disease-management-programme/" },
  { label: "Contact PCRS", url: "https://www.hse.ie/eng/staff/pcrs/contact-pcrs/" },
];

// ── Mock action data with full playbooks ──────────────────────────
const initialActions: ActionItem[] = [
  {
    id: "1",
    severity: "critical",
    status: "not-started",
    title: "23 potential duplicate claims detected — clawback risk €4,850",
    shortTitle: "Duplicate Claims",
    description:
      "8 groups of claims with matching code, date, and patient reference. If PCRS flags these in reconciliation, the practice faces automatic clawback.",
    impact: 4850,
    category: "Clawback Prevention",
    estimatedTime: "45 mins",
    playbook: [
      {
        step: 1,
        title: "Log in to PCRS Online",
        detail:
          "Open GP Suite at sspcrs.ie and navigate to Claims History. You'll need your practice's PCRS login credentials.",
        link: { label: "Open PCRS Online →", url: "https://www.sspcrs.ie/portal/nmco-api/login" },
      },
      {
        step: 2,
        title: "Search for the 8 flagged claim groups",
        detail:
          "Use the claim codes and dates from the Findings tab to search. Each group contains 2-3 claims with identical patient ref, code, and date.",
      },
      {
        step: 3,
        title: "Cross-reference with clinical records",
        detail:
          "For each group, check your practice management system. Was this a genuine duplicate entry, or a legitimate repeat visit on the same day?",
      },
      {
        step: 4,
        title: "Void genuine duplicates",
        detail:
          "For confirmed duplicates, submit a void request through GP Suite. This MUST be done before the next PCRS reconciliation (usually monthly).",
      },
      {
        step: 5,
        title: "Document legitimate repeat visits",
        detail:
          "For any claims that are legitimate (e.g., patient returned same day), add distinguishing clinical notes to justify the separate billing.",
      },
      {
        step: 6,
        title: "Verify on next payment schedule",
        detail:
          "After the next PCRS payment cycle, check your schedule to confirm no clawback was applied. Mark this action as confirmed.",
      },
    ],
  },
  {
    id: "2",
    severity: "high",
    status: "not-started",
    title: "Chronic Disease Management severely under-claimed — €18,200/yr potential",
    shortTitle: "CDM Under-claiming",
    description:
      "Practice has 380 GMS patients but only 3 CDM claims. National average is ~35% uptake. At €150 per structured review, this is significant lost revenue.",
    impact: 18200,
    category: "Revenue Recovery",
    estimatedTime: "2-3 weeks (ongoing)",
    playbook: [
      {
        step: 1,
        title: "Generate eligible patient list",
        detail:
          "In your practice management system, run a report filtering GMS patients diagnosed with: diabetes, COPD, cardiovascular disease, or asthma. This is your CDM-eligible cohort.",
      },
      {
        step: 2,
        title: "Review CDM programme requirements",
        detail:
          "Each CDM claim requires a structured annual review using the HSE-approved template. Familiarise yourself with what data points must be captured.",
        link: { label: "CDM Programme Guide →", url: "https://www.hse.ie/eng/about/who/gmscontracts/2019agreement/chronic-disease-management-programme/" },
      },
      {
        step: 3,
        title: "Activate CDM templates in your system",
        detail:
          "Your practice management software (e.g., Socrates, Health One) should have built-in CDM review templates. Activate them so they auto-populate required fields during consultations.",
      },
      {
        step: 4,
        title: "Schedule dedicated CDM clinics",
        detail:
          "Block 2-3 clinic sessions per week specifically for CDM reviews. Work through your eligible patient list alphabetically or by condition. Invite patients by letter or text.",
      },
      {
        step: 5,
        title: "Submit quarterly data returns",
        detail:
          "CDM claims are submitted via your practice management software data return — NOT through GP Suite. Ensure returns are submitted each quarter.",
      },
      {
        step: 6,
        title: "Track payments on PCRS schedule",
        detail:
          "CDM payments appear on your regular PCRS payment schedule. At 35% uptake (133 patients), expected annual revenue is approximately €18,200.",
      },
    ],
  },
  {
    id: "3",
    severity: "high",
    status: "not-started",
    title: "No Heartwatch claims submitted — €8,500/yr potential",
    shortTitle: "Heartwatch Programme",
    description:
      "Practice appears eligible for Heartwatch but has zero claims this period. Heartwatch provides structured secondary prevention for CVD patients.",
    impact: 8500,
    category: "Revenue Recovery",
    estimatedTime: "1-2 weeks",
    playbook: [
      {
        step: 1,
        title: "Confirm Heartwatch registration status",
        detail:
          "Call PCRS on 01 864 7100 to verify whether your practice is registered for the Heartwatch programme. If not, request enrolment — there may be a waiting list.",
        link: { label: "Contact PCRS →", url: "https://www.hse.ie/eng/staff/pcrs/contact-pcrs/" },
      },
      {
        step: 2,
        title: "Identify eligible patients",
        detail:
          "From your cardiovascular risk register, identify patients with established CVD or assessed as high cardiovascular risk. These are your Heartwatch-eligible patients.",
      },
      {
        step: 3,
        title: "Schedule Heartwatch annual reviews",
        detail:
          "Heartwatch reviews require a structured assessment including BP, cholesterol, BMI, smoking status, medication review, and lifestyle counselling. Use the approved template.",
      },
      {
        step: 4,
        title: "Submit claims via GP Suite",
        detail:
          "Heartwatch claims are submitted as STCs through PCRS Online. Navigate to Claims → New STC and use the Heartwatch item code.",
        link: { label: "Open PCRS Online →", url: "https://www.sspcrs.ie/portal/nmco-api/login" },
      },
      {
        step: 5,
        title: "Aim for 85%+ review rate",
        detail:
          "Target at least 85% of eligible patients reviewed annually. Track progress quarterly. Expected recovery: approximately €8,500/year for a mid-size practice.",
      },
    ],
  },
  {
    id: "4",
    severity: "medium",
    status: "not-started",
    title: "34% of claims missing clinician ID — limits analysis accuracy",
    shortTitle: "Missing Clinician IDs",
    description:
      "478 of 1,406 claims lack a clinician identifier. This prevents per-GP analysis and may cause issues during PCRS audits.",
    impact: null,
    category: "Data Quality",
    estimatedTime: "15 mins",
    playbook: [
      {
        step: 1,
        title: "Open practice management export settings",
        detail:
          "In your practice management system, navigate to Settings → PCRS Export (or equivalent). Find the field mapping configuration for data exports.",
      },
      {
        step: 2,
        title: "Enable clinician identifier field",
        detail:
          "Ensure the 'Practitioner' or 'Clinician ID' field is ticked/included in all PCRS data exports. This is usually the GP's Medical Council number or PCRS practitioner number.",
      },
      {
        step: 3,
        title: "Re-export and verify",
        detail:
          "Generate a fresh export with the corrected settings. Open it in Excel to spot-check that the clinician ID column is populated. Then re-upload to the Claims Intelligence Platform.",
      },
    ],
  },
  {
    id: "5",
    severity: "medium",
    status: "not-started",
    title: "Low Special Items of Service claims — €3,400 potential",
    shortTitle: "SIS Under-claiming",
    description:
      "Only 7 SIS claims — well below median for a 3-GP practice. Common missed items include suturing, I&D, ECGs, and spirometry.",
    impact: 3400,
    category: "Revenue Recovery",
    estimatedTime: "30 mins + ongoing",
    playbook: [
      {
        step: 1,
        title: "Review SIS eligible procedures",
        detail:
          "Check the PCRS Doctors Handbook for the complete list of Special Items of Service and their fee codes. Focus on procedures your practice regularly performs.",
        link: { label: "Doctors Handbook (PDF) →", url: "https://assets.hse.ie/media/documents/PCRS_handbook_for_Doctors.pdf" },
      },
      {
        step: 2,
        title: "Audit last 3 months of procedures",
        detail:
          "Review consultations involving minor surgery, suturing, excisions, ECGs, spirometry, and other procedural work. Cross-reference against SIS claim submissions.",
      },
      {
        step: 3,
        title: "Submit retrospective claims",
        detail:
          "SIS claims can be submitted retrospectively within the allowed window (usually 1 month). Submit via GP Suite for any eligible procedures that were missed.",
        link: { label: "Open PCRS Online →", url: "https://www.sspcrs.ie/portal/nmco-api/login" },
      },
      {
        step: 4,
        title: "Add SIS claiming to your daily workflow",
        detail:
          "After each eligible procedure, the treating GP should immediately log the SIS claim in GP Suite. Consider adding a prompt/checklist to your post-consultation workflow.",
      },
    ],
  },
];

// ── Helper: format currency ───────────────────────────────────────
function euro(n: number) {
  return `€${n.toLocaleString()}`;
}

// ── Stepper View Component ────────────────────────────────────────
function StepperView({
  action,
  completedSteps,
  currentStep,
  onStepClick,
  onCompleteStep,
  onBack,
  actionStatus,
  onAdvanceStatus,
}: {
  action: ActionItem;
  completedSteps: Set<number>;
  currentStep: number;
  onStepClick: (step: number) => void;
  onCompleteStep: () => void;
  onBack: () => void;
  actionStatus: ActionStatus;
  onAdvanceStatus: () => void;
}) {
  const step = action.playbook[currentStep];
  const allComplete = completedSteps.size === action.playbook.length;
  const isLastStep = currentStep === action.playbook.length - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar — breadcrumb + back */}
      <div className="flex items-center gap-3 border-b pb-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Actions
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium truncate">{action.shortTitle}</span>
        <div className="ml-auto flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${trafficLight[actionStatus].dot}`} />
          <span className="text-xs font-medium">{trafficLight[actionStatus].label}</span>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left rail — step navigator */}
        <div className="w-64 shrink-0 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Steps
          </p>
          {action.playbook.map((s, i) => {
            const isActive = i === currentStep;
            const isDone = completedSteps.has(i);
            return (
              <button
                key={i}
                onClick={() => onStepClick(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                {/* Step indicator */}
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isDone
                      ? "bg-green-100 text-green-700"
                      : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.step
                  )}
                </span>
                <span className="truncate">{s.title}</span>
              </button>
            );
          })}

          {/* Quick links sidebar */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Quick Links
            </p>
            {quickLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded px-3 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
              >
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Main content — current step */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1">
            {/* Step header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span>Step {step.step} of {action.playbook.length}</span>
                <span>•</span>
                <span>{action.category}</span>
                {action.impact && (
                  <>
                    <span>•</span>
                    <span className="text-green-700 font-medium">{euro(action.impact)} at stake</span>
                  </>
                )}
              </div>
              <h2 className="text-xl font-bold">{step.title}</h2>
            </div>

            {/* Step content */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <p className="text-sm leading-relaxed">{step.detail}</p>

              {step.link && (
                <a
                  href={step.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  {step.link.label}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {/* Contextual help prompt */}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5">
              <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-xs text-muted-foreground">
                Need help with this step? Click the <strong>AI Assistant</strong> button (bottom right) to ask questions about PCRS processes.
              </p>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="flex items-center justify-between border-t pt-4 mt-6">
            <button
              onClick={() => currentStep > 0 && onStepClick(currentStep - 1)}
              disabled={currentStep === 0}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-3">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {action.playbook.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === currentStep
                        ? "w-6 bg-primary"
                        : completedSteps.has(i)
                          ? "w-2 bg-green-500"
                          : "w-2 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            {allComplete && isLastStep ? (
              <button
                onClick={onAdvanceStatus}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {actionStatus === "not-started"
                  ? "Mark In Progress"
                  : actionStatus === "in-progress"
                    ? "Mark Submitted"
                    : actionStatus === "submitted"
                      ? "Confirm Recovery"
                      : "Completed"}
              </button>
            ) : (
              <button
                onClick={onCompleteStep}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {completedSteps.has(currentStep) ? "Next Step" : "Complete & Continue"}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pipeline Card Component ───────────────────────────────────────
function PipelineCard({
  action,
  status,
  completedStepCount,
  onClick,
}: {
  action: ActionItem;
  status: ActionStatus;
  completedStepCount: number;
  onClick: () => void;
}) {
  const tl = trafficLight[status];
  const progress = Math.round((completedStepCount / action.playbook.length) * 100);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border bg-card p-4 hover:ring-2 hover:ring-primary/20 transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Traffic light dot */}
        <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${tl.dot} ring-2 ring-offset-2 ring-offset-background ${
          status === "not-started" ? "ring-red-200" : status === "in-progress" ? "ring-amber-200" : status === "submitted" ? "ring-blue-200" : "ring-green-200"
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={severityStyles[action.severity]}>
              {action.severity}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{action.estimatedTime}</span>
          </div>
          <h3 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
            {action.shortTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {action.description}
          </p>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  status === "confirmed" ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${status === "confirmed" ? 100 : progress}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {completedStepCount}/{action.playbook.length} steps
            </span>
          </div>
        </div>

        {/* Impact amount */}
        <div className="shrink-0 text-right">
          {action.impact ? (
            <span className="text-sm font-bold text-green-700">{euro(action.impact)}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Quality</span>
          )}
          <div className="mt-2">
            <svg className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Main Page Component ───────────────────────────────────────────
export default function PreviewActionsPage() {
  // State: which action is open in the stepper (null = pipeline view)
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [currentSteps, setCurrentSteps] = useState<Record<string, number>>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>(
    Object.fromEntries(initialActions.map((a) => [a.id, a.status]))
  );

  const activeAction = initialActions.find((a) => a.id === activeActionId);
  const totalImpact = initialActions.reduce((sum, a) => sum + (a.impact ?? 0), 0);
  const confirmedImpact = initialActions
    .filter((a) => statuses[a.id] === "confirmed" && a.impact)
    .reduce((sum, a) => sum + (a.impact ?? 0), 0);
  const statusCounts = {
    "not-started": initialActions.filter((a) => statuses[a.id] === "not-started").length,
    "in-progress": initialActions.filter((a) => statuses[a.id] === "in-progress").length,
    submitted: initialActions.filter((a) => statuses[a.id] === "submitted").length,
    confirmed: initialActions.filter((a) => statuses[a.id] === "confirmed").length,
  };

  function getCompletedSet(id: string): Set<number> {
    return completedSteps[id] ?? new Set();
  }

  function handleCompleteStep(actionId: string) {
    const step = currentSteps[actionId] ?? 0;
    const action = initialActions.find((a) => a.id === actionId)!;
    const newSet = new Set(getCompletedSet(actionId));
    newSet.add(step);
    setCompletedSteps((prev) => ({ ...prev, [actionId]: newSet }));

    // Auto-advance to next incomplete step
    if (step < action.playbook.length - 1) {
      setCurrentSteps((prev) => ({ ...prev, [actionId]: step + 1 }));
    }

    // Auto-set status to in-progress on first step completion
    if (statuses[actionId] === "not-started") {
      setStatuses((prev) => ({ ...prev, [actionId]: "in-progress" }));
    }
  }

  function handleAdvanceStatus(actionId: string) {
    const flow: ActionStatus[] = ["not-started", "in-progress", "submitted", "confirmed"];
    const current = statuses[actionId];
    const idx = flow.indexOf(current);
    if (idx < flow.length - 1) {
      setStatuses((prev) => ({ ...prev, [actionId]: flow[idx + 1] }));
    }
  }

  // ── Stepper View ──
  if (activeAction) {
    return (
      <div className="h-full flex flex-col">
        <StepperView
          action={activeAction}
          completedSteps={getCompletedSet(activeAction.id)}
          currentStep={currentSteps[activeAction.id] ?? 0}
          onStepClick={(step) =>
            setCurrentSteps((prev) => ({ ...prev, [activeAction.id]: step }))
          }
          onCompleteStep={() => handleCompleteStep(activeAction.id)}
          onBack={() => setActiveActionId(null)}
          actionStatus={statuses[activeAction.id]}
          onAdvanceStatus={() => handleAdvanceStatus(activeAction.id)}
        />
        <AIAssistant />
      </div>
    );
  }

  // ── Pipeline View (default) ──
  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recovery Centre</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Step-by-step guided workflows to recover revenue and prevent clawbacks
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-700">{euro(totalImpact)}</p>
            <p className="text-xs text-muted-foreground">potential recovery identified</p>
            {confirmedImpact > 0 && (
              <p className="text-sm font-medium text-green-600 mt-1">
                {euro(confirmedImpact)} confirmed
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Traffic light summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.entries(trafficLight) as [ActionStatus, typeof trafficLight[ActionStatus]][]).map(
          ([status, config]) => (
            <Card key={status} className={`${statusCounts[status] > 0 ? config.bg : ""} border`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${config.dot}`} />
                  <span className="text-xs font-medium">{config.label}</span>
                </div>
                <p className="text-2xl font-bold mt-1">{statusCounts[status]}</p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* How it works */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6 justify-center flex-wrap">
            {[
              { icon: "🔍", label: "Review Finding", sub: "Understand the issue" },
              { icon: "📋", label: "Follow Playbook", sub: "Step-by-step guide" },
              { icon: "📤", label: "Submit to PCRS", sub: "Via GP Suite or PMS" },
              { icon: "✅", label: "Confirm Recovery", sub: "Verify on schedule" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {i > 0 && (
                  <svg className="h-4 w-4 text-muted-foreground/40 -ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <div className="text-center">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-xs font-medium mt-1">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action pipeline cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Your Actions</h2>
          <p className="text-xs text-muted-foreground">
            Click any action to start the guided workflow
          </p>
        </div>
        <div className="space-y-3">
          {initialActions.map((action) => (
            <PipelineCard
              key={action.id}
              action={action}
              status={statuses[action.id]}
              completedStepCount={getCompletedSet(action.id).size}
              onClick={() => setActiveActionId(action.id)}
            />
          ))}
        </div>
      </div>

      {/* PCRS Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">PCRS Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Contact PCRS
              </p>
              <div className="flex items-center gap-2 text-sm">
                <span>📞</span> <span className="font-medium">01 864 7100</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>📧</span> <span className="font-medium">pcrs@hse.ie</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span>📍</span> <span className="text-muted-foreground">Exit 5 M50, North Road, Finglas, Dublin 11</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Key Resources
              </p>
              {quickLinks.slice(0, 4).map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant floating button */}
      <AIAssistant />
    </div>
  );
}
