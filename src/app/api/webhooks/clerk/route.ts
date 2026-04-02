import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/db";
import { practices } from "@/db/schema";

// Clerk sends webhooks when users are created, updated, or deleted
// We auto-create a practice record for new users
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Verify the webhook signature
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: { type: string; data: Record<string, unknown> };

  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Handle user.created — auto-create a practice for the new user
  if (event.type === "user.created") {
    const userId = event.data.id as string;
    const firstName = (event.data.first_name as string) ?? "";
    const lastName = (event.data.last_name as string) ?? "";

    try {
      await db.insert(practices).values({
        name: `${firstName} ${lastName}'s Practice`.trim(),
        ownerClerkUserId: userId,
      });
    } catch (error) {
      console.error("Failed to create practice for new user:", error);
    }
  }

  return NextResponse.json({ received: true });
}
