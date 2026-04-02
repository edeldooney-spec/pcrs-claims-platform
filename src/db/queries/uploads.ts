import { db } from "@/db";
import { uploads } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type UploadRow = typeof uploads.$inferSelect;

// Fetch all uploads for a practice
export async function getUploadsForPractice(practiceId: string) {
  const result = await db
    .select()
    .from(uploads)
    .where(eq(uploads.practiceId, practiceId))
    .orderBy(desc(uploads.createdAt));

  return result;
}

// Fetch a single upload by ID (with practice guard)
export async function getUploadById(uploadId: string, practiceId: string) {
  const result = await db
    .select()
    .from(uploads)
    .where(
      eq(uploads.id, uploadId)
    )
    .limit(1);

  const upload = result[0];
  // Data isolation: verify the upload belongs to this practice
  if (!upload || upload.practiceId !== practiceId) {
    return null;
  }

  return upload;
}
