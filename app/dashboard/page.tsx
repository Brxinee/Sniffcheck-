import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Dashboard() {
  await requireOwner();
  const [total, scheduled, publishing, published, failed, drafts, next] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "SCHEDULED" } }),
    prisma.post.count({ where: { status: "PUBLISHING" } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "FAILED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.findFirst({ where: { status: "SCHEDULED", scheduledAt: { gte: new Date() } }, orderBy: { scheduledAt: "asc" } }),
  ]);

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-primary">SmelloffIndia scheduler</p>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">Premium Telegram command center</h1>
        </div>
        <Link href="/posts/new" className="rounded-full bg-primary px-6 py-3 font-bold text-black">Create post</Link>
      </div>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Scheduled Posts" value={scheduled} />
        <StatCard label="Publishing Locks" value={publishing} />
        <StatCard label="Published Posts" value={published} />
        <StatCard label="Failed Posts" value={failed} />
        <StatCard label="Drafts" value={drafts} />
        <StatCard label="Total Posts" value={total} />
        <StatCard label="Next Scheduled Post" value={next?.scheduledAt?.toLocaleString() ?? "None"} />
        <StatCard label="Telegram Status" value={process.env.TELEGRAM_BOT_TOKEN ? "Configured" : "Missing token"} />
      </section>
    </AppShell>
  );
}
