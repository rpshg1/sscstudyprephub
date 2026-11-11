import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.E2E_BASE_URL || "http://127.0.0.1:3055";
const prisma = new PrismaClient();

class CookieJar {
  private cookies = new Map<string, string>();

  capture(res: Response) {
    const setCookies = res.headers.getSetCookie?.() ?? [];
    for (const raw of setCookies) {
      const pair = raw.split(";")[0];
      const idx = pair.indexOf("=");
      if (idx > 0) {
        const name = pair.slice(0, idx).trim();
        const val = pair.slice(idx + 1).trim();
        if (val === "" || raw.toLowerCase().includes("max-age=0")) {
          this.cookies.delete(name);
        } else {
          this.cookies.set(name, val);
        }
      }
    }
  }

  header(): string {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }
}

async function req(
  path: string,
  opts: RequestInit & { jar?: CookieJar } = {}
): Promise<Response> {
  const headers = new Headers(opts.headers);
  if (opts.jar) {
    const cookieStr = opts.jar.header();
    if (cookieStr) headers.set("Cookie", cookieStr);
  }
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    redirect: opts.redirect ?? "manual",
  });
  opts.jar?.capture(res);
  return res;
}

async function main() {
  console.log(`Running E2E QA suite against ${BASE}...`);

  // 1. Homepage & Pricing consistency
  const homeRes = await req("/");
  assert.equal(homeRes.status, 200);
  const homeHtml = await homeRes.text();
  assert.ok(homeHtml.includes("Prepare Smarter. Score Higher."));
  assert.ok(homeHtml.includes("One Hub. Every Preparation Resource."));
  assert.ok(homeHtml.includes("₹0"));
  assert.ok(homeHtml.includes("₹59"));
  assert.ok(homeHtml.includes("₹300"));
  console.log("  [PASS] Homepage renders heading, tagline, and pricing");

  // 2. Resource Library filtering + empty state + suggestions
  const libRes = await req("/library?exam=SSC_CGL&type=ROADMAP");
  assert.equal(libRes.status, 200);
  const libHtml = await libRes.text();
  assert.ok(libHtml.includes("SSC CGL Preparation Roadmap"));

  const emptyRes = await req("/library?q=zzzznonexistentresourcexyz999");
  assert.equal(emptyRes.status, 200);
  const emptyHtml = await emptyRes.text();
  assert.ok(emptyHtml.includes("No matching study resources found"));

  const suggestRes = await req("/api/resources/suggestions?q=Math");
  assert.equal(suggestRes.status, 200);
  const suggestJson = (await suggestRes.json()) as { suggestions: Array<{ slug: string }> };
  assert.ok(suggestJson.suggestions.length >= 1);
  console.log("  [PASS] Library search, filtering, suggestions, and empty state");

  // 3. Resource Detail page, 10-15 Page Sample PDF Viewer & URL protection
  const detailRes = await req("/resources/ssc-cgl-mathematics-notes-demo");
  assert.equal(detailRes.status, 200);
  const detailHtml = await detailRes.text();
  assert.ok(detailHtml.includes("Watch an advertisement to unlock this PDF."));
  assert.ok(detailHtml.includes("Free Book Sample"));
  assert.equal(detailHtml.includes("pdfs/ssc-cgl-mathematics-notes-demo.pdf"), false);

  const mathRes = await prisma.resource.findUniqueOrThrow({
    where: { slug: "ssc-cgl-mathematics-notes-demo" },
  });
  const samplePdfRes = await req(`/api/resources/${mathRes.id}/sample`);
  assert.equal(samplePdfRes.status, 200);
  assert.equal(samplePdfRes.headers.get("content-type"), "application/pdf");
  const sampleBuf = Buffer.from(await samplePdfRes.arrayBuffer());
  assert.equal(sampleBuf.subarray(0, 5).toString("ascii"), "%PDF-");
  console.log("  [PASS] Detail page displays ad notice, sample viewer, and valid sample PDF bytes");

  // 4. Free PDF direct download returns real %PDF bytes
  const freeResource = await prisma.resource.findFirstOrThrow({
    where: { accessType: "FREE", isPublished: true },
  });
  const freeAccessRes = await req(`/api/resources/${freeResource.id}/access`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(freeAccessRes.status, 200);
  const freeAccessJson = (await freeAccessRes.json()) as { downloadUrl: string };
  assert.ok(freeAccessJson.downloadUrl.startsWith("/api/download/"));

  const pdfRes = await req(freeAccessJson.downloadUrl);
  assert.equal(pdfRes.status, 200);
  assert.equal(pdfRes.headers.get("content-type"), "application/pdf");
  const pdfBuf = Buffer.from(await pdfRes.arrayBuffer());
  assert.equal(pdfBuf.subarray(0, 5).toString("ascii"), "%PDF-");
  console.log("  [PASS] Free resource signed download streams valid PDF bytes");

  // 5. Dev DEMO ad unlock flow (non-production)
  const adResource = await prisma.resource.findFirstOrThrow({
    where: { accessType: "AD_SUPPORTED", isPublished: true },
  });
  const adSessRes = await req("/api/ads/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resourceId: adResource.id }),
  });
  assert.equal(adSessRes.status, 200);
  const adSessJson = (await adSessRes.json()) as {
    configured: boolean;
    sessionToken: string;
  };
  assert.equal(adSessJson.configured, true);
  assert.ok(adSessJson.sessionToken);

  const demoDoneRes = await req("/api/ads/demo-complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionToken: adSessJson.sessionToken }),
  });
  assert.equal(demoDoneRes.status, 200);
  const demoDoneJson = (await demoDoneRes.json()) as { downloadUrl: string };
  const demoPdfRes = await req(demoDoneJson.downloadUrl);
  assert.equal(demoPdfRes.status, 200);
  console.log("  [PASS] Development DEMO ad unlock issues valid short-lived PDF");

  // 6. Student Signup, Profile Update, Dashboard, RBAC block, Unconfigured Razorpay
  const studentJar = new CookieJar();
  const studentEmail = `e2e_student_${Date.now()}@example.com`;
  const signupRes = await req("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "E2E Student",
      email: studentEmail,
      password: "StudentPassword123",
      targetExam: "SSC_CGL",
    }),
    jar: studentJar,
  });
  assert.equal(signupRes.status, 201);

  const dashRes = await req("/dashboard", { jar: studentJar });
  assert.equal(dashRes.status, 200);
  const dashHtml = await dashRes.text();
  assert.ok(dashHtml.includes("E2E Student"));

  // Student must be blocked from Admin route & Admin API
  const adminPageBlock = await req("/admin", { jar: studentJar });
  assert.equal(adminPageBlock.status, 307);
  const adminApiBlock = await req("/api/admin/resources", { jar: studentJar });
  assert.equal(adminApiBlock.status, 403);

  // Unconfigured Razorpay must return 503 and NOT fake payment
  const orderRes = await req("/api/payments/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ planType: "TEN_BOOKS" }),
    jar: studentJar,
  });
  assert.equal(orderRes.status, 503);
  const orderJson = (await orderRes.json()) as { configured: boolean };
  assert.equal(orderJson.configured, false);
  console.log("  [PASS] Student signup, dashboard, RBAC protection & Razorpay guard");

  // 7. Admin Login, Create ShrinkMe Resource, Test ShrinkMe Redirect, Cleanup
  const adminEmail = `e2e_admin_${Date.now()}@example.com`;
  const { hashPassword } = await import("../src/lib/crypto");
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "E2E Admin",
      passwordHash: hashPassword("AdminSecretPass123!"),
      role: "ADMIN",
      membershipTier: "LIFETIME",
    },
  });

  const adminJar = new CookieJar();
  const adminLoginRes = await req("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: adminEmail,
      password: "AdminSecretPass123!",
    }),
    jar: adminJar,
  });
  assert.equal(adminLoginRes.status, 200);

  const adminPageRes = await req("/admin", { jar: adminJar });
  assert.equal(adminPageRes.status, 200);

  const mathCat = await prisma.category.findFirstOrThrow({
    where: { slug: "mathematics" },
  });

  const createRes = await req("/api/admin/resources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "E2E ShrinkMe Test Resource",
      description: "Automated QA resource verifying ShrinkMe.io ad redirect flow.",
      examCategory: "SSC_CGL",
      resourceType: "NOTES",
      subject: "Mathematics",
      categoryId: mathCat.id,
      storageType: "EXTERNAL_URL",
      protectedFileUrl: "https://example.com/private/protected-copy.pdf",
      adShortlinkUrl: "https://shrinkme.io/ssph-qa-demo",
      fileFormat: "PDF",
      fileSizeLabel: "1.1 MB",
      authorSource: "SSPH QA",
      accessType: "AD_SUPPORTED",
      isPublished: true,
      isFeatured: false,
      isDemo: true,
    }),
    jar: adminJar,
  });
  assert.equal(createRes.status, 201);
  const createdJson = (await createRes.json()) as { resource: { id: string } };

  // Start ad session for ShrinkMe resource -> verify it generates /api/ads/shrinkme/[token] -> 302 to ShrinkMe
  const shrinkSessionRes = await req("/api/ads/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resourceId: createdJson.resource.id }),
  });
  assert.equal(shrinkSessionRes.status, 200);
  const shrinkSessionJson = (await shrinkSessionRes.json()) as {
    configured: boolean;
    provider: { mode: string };
    shrinkMeLaunchUrl: string;
  };
  assert.equal(shrinkSessionJson.configured, true);
  assert.equal(shrinkSessionJson.provider.mode, "shrinkme");
  assert.ok(shrinkSessionJson.shrinkMeLaunchUrl.startsWith("/api/ads/shrinkme/"));

  const shrinkRedirectRes = await req(shrinkSessionJson.shrinkMeLaunchUrl);
  assert.equal(shrinkRedirectRes.status, 302);
  assert.equal(
    shrinkRedirectRes.headers.get("location"),
    "https://shrinkme.io/ssph-qa-demo"
  );

  // Delete created E2E resource
  const delRes = await req(`/api/admin/resources/${createdJson.resource.id}`, {
    method: "DELETE",
    jar: adminJar,
  });
  assert.equal(delRes.status, 200);
  console.log("  [PASS] Admin CRUD & ShrinkMe.io ad-supported redirect flow");

  // 8. Legal pages, Contact complaint submission & SEO endpoints
  const complaintRes = await req("/api/complaints", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "E2E Tester",
      email: "tester@example.com",
      type: "GENERAL",
      subject: "E2E Smoke Test Ticket",
      message: "Verifying complaint persistence in database during QA run.",
    }),
  });
  assert.equal(complaintRes.status, 201);
  const complaintJson = (await complaintRes.json()) as { complaint: { id: string } };

  const sitemapRes = await req("/sitemap.xml");
  assert.equal(sitemapRes.status, 200);
  const robotsRes = await req("/robots.txt");
  assert.equal(robotsRes.status, 200);
  const aboutRes = await req("/about");
  assert.equal(aboutRes.status, 200);
  const dmcaRes = await req("/copyright-dmca");
  assert.equal(dmcaRes.status, 200);

  // Cleanup test rows
  await prisma.complaint.delete({ where: { id: complaintJson.complaint.id } }).catch(() => {});
  await prisma.user.deleteMany({
    where: { email: { in: [studentEmail, adminUser.email] } },
  });
  await prisma.$disconnect();
  console.log("  [PASS] Legal pages, complaint form, sitemap.xml, robots.txt");
  console.log("\nALL E2E HTTP QA CHECKS PASSED!");
}

main().catch((err) => {
  console.error("E2E QA FAILED:", err);
  process.exit(1);
});
