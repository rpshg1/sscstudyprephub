import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your SSCSTUDYPREPHUB (SSPH) student or admin account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  }
  const sp = await searchParams;
  const nextUrl = typeof sp.next === "string" ? sp.next : "/dashboard";

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <LoginForm nextUrl={nextUrl} />
    </div>
  );
}
