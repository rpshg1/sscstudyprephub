import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser, type SafeUser } from "@/lib/auth";

export function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleZodError(err: unknown) {
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    return NextResponse.json(
      {
        error: firstIssue?.message || "Invalid input provided.",
        issues: err.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }
  return null;
}

export async function requireApiUser(): Promise<
  { user: SafeUser; errorResponse: null } | { user: null; errorResponse: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      errorResponse: jsonError("Authentication required. Please log in.", 401),
    };
  }
  return { user, errorResponse: null };
}

export async function requireApiAdmin(): Promise<
  { user: SafeUser; errorResponse: null } | { user: null; errorResponse: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      errorResponse: jsonError("Authentication required.", 401),
    };
  }
  if (user.role !== "ADMIN") {
    return {
      user: null,
      errorResponse: jsonError("Administrator access required.", 403),
    };
  }
  return { user, errorResponse: null };
}
