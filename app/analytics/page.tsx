import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AnalyticsPage() {
  await requireOwner();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [published30, failed30, logs, media] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED", publishedAt: { gte: since } } }),
    prisma.post.count({ where: { status: "FAILED", updatedAt: { gte: since } } }),
    prisma.publishLog.count({ where: { createdAt: { gte: since } } }),
    prisma.mediaAsset.count(),
  ]);
  return <AppShell><h1 className="mb-6 text-4xl font-black">Analytics</h1><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Published in 30 days" value={published30} /><StatCard label="Failed in 30 days" value={failed30} /><StatCard label="API Logs in 30 days" value={logs} /><StatCard label="Media Assets" value={media} /></section></AppShell>;
}
