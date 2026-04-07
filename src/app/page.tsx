import { redirect } from "next/navigation";

export default function HomePage() {
  // When Clerk is configured, this would check auth and redirect accordingly
  // For now, redirect to preview
  const hasClerkKeys = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (hasClerkKeys) {
    // Dynamic import path — Clerk auth check happens here
    redirect("/dashboard");
  }

  redirect("/preview");
}
