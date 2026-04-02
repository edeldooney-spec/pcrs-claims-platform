import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { RuleFinding } from "@/lib/rules/engine";

// Structured output schema for LLM enrichment
const EnrichmentResponseSchema = z.object({
  narrativeExplanation: z.string(),
  recommendedAction: z.string(),
  confidenceLevel: z.enum(["high", "medium", "low"]),
  adjustedSeverity: z.enum(["critical", "high", "medium", "low"]).optional(),
  additionalContext: z.string().optional(),
});

export type EnrichmentResponse = z.infer<typeof EnrichmentResponseSchema>;

const client = new Anthropic();

// Enrich a rule-engine finding with LLM-generated narrative and recommendations
// Uses structured output with Zod validation for reliability
export async function enrichFinding(
  finding: RuleFinding,
  practiceContext: {
    gpCount: number;
    totalClaims: number;
    dateRange: { start: string; end: string };
  }
): Promise<EnrichmentResponse | null> {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are a PCRS claims analysis expert for Irish GP practices. Analyse this finding and provide actionable guidance.

PRACTICE CONTEXT:
- GPs in practice: ${practiceContext.gpCount}
- Total claims in dataset: ${practiceContext.totalClaims}
- Date range: ${practiceContext.dateRange.start} to ${practiceContext.dateRange.end}

FINDING:
- Rule: ${finding.ruleId} (v${finding.ruleVersion})
- Type: ${finding.type}
- Severity: ${finding.severity}
- Title: ${finding.title}
- Description: ${finding.description}
- Affected claims: ${finding.affectedClaimsCount}
${finding.estimatedImpact ? `- Estimated impact: €${finding.estimatedImpact}` : ""}

Respond with a JSON object containing:
1. "narrativeExplanation": A clear, jargon-free explanation of what this finding means for the practice (2-3 sentences)
2. "recommendedAction": Specific steps the practice should take (2-3 actionable items)
3. "confidenceLevel": Your confidence in this assessment ("high", "medium", or "low")
4. "adjustedSeverity": If you think the severity should be different based on context, specify it (optional)
5. "additionalContext": Any relevant PCRS regulatory context or common patterns (optional)

Respond ONLY with valid JSON, no other text.`,
        },
      ],
    });

    // Extract text from response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.error("No text in LLM response");
      return null;
    }

    // Parse and validate with Zod
    const parsed = JSON.parse(textBlock.text);
    const validated = EnrichmentResponseSchema.safeParse(parsed);

    if (!validated.success) {
      console.error("LLM response failed validation:", validated.error);
      return null;
    }

    return validated.data;
  } catch (error) {
    console.error("LLM enrichment failed:", error);
    // Non-fatal: the finding still exists, just without LLM enrichment
    return null;
  }
}

// Batch enrich multiple findings
// Processes sequentially to respect rate limits
export async function enrichFindings(
  findings: RuleFinding[],
  practiceContext: {
    gpCount: number;
    totalClaims: number;
    dateRange: { start: string; end: string };
  }
): Promise<Map<string, EnrichmentResponse>> {
  const enrichments = new Map<string, EnrichmentResponse>();

  for (const finding of findings) {
    const enrichment = await enrichFinding(finding, practiceContext);
    if (enrichment) {
      enrichments.set(finding.ruleId, enrichment);
    }
  }

  return enrichments;
}
