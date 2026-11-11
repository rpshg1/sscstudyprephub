import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { StudentDashboardClient } from "@/components/student-dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Manage your SSPH membership, remaining book credits, downloads, and saved study resources.",
};

export default async function DashboardPage() {
  const user = await requireUser("/login?next=/dashboard");

  const [downloads, unlocks, saved, purchases] = await Promise.all([
    prisma.downloadLog.findMany({
      where: { userId: user.id },
      include: {
        resource: {
          select: {
            id: true,
            slug: true,
            title: true,
            subject: true,
            examCategory: true,
            fileSizeLabel: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.resourceUnlock.findMany({
      where: { userId: user.id },
      include: {
        resource: {
          select: {
            id: true,
            slug: true,
            title: true,
            subject: true,
            examCategory: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedResource.findMany({
      where: { userId: user.id },
      include: {
        resource: {
          select: {
            id: true,
            slug: true,
            title: true,
            subject: true,
            examCategory: true,
            accessType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchase.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <StudentDashboardClient
        user={user}
        downloads={downloads.map((d) => ({
          ...d,
          createdAt: d.createdAt.toISOString(),
        }))}
        unlocks={unlocks.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        }))}
        saved={saved.map((s) => s.resource)}
        purchases={purchases.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
