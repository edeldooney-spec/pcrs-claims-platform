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
  deadline?: string;
  affectedGPs: string;
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

// ── Quick links ───────────────────────────────────────────────────
const quickLinks = [
  { label: "PCRS Online (GP Suite)", url: "https://www.sspcrs.ie/portal/nmco-api/login" },
  { label: "GP Circulars", url: "https://www.hse.ie/eng/staff/pcrs/circulars/gp/" },
  { label: "Doctors Handbook (PDF)", url: "https://assets.hse.ie/media/documents/PCRS_handbook_for_Doctors.pdf" },
  { label: "CDM Programme", url: "https://www.hse.ie/eng/about/who/gmscontracts/2019agreement/chronic-disease-management-programme/" },
  { label: "Contact PCRS", url: "https://www.hse.ie/eng/staff/pcrs/contact-pcrs/" },
];

// ── Actions from Asumpta's real PCRS analysis ─────────────────────
const initialActions: ActionItem[] = [
  {
    id: "mi",
    severity: "critical",
    status: "not-started",
    title: "Medical Indemnity Refund — €28,002 unclaimed across all 3 GPs",
    shortTitle: "Medical Indemnity Refund",
    description:
      "No medical indemnity refund submitted in 36 months. Dr A qualifies for 75% band (€9,546), Dr B for 50% band (€6,364), Dr C for the highest 95% tier (€12,092). Annual cover letter + renewed certificate must be submitted to CHO.",
    impact: 28002,
    category: "Immediate — within 30 days",
    estimatedTime: "1 hour per GP",
    deadline: "Submit immediately for current year; backdated claims may be possible",
    affectedGPs: "Dr A, Dr B, Dr C",
    playbook: [
      {
        step: 1,
        title: "Gather indemnity certificates for all 3 GPs",
        detail:
          "Each GP needs their current medical indemnity certificate from their insurer (MPS, MDDUS, or Medisec). Check that renewal dates are current.",
      },
      {
        step: 2,
        title: "Determine each GP's refund band",
        detail:
          "Refund percentage is based on GMS panel size:\n• Dr A: Panel 1,022–1,099 → 75% refund (~€3,182/year)\n• Dr B: Panel 913–972 → 50% refund (~€2,121/year)\n• Dr C: Panel 1,204–1,257 → 95% refund (~€4,031/year)",
      },
      {
        step: 3,
        title: "Write cover letter for each GP",
        detail:
          "Each GP must submit a cover letter to their CHO (Kerry) requesting the medical indemnity refund. The letter should reference the GP's PCRS number, panel size, and the applicable refund band.",
      },
      {
        step: 4,
        title: "Submit to CHO Kerry",
        detail:
          "Post or deliver the cover letter + copy of renewed indemnity certificate to CHO Kerry. Request confirmation of receipt and processing timeline.",
        link: { label: "Contact PCRS →", url: "https://www.hse.ie/eng/staff/pcrs/contact-pcrs/" },
      },
      {
        step: 5,
        title: "Enquire about backdated claims",
        detail:
          "Contact PCRS (01 864 7100) to ask whether backdated claims for 2023 and 2024 can still be processed. The total backdated amount is ~€28,002 across 3 GPs over 3 years.",
      },
      {
        step: 6,
        title: "Set up annual renewal reminder",
        detail:
          "Add a recurring calendar entry for each GP: 'Submit M&I refund to CHO' aligned with their indemnity renewal date. This prevents the gap recurring. Combined annual value going forward: ~€9,334/year.",
      },
    ],
  },
  {
    id: "pg",
    severity: "critical",
    status: "not-started",
    title: "Apply for €45,000 Practice Support Grant (€15,000 × 3 GPs)",
    shortTitle: "€45,000 Practice Grant",
    description:
      "Under the 2023 revised GP Agreement, each GP with weighted panel 500+ is entitled to €15,000 for additional staff. Secretary (hired Dec 2023) received €0 subsidy in 14 months — strongest case. Nurse (hired Aug 2025) provides current active case.",
    impact: 45000,
    category: "Immediate — within 30 days",
    estimatedTime: "2–3 hours",
    deadline: "Apply immediately — grant designed for exactly this situation",
    affectedGPs: "Practice-wide (3 qualifying GPs)",
    playbook: [
      {
        step: 1,
        title: "Confirm eligibility: 3 GPs with weighted panel 500+",
        detail:
          "All three GPs qualify:\n• Dr A: Weighted panel 1,431 ✓\n• Dr B: Weighted panel 1,217 ✓\n• Dr C: Weighted panel 1,720 ✓\nTotal grant entitlement: 3 × €15,000 = €45,000",
      },
      {
        step: 2,
        title: "Prepare the Secretary case (strongest evidence)",
        detail:
          "Secretary was hired December 2023 (post July 2023 eligibility date). She received exactly €0.00 in subsidy EVERY MONTH across ALL THREE GPs for her entire 14-month employment. Her 38 hours were entirely outside the 145.6-hour subsidised entitlement. This is compelling evidence — not a reduced subsidy, but literally zero.",
      },
      {
        step: 3,
        title: "Prepare the Nurse case",
        detail:
          "Nurse was hired August 2025 (post July 2023). Currently receiving subsidy (€452–€647/month per GP) but her 16 hours contribute to the practice operating well above its 145.6-hour entitlement. Grant should have been applied at point of hiring.",
      },
      {
        step: 4,
        title: "Calculate the subsidy gap",
        detail:
          "Practice employs 250 hours/week against subsidised entitlement of 145.6 hours. That's 104.4 hours (42%) falling outside the subsidy. Use this figure in the application to demonstrate the gap the grant is designed to fill.",
      },
      {
        step: 5,
        title: "Contact PCRS/CHO to submit application",
        detail:
          "Call PCRS (01 864 7100) and CHO Kerry to establish the application process for the €15,000 grant. Reference the 2023 revised GP Agreement and cite both staff cases. Ask specifically whether the backdating restriction applies given Secretary received zero subsidy.",
        link: { label: "Contact PCRS →", url: "https://www.hse.ie/eng/staff/pcrs/contact-pcrs/" },
      },
      {
        step: 6,
        title: "Follow up and track application",
        detail:
          "Request written confirmation of application receipt. Set a 2-week follow-up reminder. If the Secretary has been replaced, the grant should apply to the replacement. Document all correspondence.",
      },
    ],
  },
  {
    id: "lv",
    severity: "high",
    status: "not-started",
    title: "Claim all outstanding study leave — €12,624 across practice",
    shortTitle: "Study Leave Claims",
    description:
      "Dr A: 11/30 days claimed (€3,945 gap). Dr B: 5/30 days claimed (€3,945 gap). Dr C: 6/30 days claimed (€4,734 gap). Current leave year must be claimed before 31 March deadline.",
    impact: 12624,
    category: "Immediate — within 30 days",
    estimatedTime: "30 mins per GP",
    deadline: "31 March (current leave year deadline)",
    affectedGPs: "Dr A, Dr B, Dr C",
    playbook: [
      {
        step: 1,
        title: "Check current leave year balance for each GP",
        detail:
          "Each GP is entitled to 10 study leave days per year at €197.24/day. Check PCRS statements to confirm how many days have been claimed in the current leave year (1 April – 31 March).",
      },
      {
        step: 2,
        title: "Gather evidence of study/CPD activities",
        detail:
          "Study leave claims require evidence of CPD activities: conferences, courses, online learning, exam preparation, etc. Gather certificates, booking confirmations, or CPD logs for each GP.",
      },
      {
        step: 3,
        title: "Submit study leave claims via PCRS",
        detail:
          "Submit leave claims for the full 10-day entitlement for each GP for the current leave year. Combined value: €5,917/year (all 3 GPs × 10 days × €197.24).",
        link: { label: "Open PCRS Online →", url: "https://www.sspcrs.ie/portal/nmco-api/login" },
      },
      {
        step: 4,
        title: "Enquire about backdated study leave",
        detail:
          "Contact PCRS to ask whether unclaimed study leave from previous leave years (2022/23, 2023/24) can still be processed. Potential additional recovery: ~€6,707.",
      },
      {
        step: 5,
        title: "Set up leave tracking system",
        detail:
          "Implement a practice-level leave calendar tracking annual and study leave for all GPs. Set quarterly reminders to review leave balances. This prevents future under-claiming.",
      },
    ],
  },
  {
    id: "al",
    severity: "high",
    status: "not-started",
    title: "Annual leave — 2 GPs have full years unclaimed (€11,440)",
    shortTitle: "Annual Leave Claims",
    description:
      "Dr A: Leave year 2022/23 — 28 days unclaimed (€5,523). Dr C: Leave year 2022/23 — 30 days unclaimed (€5,917). Dr B: 8 days remaining in current year at risk (€1,578).",
    impact: 13018,
    category: "Immediate — within 30 days",
    estimatedTime: "30 mins per GP",
    deadline: "Dr B's 8 days must be claimed before 31 March",
    affectedGPs: "Dr A, Dr B, Dr C",
    playbook: [
      {
        step: 1,
        title: "Submit Dr B's remaining 8 days immediately",
        detail:
          "Dr B has 8 annual leave days remaining in leave year 2024/25. These MUST be claimed before 31 March to avoid expiry. Value at risk: €1,578 (8 × €197.24).",
        link: { label: "Open PCRS Online →", url: "https://www.sspcrs.ie/portal/nmco-api/login" },
      },
      {
        step: 2,
        title: "Investigate backdating for Dr A (28 days, 2022/23)",
        detail:
          "Dr A has an entire leave year (2022/23) with zero annual leave claimed — 28 days at €197.24/day = €5,523. Contact PCRS to determine if this can still be claimed retrospectively.",
      },
      {
        step: 3,
        title: "Investigate backdating for Dr C (30 days, 2022/23)",
        detail:
          "Dr C's leave year 2022/23 shows zero annual leave despite a 30-day entitlement (panel 1,200+). The Sep 2022 claim was processed at 0 days/€0. Value: €5,917. Ask PCRS about the claim processing error.",
      },
      {
        step: 4,
        title: "Ensure current year leave is fully claimed",
        detail:
          "Verify that all three GPs have their full annual leave entitlement claimed for the current leave year:\n• Dr A: 28 days (panel 1,000+)\n• Dr B: 25 days (panel 913–972)\n• Dr C: 30 days (panel 1,200+)",
      },
      {
        step: 5,
        title: "Add leave tracking to practice calendar",
        detail:
          "Create a shared leave tracker showing each GP's entitlement, days claimed, and balance. Set quarterly review points and a 60-day warning before each leave year ends (31 March).",
      },
    ],
  },
  {
    id: "ac",
    severity: "high",
    status: "not-started",
    title: "Under-6 Asthma Cycle of Care — 409 children, 1 registration",
    shortTitle: "Asthma Cycle of Care",
    description:
      "Combined Under-6 panel of 409 children but only 1 registration in 36 months (Dr B, Apr 2023). Registration fee €50 per child plus ongoing monthly capitation €3.75–€11.25. Dr A and Dr C have zero registrations.",
    impact: null,
    category: "Short-term — within 90 days",
    estimatedTime: "2–4 weeks (ongoing)",
    affectedGPs: "Dr A (124–188 U6), Dr B (184–208 U6), Dr C (101–118 U6)",
    playbook: [
      {
        step: 1,
        title: "Run Under-6 patient report with asthma diagnoses",
        detail:
          "In your practice management system, filter patients aged 0–5 with asthma diagnoses, recurrent wheeze, or prescribed asthma medications (salbutamol, etc.). This identifies the immediately eligible cohort.",
      },
      {
        step: 2,
        title: "Review Asthma Cycle of Care requirements",
        detail:
          "Each registration requires a structured asthma review. Check PCRS guidelines for the assessment template, required data points, and registration process.",
        link: { label: "GP Circulars →", url: "https://www.hse.ie/eng/staff/pcrs/circulars/gp/" },
      },
      {
        step: 3,
        title: "Register eligible patients via PCRS portal",
        detail:
          "Register each eligible child via the PCRS online portal. Each registration generates a €50 registration fee. Ongoing capitation of €3.75–€11.25/month then applies automatically.",
        link: { label: "Open PCRS Online →", url: "https://www.sspcrs.ie/portal/nmco-api/login" },
      },
      {
        step: 4,
        title: "Schedule structured Asthma CoC reviews",
        detail:
          "Schedule dedicated clinics for Under-6 asthma reviews. Use the approved template. Each GP should work through their eligible list systematically over 4–8 weeks.",
      },
      {
        step: 5,
        title: "Monitor registrations and capitation payments",
        detail:
          "Check PCRS statements monthly to verify registration fees and ongoing capitation are being paid. Target: register all diagnosed asthmatic children within 3 months.",
      },
    ],
  },
  {
    id: "pp",
    severity: "medium",
    status: "not-started",
    title: "CDM Prevention Programme under-utilised — 85 vs 350+ eligible",
    shortTitle: "Prevention Programme",
    description:
      "Only 85 PP consultations in 2025 across practice vs 350+ patients aged 65+ who are eligible. €82 + superannuation per consultation. CDM Treatment is active and growing but Prevention Programme lags significantly.",
    impact: null,
    category: "Short-term — within 90 days",
    estimatedTime: "Ongoing programme",
    affectedGPs: "Dr A (21 PP), Dr B (26 PP), Dr C (38 PP)",
    playbook: [
      {
        step: 1,
        title: "Identify eligible patients aged 65+",
        detail:
          "Run a report of GMS patients aged 65+ who have had an OCF (Opportunistic Case Finding) assessment. Those identified as at-risk should be referred to the Prevention Programme.",
      },
      {
        step: 2,
        title: "Review Prevention Programme requirements",
        detail:
          "PP consultations require a structured assessment following OCF. Review the CDM programme guide for current PP requirements and templates.",
        link: { label: "CDM Programme Guide →", url: "https://www.hse.ie/eng/about/who/gmscontracts/2019agreement/chronic-disease-management-programme/" },
      },
      {
        step: 3,
        title: "Set up systematic PP scheduling",
        detail:
          "Following each OCF assessment that identifies risk, automatically schedule a PP follow-up. Target: double PP consultations from 85 to 170+ within 12 months.",
      },
      {
        step: 4,
        title: "Submit PP data returns quarterly",
        detail:
          "PP consultations are captured via practice management software data returns (same as CDM Treatment). Ensure returns are submitted each quarter with PP activity included.",
      },
    ],
  },
  {
    id: "mi-online",
    severity: "medium",
    status: "not-started",
    title: "Transition M&I claiming from paper to online",
    shortTitle: "M&I Online Migration",
    description:
      "All three GPs still using paper-based M&I (Maternity & Infant) claiming. Online submission via GP Suite would reduce processing delays and improve cash flow.",
    impact: null,
    category: "Short-term — within 90 days",
    estimatedTime: "2 hours setup",
    affectedGPs: "Dr A, Dr B, Dr C",
    playbook: [
      {
        step: 1,
        title: "Log in to GP Suite and check M&I online access",
        detail:
          "Verify that your GP Suite account has access to the online M&I claiming module. If not available, contact PCRS to request activation.",
        link: { label: "Open PCRS Online →", url: "https://www.sspcrs.ie/portal/nmco-api/login" },
      },
      {
        step: 2,
        title: "Submit next M&I claims online",
        detail:
          "For the next M&I claim cycle, submit through GP Suite instead of paper. Verify the process works and that payments are processed faster.",
      },
      {
        step: 3,
        title: "Discontinue paper submissions",
        detail:
          "Once online claims are confirmed working, stop paper-based submissions. Online claims typically process 2–4 weeks faster than paper.",
      },
    ],
  },
  {
    id: "qr",
    severity: "low",
    status: "not-started",
    title: "Implement quarterly PCRS statement review process",
    shortTitle: "Quarterly Reviews",
    description:
      "No systematic review process exists. Implementing quarterly reviews against entitlements would have caught these gaps years earlier. Estimated 30 minutes per quarter per GP.",
    impact: null,
    category: "Ongoing monitoring",
    estimatedTime: "30 mins/quarter/GP",
    affectedGPs: "Practice-wide",
    playbook: [
      {
        step: 1,
        title: "Create an entitlements checklist",
        detail:
          "Document each GP's entitlements: capitation band, M&I refund band, leave entitlements (annual + study), CDM activity targets, Asthma CoC registrations, and any other programme participation.",
      },
      {
        step: 2,
        title: "Schedule quarterly review meetings",
        detail:
          "Block 30 minutes each quarter for each GP's statement review. Compare actual payments against entitlements checklist. Flag any gaps immediately.",
      },
      {
        step: 3,
        title: "Set up alerts for common gaps",
        detail:
          "Create calendar reminders for key deadlines: leave year end (31 March), M&I certificate renewal, CDM data return deadlines, and subsidy review triggers when new staff are hired.",
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────
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
      {/* Top bar */}
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

      {/* Action metadata */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <span className="rounded bg-muted px-2 py-1">
          <strong>GPs:</strong> {action.affectedGPs}
        </span>
        <span className="rounded bg-muted px-2 py-1">
          <strong>Time:</strong> {action.estimatedTime}
        </span>
        {action.deadline && (
          <span className="rounded bg-red-50 text-red-700 border border-red-200 px-2 py-1">
            <strong>⏰ Deadline:</strong> {action.deadline}
          </span>
        )}
        {action.impact && (
          <span className="rounded bg-green-50 text-green-700 border border-green-200 px-2 py-1">
            <strong>Value:</strong> {euro(action.impact)}
          </span>
        )}
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left rail */}
        <div className="w-64 shrink-0 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Steps</p>
          {action.playbook.map((s, i) => {
            const isActive = i === currentStep;
            const isDone = completedSteps.has(i);
            return (
              <button
                key={i}
                onClick={() => onStepClick(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isDone ? "bg-green-100 text-green-700" : isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {isDone ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.step}
                </span>
                <span className="truncate">{s.title}</span>
              </button>
            );
          })}

          {/* Quick links */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Quick Links</p>
            {quickLinks.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded px-3 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <span>Step {step.step} of {action.playbook.length}</span>
                <span>•</span>
                <span>{action.category}</span>
              </div>
              <h2 className="text-xl font-bold">{step.title}</h2>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-4">
              <p className="text-sm leading-relaxed whitespace-pre-line">{step.detail}</p>
              {step.link && (
                <a href={step.link.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors">
                  {step.link.label}
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2.5">
              <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-xs text-muted-foreground">
                Need help? Click the <strong>AI Assistant</strong> (bottom right) to ask about PCRS processes, contacts, or claim requirements.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
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

            <div className="flex items-center gap-1.5">
              {action.playbook.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all ${
                  i === currentStep ? "w-6 bg-primary" : completedSteps.has(i) ? "w-2 bg-green-500" : "w-2 bg-muted-foreground/30"
                }`} />
              ))}
            </div>

            {allComplete && isLastStep ? (
              <button onClick={onAdvanceStatus}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {actionStatus === "not-started" ? "Mark In Progress" : actionStatus === "in-progress" ? "Mark Submitted" : actionStatus === "submitted" ? "Confirm Recovery" : "Completed"}
              </button>
            ) : (
              <button onClick={onCompleteStep}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
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

// ── Pipeline Card ─────────────────────────────────────────────────
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
    <button onClick={onClick}
      className="w-full text-left rounded-xl border bg-card p-4 hover:ring-2 hover:ring-primary/20 transition-all group">
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${tl.dot} ring-2 ring-offset-2 ring-offset-background ${
          status === "not-started" ? "ring-red-200" : status === "in-progress" ? "ring-amber-200" : status === "submitted" ? "ring-blue-200" : "ring-green-200"
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline" className={severityStyles[action.severity]}>{action.severity}</Badge>
            <span className="text-[10px] text-muted-foreground">{action.estimatedTime}</span>
            {action.deadline && (
              <span className="text-[10px] text-red-600 font-medium">⏰ {action.deadline.split('—')[0].trim()}</span>
            )}
          </div>
          <h3 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">{action.shortTitle}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{action.affectedGPs}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{action.description}</p>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${
                status === "confirmed" ? "bg-green-500" : "bg-primary"
              }`} style={{ width: `${status === "confirmed" ? 100 : progress}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {completedStepCount}/{action.playbook.length} steps
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          {action.impact ? (
            <span className="text-sm font-bold text-green-700">{euro(action.impact)}</span>
          ) : (
            <span className="text-xs text-muted-foreground italic">Ongoing value</span>
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

// ── Main Page ─────────────────────────────────────────────────────
export default function PreviewActionsPage() {
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
    if (step < action.playbook.length - 1) {
      setCurrentSteps((prev) => ({ ...prev, [actionId]: step + 1 }));
    }
    if (statuses[actionId] === "not-started") {
      setStatuses((prev) => ({ ...prev, [actionId]: "in-progress" }));
    }
  }

  function handleAdvanceStatus(actionId: string) {
    const flow: ActionStatus[] = ["not-started", "in-progress", "submitted", "confirmed"];
    const idx = flow.indexOf(statuses[actionId]);
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
          onStepClick={(step) => setCurrentSteps((prev) => ({ ...prev, [activeAction.id]: step }))}
          onCompleteStep={() => handleCompleteStep(activeAction.id)}
          onBack={() => setActiveActionId(null)}
          actionStatus={statuses[activeAction.id]}
          onAdvanceStatus={() => handleAdvanceStatus(activeAction.id)}
        />
        <AIAssistant />
      </div>
    );
  }

  // ── Pipeline View ──
  // Group actions by category for visual separation
  const immediateActions = initialActions.filter((a) => a.category.startsWith("Immediate"));
  const shortTermActions = initialActions.filter((a) => a.category.startsWith("Short-term"));
  const ongoingActions = initialActions.filter((a) => a.category.startsWith("Ongoing"));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recovery Centre</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Guided workflows to recover every euro your practice is entitled to
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-700">{euro(totalImpact)}</p>
            <p className="text-xs text-muted-foreground">quantifiable recovery identified</p>
            {confirmedImpact > 0 && (
              <p className="text-sm font-medium text-green-600 mt-1">{euro(confirmedImpact)} confirmed</p>
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
              { icon: "🔍", label: "Review Finding", sub: "Understand the gap" },
              { icon: "📋", label: "Follow Playbook", sub: "Step-by-step guide" },
              { icon: "📤", label: "Submit to PCRS/CHO", sub: "Forms & contacts" },
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

      {/* Immediate Actions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <h2 className="text-lg font-semibold">Immediate Actions</h2>
          <span className="text-xs text-muted-foreground">— within 30 days</span>
        </div>
        <div className="space-y-3">
          {immediateActions.map((action) => (
            <PipelineCard key={action.id} action={action} status={statuses[action.id]}
              completedStepCount={getCompletedSet(action.id).size}
              onClick={() => setActiveActionId(action.id)} />
          ))}
        </div>
      </div>

      {/* Short-Term Actions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <h2 className="text-lg font-semibold">Short-Term Actions</h2>
          <span className="text-xs text-muted-foreground">— within 90 days</span>
        </div>
        <div className="space-y-3">
          {shortTermActions.map((action) => (
            <PipelineCard key={action.id} action={action} status={statuses[action.id]}
              completedStepCount={getCompletedSet(action.id).size}
              onClick={() => setActiveActionId(action.id)} />
          ))}
        </div>
      </div>

      {/* Ongoing */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="h-3 w-3 rounded-full bg-blue-500" />
          <h2 className="text-lg font-semibold">Ongoing Monitoring</h2>
          <span className="text-xs text-muted-foreground">— prevent future gaps</span>
        </div>
        <div className="space-y-3">
          {ongoingActions.map((action) => (
            <PipelineCard key={action.id} action={action} status={statuses[action.id]}
              completedStepCount={getCompletedSet(action.id).size}
              onClick={() => setActiveActionId(action.id)} />
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
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact</p>
              <div className="flex items-center gap-2 text-sm"><span>📞</span> <span className="font-medium">01 864 7100</span></div>
              <div className="flex items-center gap-2 text-sm"><span>📧</span> <span className="font-medium">pcrs@hse.ie</span></div>
              <div className="flex items-start gap-2 text-sm"><span>📍</span> <span className="text-muted-foreground">Exit 5 M50, North Road, Finglas, Dublin 11</span></div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Key Resources</p>
              {quickLinks.slice(0, 4).map((link) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
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

      <AIAssistant />
    </div>
  );
}
