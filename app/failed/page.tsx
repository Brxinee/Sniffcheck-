import { AppShell } from "@/components/app-shell";
import { PostList } from "@/components/post-list";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function FailedPage() {
  await requireOwner();
  const posts = await prisma.post.findMany({ where: { status: "FAILED" }, orderBy: { updatedAt: "desc" } });
  return <AppShell><h1 className="mb-6 text-4xl font-black">Failed</h1><PostList posts={posts} /></AppShell>;
}
