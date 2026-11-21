const INDEXNOW_KEY = "7237d8cd6c39458292aba8d9332ef457";
const HOST = "sscstudyprephub-rpqv.vercel.app";
const BASE_URL = `https://${HOST}`;

async function main() {
  console.log(`[IndexNow] Preparing URL batch for ${HOST}...`);

  const urls = [
    `${BASE_URL}/`,
    `${BASE_URL}/books`,
    `${BASE_URL}/roadmaps`,
    `${BASE_URL}/pyqs`,
    `${BASE_URL}/syllabus`,
    `${BASE_URL}/typing`,
    `${BASE_URL}/typing/exam`,
    `${BASE_URL}/typing/rules`,
    `${BASE_URL}/about`,
    `${BASE_URL}/contact`,
    `${BASE_URL}/copyright-dmca`,
    `${BASE_URL}/disclaimer`,
    `${BASE_URL}/privacy-policy`,
    `${BASE_URL}/terms`,
  ];

  // Add all 365 daily typing lessons
  for (let i = 1; i <= 365; i++) {
    urls.push(`${BASE_URL}/typing/${i}`);
  }

  console.log(`[IndexNow] Submitting ${urls.length} URLs to https://api.indexnow.org/indexnow...`);

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  };

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    console.log(`[IndexNow] Response Status: ${response.status} (${response.statusText})`);

    if (response.status === 200 || response.status === 202) {
      console.log(`[IndexNow] Success! All ${urls.length} URLs submitted to Bing and participating search engines.`);
    } else {
      const text = await response.text();
      console.log(`[IndexNow] Response Body: ${text}`);
    }
  } catch (err) {
    console.error("[IndexNow] Request failed:", err);
  }
}

main();
