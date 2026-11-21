export const INDEXNOW_KEY = "7237d8cd6c39458292aba8d9332ef457";

export async function submitToIndexNow(urls: string[]) {
  const host =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/+$/, "") ||
    "sscstudyprephub-rpqv.vercel.app";

  const keyLocation = `https://${host}/${INDEXNOW_KEY}.txt`;

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList: urls.slice(0, 10000), // IndexNow accepts up to 10,000 URLs per batch
  };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return {
      status: res.status,
      ok: res.ok || res.status === 200 || res.status === 202,
      statusText: res.statusText,
    };
  } catch (error) {
    return {
      status: 500,
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
