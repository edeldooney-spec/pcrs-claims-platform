import { db } from "@/db";
import { uploads, findings, healthScores, claimsRecords } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parsePcrsExport } from "@/lib/parser/pcrs-parser";
import { runRulesEngine, aggregateFindingCounts } from "@/lib/rules/engine";
import { rules } from "@/lib/rules/registry";
import { enrichFindings } from "@/lib/llm/enrichment";
import { calculateHealthScore } from "@/lib/health-score";

// The main analysis pipeline — runs after a file is uploaded
// Processes: parse → rules → LLM enrich → score → save
//
// In production this should run in a background job queue (Inngest/Trigger.dev)
// For now it's a sequential function called after upload
export async function runAnalysisPipeline(
  uploadId: string,
  practiceId: string,
  fileContent: string,
  gpCount: number
) {
  try {
    // Step 1: Update status to parsing
    await updateUploadStatus(uploadId, "parsing");

    // Step 2: Parse the CSV/Excel content
    const parseResult = await parsePcrsExport(fileContent);

    // Update upload with record counts
    await db
      .update(uploads)
      .set({
        totalRecords: parseResult.totalRows,
        validRecords: parseResult.valid.length,
        invalidRecords: parseResult.invalid.length,
      })
      .where(eq(uploads.id, uploadId));

    if (parseResult.valid.length === 0) {
      await updateUploadStatus(uploadId, "failed");
      return { success: false, error: "No valid records found in file" };
    }

    // Step 3: Save parsed claims to DB
    const claimRecords = parseResult.valid.map((claim) => ({
      practiceId,
      uploadId,
      claimCode: claim.claimCode,
      claimCategory: claim.claimCategory,
      // date column expects ISO date string (YYYY-MM-DD)
      claimDate: claim.claimDate.toISOString().split("T")[0],
      claimAmount: String(claim.claimAmount),
      clinicianId: claim.clinicianId ?? null,
      patientRef: claim.patientRef ?? null,
    }));

    // Insert in batches of 500 to avoid query size limits
    for (let i = 0; i < claimRecords.length; i += 500) {
      const batch = claimRecords.slice(i, i + 500);
      await db.insert(claimsRecords).values(batch);
    }

    // Step 4: Run rules engine
    await updateUploadStatus(uploadId, "analysing");
    const ruleFindings = runRulesEngine(parseResult.valid, rules);

    // Step 5: LLM enrichment
    await updateUploadStatus(uploadId, "enriching");

    const dates = parseResult.valid.map((c) => c.claimDate);
    const dateRange = {
      start: new Date(Math.min(...dates.map((d) => d.getTime())))
        .toISOString()
        .split("T")[0],
      end: new Date(Math.max(...dates.map((d) => d.getTime())))
        .toISOString()
        .split("T")[0],
    };

    const enrichments = await enrichFindings(ruleFindings, {
      gpCount,
      totalClaims: parseResult.valid.length,
      dateRange,
    });

    // Step 6: Save findings to DB
    const findingRecords = ruleFindings.map((f) => {
      const enrichment = enrichments.get(f.ruleId);
      return {
        practiceId,
        uploadId,
        type: f.type,
        category: f.type,
        severity: enrichment?.adjustedSeverity ?? f.severity,
        title: f.title,
        description: f.description,
        narrativeExplanation: enrichment?.narrativeExplanation ?? null,
        recommendedAction: enrichment?.recommendedAction ?? null,
        estimatedImpact: f.estimatedImpact
          ? String(f.estimatedImpact)
          : null,
        impactDirection: f.impactDirection ?? null,
        ruleId: f.ruleId,
        ruleVersion: f.ruleVersion,
        enrichmentStatus: enrichment ? "completed" : "failed",
        affectedClaimsCount: f.affectedClaimsCount,
        clinicianId: f.clinicianId ?? null,
      };
    });

    if (findingRecords.length > 0) {
      await db.insert(findings).values(findingRecords);
    }

    // Step 7: Calculate and save health score
    const findingCounts = aggregateFindingCounts(ruleFindings);
    const scores = calculateHealthScore(findingCounts);

    // Suppress score if too few claims for meaningful analysis
    const suppressedReason =
      parseResult.valid.length < 50 ? "too_few_claims" : null;

    await db.insert(healthScores).values({
      practiceId,
      uploadId,
      overallScore: scores.overallScore,
      clawbackRiskScore: scores.clawbackRiskScore,
      underclaimingScore: scores.underclaimingScore,
      complianceScore: scores.complianceScore,
      dataQualityScore: scores.dataQualityScore,
      totalFindings: ruleFindings.length,
      criticalFindings: ruleFindings.filter((f) => f.severity === "critical")
        .length,
      highFindings: ruleFindings.filter((f) => f.severity === "high").length,
      suppressedReason,
    });

    // Step 8: Mark complete
    await updateUploadStatus(uploadId, "complete");

    return {
      success: true,
      data: {
        totalRecords: parseResult.totalRows,
        validRecords: parseResult.valid.length,
        findingsCount: ruleFindings.length,
        healthScore: scores.overallScore,
      },
    };
  } catch (error) {
    console.error("Analysis pipeline failed:", error);
    await updateUploadStatus(uploadId, "failed");
    return { success: false, error: "Analysis pipeline failed" };
  }
}

async function updateUploadStatus(
  uploadId: string,
  status: string
) {
  await db
    .update(uploads)
    .set({ status })
    .where(eq(uploads.id, uploadId));
}
