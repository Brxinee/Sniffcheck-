import { AppShell } from "@/components/app-shell";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Media() {
  await requireOwner();
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <AppShell>
      <h1 className="mb-6 text-4xl font-black">Media library</h1>
      <form action="/api/media" method="post" encType="multipart/form-data" className="glass rounded-3xl p-5">
        <input name="file" type="file" required />
        <input name="folder" placeholder="Folder" className="mt-3 rounded-xl bg-white/10 p-2 md:ml-3 md:mt-0" />
        <button className="mt-3 rounded-xl bg-primary px-4 py-2 font-bold text-black md:ml-3 md:mt-0">Upload</button>
        <p className="mt-3 text-sm text-white/50">Drag a file onto the picker, then upload. Search, rename, and delete actions are backed by the media API.</p>
      </form>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {assets.map((asset) => <article key={asset.id} className="glass rounded-2xl p-4"><p className="font-bold">{asset.name}</p><p className="text-sm text-white/50">{asset.folder} · {asset.type}</p><a className="text-primary" href={asset.url}>Preview</a></article>)}
      </div>
    </AppShell>
  );
}
