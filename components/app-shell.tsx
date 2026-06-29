import Link from "next/link";

const navItems = [
  ["Dashboard", "/dashboard"],
  ["Calendar", "/calendar"],
  ["Queue", "/queue"],
  ["Drafts", "/drafts"],
  ["Published", "/published"],
  ["Failed", "/failed"],
  ["Analytics", "/analytics"],
  ["Logs", "/logs"],
  ["Media Library", "/media"],
  ["Settings", "/settings"],
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background p-4 text-white md:p-8">
      <aside className="glass fixed inset-x-3 bottom-3 z-20 flex gap-2 overflow-x-auto rounded-3xl p-2 md:inset-y-6 md:left-6 md:right-auto md:w-64 md:flex-col md:p-4">
        <Link href="/dashboard" className="mb-2 hidden text-2xl font-black text-primary md:block">SmelloffIndia</Link>
        {navItems.map(([label, href]) => (
          <Link key={href} href={href} className="whitespace-nowrap rounded-2xl px-4 py-3 text-sm text-white/75 transition hover:bg-primary hover:text-black">
            {label}
          </Link>
        ))}
      </aside>
      <section className="pb-28 md:ml-72 md:pb-0">{children}</section>
    </main>
  );
}
