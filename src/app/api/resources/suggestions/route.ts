import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const limit = checkRateLimit(`suggest:${ip}`, 60, 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ suggestions: [] }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const matches = await prisma.resource.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: q } },
        { subject: { contains: q } },
        { description: { contains: q } },
      ],
    },
    select: {
      slug: true,
      title: true,
      subject: true,
      examCategory: true,
      accessType: true,
    },
    orderBy: [{ downloadCount: "desc" }],
    take: 6,
  });

  return NextResponse.json({ suggestions: matches });
}
