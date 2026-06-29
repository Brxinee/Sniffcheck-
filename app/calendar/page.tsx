import { AppShell } from "@/components/app-shell";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Calendar() {
  await requireOwner();
  const posts = await prisma.post.findMany({ where: { scheduledAt: { not: null } }, orderBy: { scheduledAt: "asc" }, take: 60 });
  return (
    <AppShell>
      <h1 className="mb-6 text-4xl font-black">Calendar</h1>
      <div className="grid gap-3 md:grid-cols-7">
        {posts.map((post) => <div key={post.id} className="glass rounded-2xl p-4"><p className="text-primary">{post.scheduledAt?.toDateString()}</p><p className="font-bold">{post.title}</p><p className="text-sm text-white/50">{post.status}</p></div>)}
      </div>
    </AppShell>
  );
}
