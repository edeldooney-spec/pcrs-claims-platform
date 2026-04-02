"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/db";
import { findings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentPractice } from "@/lib/auth";
import type { ActionResult } from "@/types";

const UpdateStatusSchema = z.object({
  findingId: z.string().uuid(),
  status: z.enum(["open", "in_progress", "resolved", "dismissed"]),
});

export async function updateFindingStatus(
  input: z.infer<typeof UpdateStatusSchema>
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const practice = await getCurrentPractice();
  if (!practice) {
    return { success: false, error: "No practice found" };
  }

  const parsed = UpdateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid input" };
  }

  try {
    // Data isolation: only update if finding belongs to this practice
    const result = await db
      .update(findings)
      .set({
        actionStatus: parsed.data.status,
        resolvedAt:
          parsed.data.status === "resolved" ? new Date() : undefined,
      })
      .where(
        and(
          eq(findings.id, parsed.data.findingId),
          eq(findings.practiceId, practice.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return { success: false, error: "Finding not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update finding status:", error);
    return { success: false, error: "Failed to update status" };
  }
}
