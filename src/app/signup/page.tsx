import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SignupForm } from "@/components/auth-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Free Account",
  description: "Register on SSCSTUDYPREPHUB (SSPH) to organize your SSC study library.",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SignupForm />
    </div>
  );
}
