import { AppShell } from "@/components/app-shell";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Logs() {
  await requireOwner();
  const logs = await prisma.publishLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return <AppShell><h1 className="mb-6 text-4xl font-black">Publish logs</h1><div className="space-y-3">{logs.map((log) => <pre key={log.id} className="overflow-auto rounded-2xl bg-white/10 p-4 text-xs">{JSON.stringify(log, null, 2)}</pre>)}</div></AppShell>;
}
