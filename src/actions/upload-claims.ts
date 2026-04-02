"use server";

import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { db } from "@/db";
import { uploads } from "@/db/schema";
import { getCurrentPractice } from "@/lib/auth";
import type { ActionResult } from "@/types";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const VALID_EXTENSIONS = [".csv", ".xls", ".xlsx"];

export async function uploadClaimsFile(
  formData: FormData
): Promise<ActionResult<{ uploadId: string }>> {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const practice = await getCurrentPractice();
  if (!practice) {
    return { success: false, error: "No practice found for this user" };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file provided" };
  }

  // Validate file extension
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  if (!VALID_EXTENSIONS.includes(ext)) {
    return {
      success: false,
      error: "Invalid file type. Please upload CSV or Excel files.",
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "File too large. Maximum 50MB." };
  }

  try {
    // Upload to Vercel Blob with practice-scoped path
    // UUID prefix ensures no path collisions between practices
    const blobPath = `uploads/${practice.id}/${crypto.randomUUID()}/${file.name}`;
    const blob = await put(blobPath, file, {
      access: "public",
    });

    // Create upload record in DB
    const [upload] = await db
      .insert(uploads)
      .values({
        practiceId: practice.id,
        blobUrl: blob.url,
        originalFilename: file.name,
        status: "uploaded",
        uploadedByClerkUserId: userId,
      })
      .returning();

    // TODO: Trigger background processing job here
    // e.g. await triggerAnalysisPipeline(upload.id)

    return { success: true, data: { uploadId: upload.id } };
  } catch (error) {
    console.error("Failed to upload claims file:", error);
    return { success: false, error: "Upload failed. Please try again." };
  }
}
