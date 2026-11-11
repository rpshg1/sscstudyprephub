import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  getDriveSyncJobStatus,
  getGoogleDriveConfigStatus,
} from "@/lib/google-drive";
import { AdminDashboardClient } from "@/components/admin-dashboard-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "SSPH Administrator Portal",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const admin = await requireAdmin("/login?next=/admin");

  const [
    totalResources,
    totalUsers,
    premiumUsers,
    downloadAgg,
    revenueAgg,
    resources,
    categories,
    users,
    purchases,
    methodGroups,
    adSessionGroups,
    complaints,
    driveSyncLogs,
  ] = await Promise.all([
    prisma.resource.count(),
    prisma.user.count(),
    prisma.user.count({
      where: { membershipTier: { in: ["TEN_BOOKS", "LIFETIME"] } },
    }),
    prisma.resource.aggregate({ _sum: { downloadCount: true } }),
    prisma.purchase.aggregate({
      where: { status: "PAID" },
      _sum: { amountPaise: true },
    }),
    prisma.resource.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ createdAt: "desc" }],
    }),
    prisma.category.findMany({
      include: { _count: { select: { resources: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        membershipTier: true,
        bookCredits: true,
        isActive: true,
        createdAt: true,
        _count: { select: { downloads: true, purchases: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchase.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.downloadLog.groupBy({
      by: ["method"],
      _count: { _all: true },
    }),
    prisma.adSession.groupBy({
      by: ["provider", "status"],
      _count: { _all: true },
    }),
    prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.driveSyncLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  const driveConfig = getGoogleDriveConfigStatus();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <AdminDashboardClient
        currentAdminId={admin.id}
        stats={{
          totalResources,
          totalUsers,
          premiumUsers,
          totalDownloads: downloadAgg._sum.downloadCount ?? 0,
          totalRevenueInr: Math.round((revenueAgg._sum.amountPaise ?? 0) / 100),
        }}
        resources={resources}
        categories={categories}
        users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
        purchases={purchases.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        }))}
        analytics={{
          methodBreakdown: methodGroups.map((g) => ({
            method: g.method,
            count: g._count._all,
          })),
          adSessionStats: adSessionGroups.map((g) => ({
            provider: g.provider,
            status: g.status,
            count: g._count._all,
          })),
        }}
        complaints={complaints.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
        }))}
        driveSync={{
          config: driveConfig,
          shrinkMeConfigured: Boolean(process.env.SHRINKME_API_TOKEN?.trim()),
          geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
          activeJob: getDriveSyncJobStatus(),
          logs: driveSyncLogs.map((l) => ({
            ...l,
            createdAt: l.createdAt.toISOString(),
          })),
        }}
      />
    </div>
  );
}
