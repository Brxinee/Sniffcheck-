import { AppShell } from "@/components/app-shell";
import { requireOwner } from "@/lib/auth";

export default async function Settings() {
  await requireOwner();
  return (
    <AppShell>
      <h1 className="mb-6 text-4xl font-black">Settings</h1>
      <div className="glass rounded-3xl p-5">
        <p>Telegram bot token: {process.env.TELEGRAM_BOT_TOKEN ? "Configured" : "Missing"}</p>
        <p>Channel ID: {process.env.TELEGRAM_CHANNEL_ID ? "Configured" : "Missing"}</p>
        <p>Scheduler secret: {process.env.SCHEDULER_SECRET ? "Configured" : "Missing"}</p>
        <p className="mt-4 text-white/50">Secrets are read server-side only and never exposed to the browser.</p>
      </div>
    </AppShell>
  );
}
