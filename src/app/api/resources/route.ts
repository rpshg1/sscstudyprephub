import { NextResponse } from "next/server";
import { listPublicResources } from "@/lib/resources";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const items = await listPublicResources({
    q: searchParams.get("q") ?? undefined,
    exam: searchParams.get("exam") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    access: searchParams.get("access") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    take: Number(searchParams.get("limit")) || 60,
  });

  return NextResponse.json({ items });
}
