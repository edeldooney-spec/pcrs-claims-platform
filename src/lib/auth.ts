import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { practices } from "@/db/schema";
import { eq } from "drizzle-orm";

// Get the current user's practice, enforcing data isolation
// Every authenticated request must go through this to get the practice context
export async function getCurrentPractice() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const practice = await db
    .select()
    .from(practices)
    .where(eq(practices.ownerClerkUserId, userId))
    .limit(1);

  return practice[0] ?? null;
}

// Guard: require authenticated user with a practice
export async function requirePractice() {
  const practice = await getCurrentPractice();
  if (!practice) {
    throw new Error("Unauthorized: no practice found for this user");
  }
  return practice;
}
