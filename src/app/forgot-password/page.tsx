import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth-forms";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link for your SSPH account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <ForgotPasswordForm />
    </div>
  );
}
