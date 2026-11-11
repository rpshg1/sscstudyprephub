"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bookmark,
  CheckCircle2,
  Coins,
  Crown,
  Download,
  ExternalLink,
  Loader2,
  PlayCircle,
  ShieldAlert,
  X,
} from "lucide-react";
import { Badge, Button } from "@/components/ui/primitives";
import type { ResourceAccessSummary } from "@/lib/access";
import type { AdProviderStatus } from "@/lib/ads/adapter";

interface DownloadFlowProps {
  resourceId: string;
  resourceTitle: string;
  accessType: "FREE" | "AD_SUPPORTED" | "PREMIUM";
  accessSummary: ResourceAccessSummary;
  initialSaved: boolean;
  isLoggedIn: boolean;
  bookCredits: number;
  adProvider: AdProviderStatus;
}

export function DownloadFlow({
  resourceId,
  resourceTitle,
  accessType,
  accessSummary: initialAccessSummary,
  initialSaved,
  isLoggedIn: initialIsLoggedIn,
  bookCredits: initialBookCredits,
  adProvider,
}: DownloadFlowProps) {
  const router = useRouter();
  const [accessSummary, setAccessSummary] = useState(initialAccessSummary);
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn);
  const [bookCredits, setBookCredits] = useState(initialBookCredits);
  const [saved, setSaved] = useState(initialSaved);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Rewarded Ad Modal State
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adSessionToken, setAdSessionToken] = useState<string | null>(null);
  const [shrinkMeUrl, setShrinkMeUrl] = useState<string | null>(null);
  const [adConfigured, setAdConfigured] = useState(adProvider.isConfigured);
  const [adStatusInfo, setAdStatusInfo] = useState<AdProviderStatus>(adProvider);
  const [adLoading, setAdLoading] = useState(false);
  const [pollingServerCallback, setPollingServerCallback] = useState(false);

  // Defer view count tracking and personalized unlock state off SSR so detail pages stay cacheable
  useEffect(() => {
    let cancelled = false;

    void fetch(`/api/resources/${resourceId}/status`, { method: "POST" }).catch(() => {});

    if (
      !initialIsLoggedIn &&
      typeof document !== "undefined" &&
      document.cookie.includes("ssph_logged_in=1")
    ) {
      fetch(`/api/resources/${resourceId}/status`, { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then(
          (
            data: {
              isLoggedIn?: boolean;
              bookCredits?: number;
              initialSaved?: boolean;
              accessSummary?: ResourceAccessSummary;
              adProvider?: AdProviderStatus;
            } | null
          ) => {
            if (cancelled || !data) return;
            if (typeof data.isLoggedIn === "boolean") setIsLoggedIn(data.isLoggedIn);
            if (typeof data.bookCredits === "number") setBookCredits(data.bookCredits);
            if (typeof data.initialSaved === "boolean") setSaved(data.initialSaved);
            if (data.accessSummary) setAccessSummary(data.accessSummary);
            if (data.adProvider) {
              setAdStatusInfo(data.adProvider);
              setAdConfigured(data.adProvider.isConfigured);
            }
          }
        )
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [resourceId, initialIsLoggedIn]);

  // Poll ONLY when waiting on a real server-side callback provider
  useEffect(() => {
    if (!adModalOpen || !pollingServerCallback || !adSessionToken) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ads/session/${adSessionToken}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          status?: string;
          downloadUrl?: string;
        };
        if (data.status === "COMPLETED" && data.downloadUrl) {
          setPollingServerCallback(false);
          setAdModalOpen(false);
          setSuccessMsg("Advertisement verified! Starting your secure PDF download...");
          window.location.href = data.downloadUrl;
          router.refresh();
        }
      } catch {
        // Keep polling quietly
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [adModalOpen, pollingServerCallback, adSessionToken, router]);

  async function handleDirectOrCreditDownload(useCredit: boolean) {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoadingDownload(true);
    try {
      const res = await fetch(`/api/resources/${resourceId}/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useCredit }),
      });

      const data = (await res.json()) as {
        downloadUrl?: string;
        error?: string;
        creditDeducted?: boolean;
        remainingCredits?: number;
      };

      if (!res.ok || !data.downloadUrl) {
        setErrorMsg(data.error || "Unable to initiate PDF download.");
        return;
      }

      setSuccessMsg(
        data.creditDeducted
          ? `1 book credit used (${data.remainingCredits} remaining). Starting download...`
          : "Download authorized. Starting secure PDF transfer..."
      );
      window.location.href = data.downloadUrl;
      router.refresh();
    } catch {
      setErrorMsg("Network error while requesting download. Please try again.");
    } finally {
      setLoadingDownload(false);
    }
  }

  async function handleOpenAdModal() {
    setErrorMsg(null);
    setSuccessMsg(null);
    setAdModalOpen(true);
    setAdLoading(true);
    setPollingServerCallback(false);

    try {
      const res = await fetch("/api/ads/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      });

      const data = (await res.json()) as {
        configured?: boolean;
        sessionToken?: string | null;
        shrinkMeLaunchUrl?: string | null;
        provider?: AdProviderStatus;
        error?: string;
      };

      if (!res.ok) {
        setErrorMsg(data.error || "Could not start ad unlock session.");
        return;
      }

      if (data.provider) setAdStatusInfo(data.provider);
      setAdConfigured(Boolean(data.configured));
      setAdSessionToken(data.sessionToken ?? null);
      setShrinkMeUrl(data.shrinkMeLaunchUrl ?? null);

      if (data.configured && data.provider?.mode === "server_callback" && data.sessionToken) {
        setPollingServerCallback(true);
      }
    } catch {
      setErrorMsg("Unable to reach advertisement verification service.");
    } finally {
      setAdLoading(false);
    }
  }

  async function handleDemoComplete() {
    if (!adSessionToken) return;
    setAdLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/ads/demo-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: adSessionToken }),
      });
      const data = (await res.json()) as {
        downloadUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.downloadUrl) {
        setErrorMsg(data.error || "DEMO unlock failed.");
        return;
      }
      setAdModalOpen(false);
      setSuccessMsg("DEMO verification completed (dev only). Starting download...");
      window.location.href = data.downloadUrl;
      router.refresh();
    } catch {
      setErrorMsg("Failed to run DEMO ad verification.");
    } finally {
      setAdLoading(false);
    }
  }

  async function handleToggleSave() {
    if (!isLoggedIn) {
      router.push(`/login`);
      return;
    }
    setSavingBookmark(true);
    try {
      const res = await fetch("/api/user/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { saved: boolean };
        setSaved(data.saved);
      }
    } finally {
      setSavingBookmark(false);
    }
  }

  const isLifetimeOrFreeDirect = accessSummary.canDownloadDirectly;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {isLifetimeOrFreeDirect ? (
          <Button
            size="lg"
            className="flex-1 min-h-11"
            onClick={() => handleDirectOrCreditDownload(false)}
            disabled={loadingDownload}
          >
            {loadingDownload ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {accessSummary.unlockReason === "LIFETIME_PREMIUM" ||
            accessSummary.unlockReason === "ALREADY_UNLOCKED"
              ? "Download PDF"
              : "Download Now"}
          </Button>
        ) : accessType === "AD_SUPPORTED" ? (
          <Button
            size="lg"
            className="flex-1 min-h-11"
            onClick={handleOpenAdModal}
            disabled={loadingDownload}
          >
            <Download className="h-4 w-4" />
            Download Now
          </Button>
        ) : accessSummary.canUnlockWithCredit ? (
          <Button
            size="lg"
            className="flex-1 min-h-11"
            onClick={() => handleDirectOrCreditDownload(true)}
            disabled={loadingDownload}
          >
            {loadingDownload ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Coins className="h-4 w-4" />
            )}
            Unlock with 1 Book Credit ({bookCredits} left)
          </Button>
        ) : (
          <Link
            href={isLoggedIn ? "/pricing" : "/login?next=/pricing"}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#101B33] px-6 text-sm font-semibold text-white hover:bg-[#1B2B4F] transition-colors"
          >
            <Crown className="h-4 w-4 text-blue-300" />
            {isLoggedIn
              ? "Unlock with ₹59 Pass or ₹300 Lifetime"
              : "Login or Upgrade to Download"}
          </Link>
        )}

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="min-h-11"
          onClick={handleToggleSave}
          disabled={savingBookmark}
        >
          <Bookmark
            className={`h-4 w-4 ${saved ? "fill-[#2563EB] text-[#2563EB]" : "text-slate-500"}`}
          />
          {saved ? "Saved" : "Save"}
        </Button>
      </div>

      {/* Exact required subheading for free ad-supported resources when not unlocked/premium */}
      {accessType === "AD_SUPPORTED" && !isLifetimeOrFreeDirect && (
        <p className="text-xs font-medium text-slate-600">
          Watch an advertisement to unlock this PDF.
        </p>
      )}

      {/* Optional 1-click credit unlock alongside Ad-Supported flow */}
      {accessType === "AD_SUPPORTED" &&
        !isLifetimeOrFreeDirect &&
        accessSummary.canUnlockWithCredit && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50/70 p-3">
            <div className="text-xs text-[#172033]">
              <span className="font-semibold text-[#101B33]">
                Have a 10 Books Pass?
              </span>{" "}
              Skip advertisements by redeeming 1 of your {bookCredits} remaining credits.
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleDirectOrCreditDownload(true)}
              disabled={loadingDownload}
            >
              <Coins className="h-3.5 w-3.5" />
              Use 1 Credit
            </Button>
          </div>
        )}

      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Rewarded Advertisement Modal */}
      {adModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ad-unlock-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge tone="blue">Ad-Supported Unlock</Badge>
                <h2
                  id="ad-unlock-modal-title"
                  className="mt-2 text-lg font-bold text-[#101B33]"
                >
                  Watch an advertisement to unlock this PDF.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAdModalOpen(false);
                  setPollingServerCallback(false);
                }}
                aria-label="Close modal"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Successful completion unlocks{" "}
              <span className="font-semibold text-[#172033]">{resourceTitle}</span>{" "}
              without any membership fee.
            </p>

            <div className="mt-5 space-y-4">
              {adLoading ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-6 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                  Initializing verification session...
                </div>
              ) : !adConfigured ? (
                <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-2.5 text-amber-900">
                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <p className="font-bold">Rewarded Ad Provider Not Configured</p>
                      <p className="mt-1">{adStatusInfo.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href="/pricing"
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                    >
                      <Crown className="h-3.5 w-3.5" />
                      Get 10 Books (₹59) or Lifetime (₹300)
                    </Link>
                  </div>
                </div>
              ) : adStatusInfo.mode === "shrinkme" && shrinkMeUrl ? (
                <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#101B33]">
                      Ad-Supported Link Source (ShrinkMe.io)
                    </p>
                    <p className="text-xs leading-relaxed text-slate-600">
                      Clicking below opens ShrinkMe.io, which displays advertisements and
                      automatically redirects you to the free PDF download once completed.
                    </p>
                  </div>
                  <a
                    href={shrinkMeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Continue via ShrinkMe.io to Free PDF
                  </a>
                </div>
              ) : adStatusInfo.mode === "server_callback" ? (
                <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                  <p className="text-xs font-semibold text-[#101B33]">
                    {adStatusInfo.providerName}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600">
                    Waiting for verified server-side completion callback from the
                    rewarded-ad network. Closing this window before completion will not
                    unlock the file.
                  </p>
                  {adStatusInfo.embedUrl && (
                    <a
                      href={`${adStatusInfo.embedUrl}${adStatusInfo.embedUrl.includes("?") ? "&" : "?"}session=${encodeURIComponent(adSessionToken || "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Launch Rewarded Advertisement
                    </a>
                  )}
                  <div className="flex items-center gap-2 text-xs text-[#2563EB] font-medium">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Listening for verified server callback...
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#101B33]">
                      DEMO • DEVELOPMENT ONLY
                    </span>
                    <span className="text-[11px] font-medium text-amber-900">
                      Disabled in Production
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-amber-950">
                    This development-only mock adapter demonstrates the server-signed
                    rewarded-ad unlock flow locally. In production, only verified
                    server-side ad callbacks or configured ad shortlinks can unlock PDFs.
                  </p>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleDemoComplete}
                    disabled={adLoading}
                  >
                    <PlayCircle className="h-4 w-4" />
                    Complete DEMO Ad Verification (Dev Only)
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-4 text-xs text-slate-600">
                <span>Prefer instant downloads with zero ads?</span>
                <Link
                  href="/pricing"
                  className="font-semibold text-[#2563EB] hover:underline"
                >
                  View ₹59 / ₹300 Plans →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
