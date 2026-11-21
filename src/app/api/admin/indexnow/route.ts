import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { submitToIndexNow } from "@/lib/indexnow";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    // Also allow secret header authorization for cron/automated jobs
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    "https://sscstudyprephub-rpqv.vercel.app";

  const staticUrls = [
    `${baseUrl}/`,
    `${baseUrl}/books`,
    `${baseUrl}/roadmaps`,
    `${baseUrl}/pyqs`,
    `${baseUrl}/syllabus`,
    `${baseUrl}/typing`,
    `${baseUrl}/typing/exam`,
    `${baseUrl}/typing/rules`,
    `${baseUrl}/about`,
    `${baseUrl}/contact`,
    `${baseUrl}/copyright-dmca`,
  ];

  // Include all 365 typing chapters
  for (let i = 1; i <= 365; i++) {
    staticUrls.push(`${baseUrl}/typing/${i}`);
  }

  // Include dynamic resources
  const resources = await prisma.resource.findMany({
    where: { isPublished: true },
    select: { slug: true },
    take: 500,
  });

  const resourceUrls = resources.map((r) => `${baseUrl}/resources/${r.slug}`);
  const allUrls = [...staticUrls, ...resourceUrls];

  const result = await submitToIndexNow(allUrls);

  return NextResponse.json({
    submitted: allUrls.length,
    indexNowResponse: result,
  });
}
