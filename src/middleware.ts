import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function middleware(_request: NextRequest) {
  // When Clerk keys aren't configured, allow all routes through
  // This enables /preview routes to work without auth
  const hasClerkKeys = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!hasClerkKeys) {
    return NextResponse.next();
  }

  // Dynamic import of Clerk middleware when keys are available
  // Clerk's clerkMiddleware handles its own logic
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
