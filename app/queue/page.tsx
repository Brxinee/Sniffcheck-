import { AppShell } from "@/components/app-shell";
import { PostList } from "@/components/post-list";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function QueuePage() {
  await requireOwner();
  const posts = await prisma.post.findMany({ where: { status: { in: ["SCHEDULED", "PUBLISHING"] } }, orderBy: { scheduledAt: "asc" } });
  return <AppShell><h1 className="mb-6 text-4xl font-black">Queue</h1><PostList posts={posts} /></AppShell>;
}
