import { generateOpaqueToken, verifyHmacSha256 } from "@/lib/crypto";

export type AdMode = "unconfigured" | "server_callback" | "shrinkme" | "demo";

export interface AdProviderStatus {
  mode: AdMode;
  providerName: string;
  isConfigured: boolean;
  isDemoActive: boolean;
  hasShrinkMeToken: boolean;
  embedUrl: string | null;
  message: string;
}

export function isDemoAdEnabled(): boolean {
  // SECURITY CRITICAL: DEMO adapter MUST NEVER be enabled in production.
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return (
    process.env.ENABLE_DEMO_AD_UNLOCK === "true" ||
    process.env.AD_PROVIDER_MODE === "demo"
  );
}

export function getAdProviderStatus(resourceAdShortlinkUrl?: string | null): AdProviderStatus {
  const rawMode = (process.env.AD_PROVIDER_MODE || "unconfigured").trim().toLowerCase();
  const hasWebhookSecret = Boolean(process.env.AD_PROVIDER_WEBHOOK_SECRET?.trim());
  const hasShrinkMeToken = Boolean(process.env.SHRINKME_API_TOKEN?.trim());
  const hasResourceShortlink = Boolean(resourceAdShortlinkUrl?.trim());
  const embedUrl = process.env.AD_PROVIDER_EMBED_URL?.trim() || null;

  if (rawMode === "server_callback" && hasWebhookSecret) {
    return {
      mode: "server_callback",
      providerName: process.env.AD_PROVIDER_NAME?.trim() || "Verified Rewarded Ad Provider",
      isConfigured: true,
      isDemoActive: false,
      hasShrinkMeToken,
      embedUrl,
      message:
        "Complete the rewarded advertisement to trigger a verified server-side unlock callback.",
    };
  }

  if (hasResourceShortlink || rawMode === "shrinkme") {
    return {
      mode: "shrinkme",
      providerName: "ShrinkMe.io Ad-Supported Link",
      isConfigured: hasResourceShortlink || hasShrinkMeToken,
      isDemoActive: false,
      hasShrinkMeToken,
      embedUrl: null,
      message: hasResourceShortlink
        ? "Open the ShrinkMe.io ad-supported link to view ads and proceed to the free PDF download, or upgrade to skip ads."
        : "ShrinkMe.io mode is selected, but this resource does not have an ad shortlink URL or API token configured yet.",
    };
  }

  if (isDemoAdEnabled()) {
    return {
      mode: "demo",
      providerName: "DEMO Rewarded Ad Adapter (Development Only)",
      isConfigured: true,
      isDemoActive: true,
      hasShrinkMeToken,
      embedUrl: null,
      message:
        "DEMO MODE (Development Only): Simulates a server-signed rewarded-ad completion callback. Disabled automatically in production.",
    };
  }

  return {
    mode: "unconfigured",
    providerName: "Not Configured",
    isConfigured: false,
    isDemoActive: false,
    hasShrinkMeToken,
    embedUrl: null,
    message:
      "No verified rewarded-ad provider or ShrinkMe.io shortlink is configured for this resource yet. You can unlock immediately using a 10 Books Pass or Lifetime Premium membership.",
  };
}

export function verifyServerAdCallbackSignature(params: {
  sessionToken: string;
  externalRef: string;
  timestamp: string;
  signature: string;
}): boolean {
  const secret = process.env.AD_PROVIDER_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return false;
  }
  const tsNum = Number(params.timestamp);
  if (!Number.isFinite(tsNum)) {
    return false;
  }
  // Reject callbacks older than 10 minutes
  const ageMs = Math.abs(Date.now() - tsNum);
  if (ageMs > 10 * 60 * 1000) {
    return false;
  }
  const payload = `${params.sessionToken}:${params.externalRef}:${params.timestamp}`;
  return verifyHmacSha256(payload, params.signature, secret);
}

/**
 * Optional ShrinkMe.io API helper.
 * Calls https://shrinkme.io/api?api=TOKEN&url=ENCODED_TARGET_URL when SHRINKME_API_TOKEN
 * is configured. Never exposes the raw target URL to the user before ShrinkMe redirects.
 */
export async function shortenWithShrinkMeApi(targetUrl: string): Promise<string | null> {
  const token = process.env.SHRINKME_API_TOKEN?.trim();
  if (!token) return null;

  const tryShorten = async (withAlias: boolean): Promise<string | null> => {
    const endpoint = new URL("https://shrinkme.io/api");
    endpoint.searchParams.set("api", token);
    endpoint.searchParams.set("url", targetUrl);
    if (withAlias) {
      endpoint.searchParams.set(
        "alias",
        `ssph_${generateOpaqueToken(6).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`
      );
    }
    const response = await fetch(endpoint.toString(), {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      status?: string;
      shortenedUrl?: string;
    };
    if (data.status === "success" && data.shortenedUrl) {
      return data.shortenedUrl;
    }
    return null;
  };

  return (await tryShorten(true)) ?? (await tryShorten(false));
}
