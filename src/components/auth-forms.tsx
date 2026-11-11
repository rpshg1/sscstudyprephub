"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button, Card, Input, Select } from "@/components/ui/primitives";
import { EXAM_OPTIONS } from "@/lib/constants";

export function LoginForm({ nextUrl = "/dashboard" }: { nextUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        user?: { role: string };
        error?: string;
      };
      if (!res.ok || !data.user) {
        setError(data.error || "Invalid credentials.");
        return;
      }

      const safeNext = nextUrl.startsWith("/") ? nextUrl : "/dashboard";
      router.push(data.user.role === "ADMIN" && safeNext === "/dashboard" ? "/admin" : safeNext);
      router.refresh();
    } catch {
      setError("Network error while signing in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="SSCSTUDYPREPHUB logo"
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-full shadow-xs ring-1 ring-amber-400/50"
        />
        <div>
          <h1 className="text-2xl font-extrabold text-[#101B33]">Welcome Back</h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Sign in to access your SSPH study dashboard, saved PDFs, and credits.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-[#172033]">
            Email Address
          </label>
          <Input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            placeholder="aspirant@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-semibold text-[#172033]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-600">
        New to SSPH?{" "}
        <Link href="/signup" className="font-semibold text-[#2563EB] hover:underline">
          Create a free student account
        </Link>
      </p>
    </Card>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [targetExam, setTargetExam] = useState("SSC_CGL");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, targetExam, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Unable to create account.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error while creating account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="SSCSTUDYPREPHUB logo"
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-full shadow-xs ring-1 ring-amber-400/50"
        />
        <div>
          <h1 className="text-2xl font-extrabold text-[#101B33]">Create Free Account</h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Join SSCSTUDYPREPHUB to bookmark resources, track downloads, and manage passes.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="signup-name" className="mb-1.5 block text-xs font-semibold text-[#172033]">
            Full Name
          </label>
          <Input
            id="signup-name"
            type="text"
            required
            placeholder="e.g. Aarav Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-xs font-semibold text-[#172033]">
            Email Address
          </label>
          <Input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            placeholder="aspirant@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="signup-exam" className="mb-1.5 block text-xs font-semibold text-[#172033]">
            Primary Target Exam
          </label>
          <Select
            id="signup-exam"
            value={targetExam}
            onChange={(e) => setTargetExam(e.target.value)}
          >
            {EXAM_OPTIONS.map((exam) => (
              <option key={exam.value} value={exam.value}>
                {exam.label} — {exam.fullName}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-1.5 block text-xs font-semibold text-[#172033]">
            Password
          </label>
          <Input
            id="signup-password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="At least 8 characters with letters & numbers"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Free Account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-600">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-[#2563EB] hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmittedMsg(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setError(data.error || "Unable to send reset link.");
        return;
      }
      setSubmittedMsg(
        data.message ||
          "If an account exists for that email, reset instructions have been processed."
      );
    } catch {
      setError("Network error while requesting reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold text-[#101B33]">Reset Password</h1>
      <p className="mt-1 text-sm text-slate-600">
        Enter your registered email address to receive a time-limited reset link.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-semibold text-[#172033]">
            Email Address
          </label>
          <Input
            id="forgot-email"
            type="email"
            required
            placeholder="aspirant@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {submittedMsg && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{submittedMsg}</span>
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Send Reset Instructions
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-600">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-[#2563EB] hover:underline">
          Back to login
        </Link>
      </p>
    </Card>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setError(data.error || "Reset failed.");
        return;
      }
      setMessage(data.message || "Password updated.");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Network error while resetting password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold text-[#101B33]">Set New Password</h1>
      <p className="mt-1 text-sm text-slate-600">
        Choose a strong new password (minimum 8 characters with letters and numbers).
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="new-password" className="mb-1.5 block text-xs font-semibold text-[#172033]">
            New Password
          </label>
          <Input
            id="new-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            {message}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading || !token}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Password
        </Button>
      </form>
    </Card>
  );
}
