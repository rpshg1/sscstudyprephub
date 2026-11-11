"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  CheckCircle2,
  Coins,
  CreditCard,
  Crown,
  Download,
  History,
  Settings,
  Unlock,
  User as UserIcon,
} from "lucide-react";
import { Badge, Button, Card, Input, Select } from "@/components/ui/primitives";
import { EXAM_OPTIONS, formatExamLabel } from "@/lib/constants";
import type { SafeUser } from "@/lib/auth";

interface DashboardProps {
  user: SafeUser;
  downloads: Array<{
    id: string;
    method: string;
    createdAt: string;
    resource: {
      id: string;
      slug: string;
      title: string;
      subject: string;
      examCategory: string;
      fileSizeLabel: string;
    };
  }>;
  unlocks: Array<{
    id: string;
    unlockMethod: string;
    creditUsed: boolean;
    createdAt: string;
    resource: {
      id: string;
      slug: string;
      title: string;
      subject: string;
      examCategory: string;
    };
  }>;
  saved: Array<{
    id: string;
    slug: string;
    title: string;
    subject: string;
    examCategory: string;
    accessType: string;
  }>;
  purchases: Array<{
    id: string;
    planType: string;
    amountPaise: number;
    status: string;
    razorpayOrderId: string;
    creditsGranted: number;
    createdAt: string;
  }>;
}

export function StudentDashboardClient({
  user,
  downloads,
  unlocks,
  saved,
  purchases,
}: DashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<
    "overview" | "downloads" | "unlocked" | "saved" | "settings"
  >("overview");

  const [name, setName] = useState(user.name);
  const [targetExam, setTargetExam] = useState<string>(user.targetExam);
  const [phone, setPhone] = useState(user.phone || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    setProfileErr(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, targetExam, phone }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setProfileErr(data.error || "Could not update profile.");
        return;
      }
      setProfileMsg("Profile updated successfully.");
      router.refresh();
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPw(true);
    setPwMsg(null);
    setPwErr(null);
    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setPwErr(data.error || "Password update failed.");
        return;
      }
      setPwMsg(data.message || "Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    } finally {
      setSavingPw(false);
    }
  }

  async function handleRemoveSaved(resourceId: string) {
    await fetch("/api/user/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId }),
    });
    router.refresh();
  }

  const membershipLabel =
    user.membershipTier === "LIFETIME"
      ? "LIFETIME PREMIUM (₹300)"
      : user.membershipTier === "TEN_BOOKS"
        ? "10 BOOKS PASS (₹59)"
        : "FREE PLAN (₹0)";

  return (
    <div className="space-y-8">
      {/* Top Summary Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge tone="blue">Student Account</Badge>
          <h1 className="mt-2 text-2xl font-extrabold text-[#101B33] sm:text-3xl">
            Welcome, {user.name}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {user.email} • Target Exam: {formatExamLabel(user.targetExam)}
          </p>
        </div>

        {user.membershipTier !== "LIFETIME" && (
          <Link
            href="/pricing"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <Crown className="h-4 w-4" />
            Upgrade Membership
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Membership</span>
            <Crown className="h-4 w-4 text-[#2563EB]" />
          </div>
          <p className="mt-2 text-lg font-extrabold text-[#101B33]">
            {membershipLabel}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {user.membershipTier === "LIFETIME"
              ? "Unlimited eligible PDF downloads"
              : "Upgrade anytime for ad-free access"}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Book Credits</span>
            <Coins className="h-4 w-4 text-[#2563EB]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101B33]">
            {user.membershipTier === "LIFETIME" ? "Unlimited" : user.bookCredits}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            1 credit per unique unlocked resource
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Downloads</span>
            <Download className="h-4 w-4 text-[#2563EB]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101B33]">
            {downloads.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Recent PDF transfers logged</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Saved Resources</span>
            <Bookmark className="h-4 w-4 text-[#2563EB]" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#101B33]">
            {saved.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Bookmarked for quick study</p>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E2E8F0] pb-3">
        {[
          { id: "overview", label: "Overview & Orders", icon: CreditCard },
          { id: "downloads", label: "Download History", icon: History },
          { id: "unlocked", label: "Unlocked Resources", icon: Unlock },
          { id: "saved", label: "Saved / Favourites", icon: Bookmark },
          { id: "settings", label: "Profile & Settings", icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as typeof tab)}
              className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-semibold transition-colors cursor-pointer ${
                active
                  ? "bg-[#101B33] text-white"
                  : "bg-white border border-[#E2E8F0] text-[#172033] hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#101B33]">
              <UserIcon className="h-4 w-4 text-[#2563EB]" />
              Profile Summary
            </h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
                <dt className="text-slate-500">Full Name</dt>
                <dd className="font-semibold text-[#101B33]">{user.name}</dd>
              </div>
              <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-semibold text-[#101B33]">{user.email}</dd>
              </div>
              <div className="flex justify-between border-b border-[#E2E8F0] pb-2">
                <dt className="text-slate-500">Target Exam</dt>
                <dd className="font-semibold text-[#101B33]">
                  {formatExamLabel(user.targetExam)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Account Tier</dt>
                <dd className="font-semibold text-[#2563EB]">{membershipLabel}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#101B33]">
              <CreditCard className="h-4 w-4 text-[#2563EB]" />
              Membership Purchases &amp; Transactions
            </h2>
            {purchases.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-[#E2E8F0] p-5 text-center text-xs text-slate-600">
                No membership purchases recorded yet.
                <div className="mt-3">
                  <Link
                    href="/pricing"
                    className="font-semibold text-[#2563EB] hover:underline"
                  >
                    Explore ₹59 10-Books Pass &amp; ₹300 Lifetime Premium →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {purchases.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#101B33]">
                        {p.planType === "LIFETIME"
                          ? "Lifetime Premium"
                          : "10 Books Pass"}
                      </p>
                      <p className="text-slate-500 font-mono">{p.razorpayOrderId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#101B33]">
                        ₹{(p.amountPaise / 100).toFixed(0)}
                      </p>
                      <Badge
                        tone={
                          p.status === "PAID"
                            ? "green"
                            : p.status === "FAILED"
                              ? "red"
                              : "amber"
                        }
                      >
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === "downloads" && (
        <Card className="p-6">
          <h2 className="text-base font-bold text-[#101B33]">Download History</h2>
          {downloads.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              You haven&apos;t downloaded any PDFs yet.{" "}
              <Link href="/library" className="text-[#2563EB] font-semibold hover:underline">
                Browse the Resource Library
              </Link>
              .
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E2E8F0] text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2.5 pr-4">Resource</th>
                    <th className="py-2.5 pr-4">Exam</th>
                    <th className="py-2.5 pr-4">Unlock Method</th>
                    <th className="py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {downloads.map((d) => (
                    <tr key={d.id}>
                      <td className="py-3 pr-4">
                        <Link
                          href={`/resources/${d.resource.slug}`}
                          className="font-semibold text-[#101B33] hover:text-[#2563EB]"
                        >
                          {d.resource.title}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-xs text-slate-600">
                        {formatExamLabel(d.resource.examCategory)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone="slate">{d.method.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="py-3 text-xs text-slate-500">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === "unlocked" && (
        <Card className="p-6">
          <h2 className="text-base font-bold text-[#101B33]">
            Unlocked Resources &amp; Credit Ledger
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Re-downloading any resource listed below will not deduct additional credits.
          </p>
          {unlocks.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              No unlocked resources yet.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {unlocks.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border border-[#E2E8F0] p-4"
                >
                  <div className="min-w-0 pr-3">
                    <Link
                      href={`/resources/${u.resource.slug}`}
                      className="block truncate text-sm font-bold text-[#101B33] hover:text-[#2563EB]"
                    >
                      {u.resource.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {u.resource.subject} •{" "}
                      {u.creditUsed ? "1 Credit Deducted" : u.unlockMethod.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Link
                    href={`/resources/${u.resource.slug}`}
                    className="shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#2563EB] hover:bg-blue-100"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "saved" && (
        <Card className="p-6">
          <h2 className="text-base font-bold text-[#101B33]">
            Saved / Favourite Resources
          </h2>
          {saved.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              You haven&apos;t bookmarked any resources yet.
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {saved.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] p-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/resources/${item.slug}`}
                      className="block truncate text-sm font-bold text-[#101B33] hover:text-[#2563EB]"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.subject} • {formatExamLabel(item.examCategory)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveSaved(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === "settings" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-base font-bold text-[#101B33]">Account Settings</h2>
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172033]">
                  Full Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172033]">
                  Target SSC Exam
                </label>
                <Select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                >
                  {EXAM_OPTIONS.map((exam) => (
                    <option key={exam.value} value={exam.value}>
                      {exam.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172033]">
                  Phone (Optional)
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                />
              </div>
              {profileErr && (
                <p className="text-xs font-medium text-red-600">{profileErr}</p>
              )}
              {profileMsg && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {profileMsg}
                </p>
              )}
              <Button type="submit" disabled={savingProfile}>
                Save Profile Changes
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-[#101B33]">Change Password</h2>
            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172033]">
                  Current Password
                </label>
                <Input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#172033]">
                  New Password
                </label>
                <Input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters with letters & numbers"
                />
              </div>
              {pwErr && <p className="text-xs font-medium text-red-600">{pwErr}</p>}
              {pwMsg && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {pwMsg}
                </p>
              )}
              <Button type="submit" variant="secondary" disabled={savingPw}>
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
