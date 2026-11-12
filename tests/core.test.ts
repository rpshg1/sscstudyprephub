import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  verifyPassword,
  signHmacSha256,
  verifyHmacSha256,
} from "../src/lib/crypto";
import { evaluateResourceAccess, unlockResourceForUser, AccessError } from "../src/lib/access";
import { isDemoAdEnabled, verifyServerAdCallbackSignature } from "../src/lib/ads/adapter";
import { verifyRazorpayCheckoutSignature, verifyRazorpayWebhookSignature } from "../src/lib/razorpay";
import { fulfillRazorpayPurchase } from "../src/lib/payments";
import { validatePdfBuffer, resolveSafeStoragePath } from "../src/lib/storage";
import { PUBLIC_RESOURCE_SELECT } from "../src/lib/resources";
import { computeSamplePageLimit, inspectAndCreateSamplePdf, readThumbnailPayload } from "../src/lib/pdf-sample";
import { buildSamplePdfBuffer } from "../src/lib/pdf-generator";
import { parseHintsFromFilename, SeoBookMetadataSchema } from "../src/lib/metadata-enricher";
import { extractDriveFolderId, isRoadmapCandidate, isSyllabusCandidate } from "../src/lib/google-drive";

const prisma = new PrismaClient();

test("Password hashing and verification with scrypt", () => {
  const hash = hashPassword("SecureSSC#2026");
  assert.ok(hash.startsWith("scrypt:"));
  assert.equal(verifyPassword("SecureSSC#2026", hash), true);
  assert.equal(verifyPassword("WrongPassword", hash), false);
});

test("HMAC signing rejects tampered data", () => {
  const sig = signHmacSha256("order_123|pay_456", "test_secret_key_12345");
  assert.equal(verifyHmacSha256("order_123|pay_456", sig, "test_secret_key_12345"), true);
  assert.equal(verifyHmacSha256("order_123|pay_999", sig, "test_secret_key_12345"), false);
});

test("DEMO ad adapter is strictly blocked in production", () => {
  const prevNodeEnv = process.env.NODE_ENV;
  const prevEnable = process.env.ENABLE_DEMO_AD_UNLOCK;
  try {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    process.env.ENABLE_DEMO_AD_UNLOCK = "true";
    assert.equal(isDemoAdEnabled(), false);

    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    process.env.ENABLE_DEMO_AD_UNLOCK = "true";
    assert.equal(isDemoAdEnabled(), true);
  } finally {
    (process.env as Record<string, string | undefined>).NODE_ENV = prevNodeEnv;
    process.env.ENABLE_DEMO_AD_UNLOCK = prevEnable;
  }
});

test("Server-side rewarded ad callback verifies HMAC and rejects stale timestamps", () => {
  const prevSecret = process.env.AD_PROVIDER_WEBHOOK_SECRET;
  process.env.AD_PROVIDER_WEBHOOK_SECRET = "ad-webhook-secret-xyz";
  try {
    const ts = String(Date.now());
    const sig = signHmacSha256(`sess_abc:ext_1:${ts}`, "ad-webhook-secret-xyz");
    assert.equal(
      verifyServerAdCallbackSignature({
        sessionToken: "sess_abc",
        externalRef: "ext_1",
        timestamp: ts,
        signature: sig,
      }),
      true
    );

    const staleTs = String(Date.now() - 20 * 60 * 1000);
    const staleSig = signHmacSha256(`sess_abc:ext_1:${staleTs}`, "ad-webhook-secret-xyz");
    assert.equal(
      verifyServerAdCallbackSignature({
        sessionToken: "sess_abc",
        externalRef: "ext_1",
        timestamp: staleTs,
        signature: staleSig,
      }),
      false
    );
  } finally {
    process.env.AD_PROVIDER_WEBHOOK_SECRET = prevSecret;
  }
});

test("Razorpay checkout and webhook signatures verify cleanly", () => {
  const prevSecret = process.env.RAZORPAY_KEY_SECRET;
  const prevWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  process.env.RAZORPAY_KEY_SECRET = "rzp_test_secret_123";
  process.env.RAZORPAY_WEBHOOK_SECRET = "rzp_webhook_secret_456";

  try {
    const checkoutSig = crypto
      .createHmac("sha256", "rzp_test_secret_123")
      .update("order_A|pay_B")
      .digest("hex");
    assert.equal(
      verifyRazorpayCheckoutSignature({
        orderId: "order_A",
        paymentId: "pay_B",
        signature: checkoutSig,
      }),
      true
    );
    assert.equal(
      verifyRazorpayCheckoutSignature({
        orderId: "order_A",
        paymentId: "pay_TAMPERED",
        signature: checkoutSig,
      }),
      false
    );

    const rawBody = JSON.stringify({ event: "payment.captured" });
    const whSig = crypto
      .createHmac("sha256", "rzp_webhook_secret_456")
      .update(rawBody)
      .digest("hex");
    assert.equal(verifyRazorpayWebhookSignature(rawBody, whSig), true);
    assert.equal(verifyRazorpayWebhookSignature(rawBody, "deadbeef"), false);
  } finally {
    process.env.RAZORPAY_KEY_SECRET = prevSecret;
    process.env.RAZORPAY_WEBHOOK_SECRET = prevWebhookSecret;
  }
});

test("PDF upload signature check & path traversal prevention", () => {
  assert.doesNotThrow(() =>
    validatePdfBuffer(Buffer.from("%PDF-1.4\n1 0 obj\n%%EOF"), "notes.pdf")
  );
  assert.throws(
    () => validatePdfBuffer(Buffer.from("MZfake-exe-payload"), "malware.pdf"),
    /not a valid PDF/
  );
  assert.throws(
    () => validatePdfBuffer(Buffer.from("%PDF-1.4"), "script.exe"),
    /Only \.pdf files/
  );
  assert.throws(
    () => resolveSafeStoragePath("../../etc/passwd"),
    /traversal/
  );
});

test("Public resource select never exposes protected file URLs", () => {
  const keys = Object.keys(PUBLIC_RESOURCE_SELECT);
  assert.equal(keys.includes("protectedFileUrl"), false);
  assert.equal(keys.includes("storagePath"), false);
  assert.equal(keys.includes("adShortlinkUrl"), false);
  assert.equal(keys.includes("driveFileId"), false);
  assert.equal(keys.includes("sampleStoragePath"), false);
});

test("10-15 page sample PDF slicer & filename/Drive folder parser", async () => {
  assert.equal(computeSamplePageLimit(16), 15);
  assert.equal(computeSamplePageLimit(240), 15);
  assert.equal(computeSamplePageLimit(14), 10);
  assert.equal(computeSamplePageLimit(8), 8);

  const hints = parseHintsFromFilename(
    "Quantitative_Aptitude_5th_Edition_by_Rakesh_Yadav_2024.pdf"
  );
  assert.equal(hints.title, "Quantitative Aptitude");
  assert.equal(hints.author, "Rakesh Yadav");
  assert.equal(hints.edition, "5th Edition");
  assert.equal(hints.year, 2024);

  assert.equal(
    extractDriveFolderId("https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQr"),
    "1AbCdEfGhIjKlMnOpQr"
  );
  assert.equal(
    isRoadmapCandidate({ fileName: "SSC_CGL_90Days_Roadmap.pdf" }),
    true
  );
  assert.equal(
    isRoadmapCandidate({ fileName: "CHSL_Plan.pdf", fromRoadmapsFolder: true }),
    true
  );
  assert.equal(
    isRoadmapCandidate({ fileName: "Blackbook_Vocabulary_2026.pdf", title: "Blackbook" }),
    false
  );
  assert.equal(
    isSyllabusCandidate({ fileName: "SSC_CGL_Tier1_Tier2_Syllabus_2026.pdf" }),
    true
  );
  assert.equal(
    isSyllabusCandidate({ fileName: "CGL_Pattern.pdf", fromSyllabusFolder: true }),
    true
  );

  const validMeta = SeoBookMetadataSchema.parse({
    title: "Test Book",
    author: "Author",
    publisher: "",
    yearPublished: 0,
    language: "English",
    edition: "",
    totalPages: 16,
    isbn: "",
    difficulty: "intermediate",
    description: "Long enough description for validation check on book metadata.",
    shortDescription: "Short SEO line",
    genre: ["Competitive Exam Prep"],
    subject: ["Mathematics"],
    examRelevance: ["SSC CGL"],
    tags: ["ssc cgl math pdf"],
  });
  assert.equal(validMeta.isbn, "");

  const fullPdf = await buildSamplePdfBuffer({
    title: "Unit Test 16-Page Book",
    exam: "SSC CGL",
    subject: "Mathematics",
    authorSource: "QA",
    summary: "Sample 16 page test PDF.",
    sections: [{ heading: "Algebra", bullets: ["Rule 1", "Rule 2"] }],
  });
  const sliced = await inspectAndCreateSamplePdf(fullPdf, "unit-test-slice");
  assert.equal(sliced.totalPages, 16);
  assert.equal(sliced.samplePageCount, 15);
  assert.ok(sliced.extractedTextSnippet.includes("SSCSTUDYPREPHUB"));
  assert.equal(sliced.thumbnailUrl, "/api/thumbnails/unit-test-slice");
  const thumbPayload = await readThumbnailPayload("unit-test-slice");
  assert.ok(thumbPayload && thumbPayload.kind === "buffer");
  assert.equal(thumbPayload.contentType, "image/webp");
  assert.equal(thumbPayload.buffer.subarray(0, 4).toString("hex"), "52494646");
});

test("Access evaluation rules across FREE, AD_SUPPORTED, and PREMIUM", () => {
  assert.equal(
    evaluateResourceAccess({ accessType: "FREE", user: null, alreadyUnlocked: false })
      .canDownloadDirectly,
    true
  );
  assert.equal(
    evaluateResourceAccess({
      accessType: "AD_SUPPORTED",
      user: null,
      alreadyUnlocked: false,
    }).requiresAdUnlock,
    true
  );
  assert.equal(
    evaluateResourceAccess({
      accessType: "PREMIUM",
      user: { id: "u1", membershipTier: "FREE", bookCredits: 0 },
      alreadyUnlocked: false,
    }).requiresPaidMembership,
    true
  );
  assert.equal(
    evaluateResourceAccess({
      accessType: "PREMIUM",
      user: { id: "u1", membershipTier: "LIFETIME", bookCredits: 0 },
      alreadyUnlocked: false,
    }).canDownloadDirectly,
    true
  );
});

test("Transactional 10-Books Pass credit deduction, re-download, concurrency & idempotent Razorpay fulfillment", async () => {
  const testEmail = `qa_${Date.now()}@example.com`;
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: "QA Aspirant",
      passwordHash: hashPassword("TestPass123"),
      role: "STUDENT",
      membershipTier: "FREE",
      bookCredits: 0,
    },
  });

  const anyCat = await prisma.category.findFirstOrThrow();
  const premiumResource = await prisma.resource.create({
    data: {
      slug: `qa-premium-${Date.now()}`,
      title: "QA Temporary Premium Resource",
      description: "Temporary resource for transactional credit testing.",
      examCategory: "SSC_CGL",
      resourceType: "BOOK",
      subject: "Mathematics",
      categoryId: anyCat.id,
      storageType: "EXTERNAL_URL",
      protectedFileUrl: "https://example.com/private/qa.pdf",
      accessType: "PREMIUM",
      isPublished: true,
    },
  });

  try {
    // 1. User with 0 credits cannot unlock premium resource
    await assert.rejects(
      () =>
        unlockResourceForUser({
          userId: user.id,
          resourceId: premiumResource.id,
          useCredit: true,
        }),
      (err: unknown) => err instanceof AccessError && err.code === "INSUFFICIENT_CREDITS"
    );

    // 2. Simulate verified ₹59 10-Books Pass order + idempotent webhook/callback
    const orderId = `order_qa_${Date.now()}`;
    await prisma.purchase.create({
      data: {
        userId: user.id,
        planType: "TEN_BOOKS",
        amountPaise: 5900,
        currency: "INR",
        status: "CREATED",
        razorpayOrderId: orderId,
        creditsGranted: 10,
      },
    });

    const firstFulfill = await fulfillRazorpayPurchase({
      razorpayOrderId: orderId,
      razorpayPaymentId: `pay_qa_${Date.now()}`,
      webhookEventId: `evt_${Date.now()}`,
    });
    assert.equal(firstFulfill.fulfilled, true);

    // Duplicate webhook / verify call must be idempotent and NOT add another 10 credits!
    const dupFulfill = await fulfillRazorpayPurchase({
      razorpayOrderId: orderId,
      razorpayPaymentId: `pay_qa_dup_${Date.now()}`,
    });
    assert.equal(dupFulfill.alreadyProcessed, true);

    const afterPurchase = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    assert.equal(afterPurchase.bookCredits, 10);
    assert.equal(afterPurchase.membershipTier, "TEN_BOOKS");

    // 3. Concurrent unlock requests for same resource must only deduct 1 credit total
    const results = await Promise.allSettled([
      unlockResourceForUser({
        userId: user.id,
        resourceId: premiumResource.id,
        useCredit: true,
      }),
      unlockResourceForUser({
        userId: user.id,
        resourceId: premiumResource.id,
        useCredit: true,
      }),
    ]);

    const afterConcurrent = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    assert.equal(afterConcurrent.bookCredits, 9);
    assert.ok(results.some((r) => r.status === "fulfilled"));

    // 4. Subsequent re-download of already unlocked resource deducts 0 credits
    const redownload = await unlockResourceForUser({
      userId: user.id,
      resourceId: premiumResource.id,
      useCredit: true,
    });
    assert.equal(redownload.creditDeducted, false);
    assert.equal(redownload.remainingCredits, 9);
    assert.ok(redownload.downloadUrl.startsWith("/api/download/"));
  } finally {
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.resource.delete({ where: { id: premiumResource.id } }).catch(() => {});
    await prisma.$disconnect();
  }
});
