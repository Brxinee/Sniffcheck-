"use client";

import { useMemo, useState } from "react";
import { createPost, publishNow } from "@/app/posts/actions";

export function PostEditor() {
  const [body, setBody] = useState("");
  const [parseMode, setParseMode] = useState("HTML");
  const hashtags = useMemo(() => body.match(/#[\p{L}\p{N}_]+/gu) ?? [], [body]);

  return (
    <form action={createPost} className="mx-auto max-w-5xl glass rounded-[2rem] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-primary">Post editor</p>
          <h1 className="text-3xl font-black">Create scheduled post</h1>
        </div>
        <button formAction={publishNow} className="rounded-xl bg-white px-5 py-3 font-bold text-black">Publish Now</button>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <section>
          <input name="title" placeholder="Internal title" className="w-full rounded-xl bg-white/10 p-3" required />
          <textarea name="body" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Telegram body supports HTML or MarkdownV2. Add emoji ✨ and hashtags #SmelloffIndia." rows={10} className="mt-3 w-full rounded-xl bg-white/10 p-3" required />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <select name="status" className="rounded-xl bg-white/10 p-3" defaultValue="SCHEDULED"><option value="SCHEDULED">Schedule</option><option value="DRAFT">Save Draft</option></select>
            <select name="parseMode" value={parseMode} onChange={(event) => setParseMode(event.target.value)} className="rounded-xl bg-white/10 p-3"><option value="HTML">HTML</option><option value="MARKDOWNV2">MarkdownV2</option></select>
            <input name="scheduledAt" type="datetime-local" className="rounded-xl bg-white/10 p-3" />
            <input name="timezone" defaultValue="Asia/Kolkata" className="rounded-xl bg-white/10 p-3" />
            <select name="recurrenceFrequency" className="rounded-xl bg-white/10 p-3"><option value="NONE">No recurrence</option><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="EVERY_X_HOURS">Every X hours</option></select>
            <input name="recurrenceInterval" type="number" min="1" placeholder="X hours" className="rounded-xl bg-white/10 p-3" />
          </div>
          <label className="mt-4 block"><input name="disableNotification" type="checkbox" /> Disable notifications</label>
          <label className="mt-2 block"><input name="silent" type="checkbox" /> Silent send</label>
          <div className="mt-6 flex flex-wrap gap-3"><button className="rounded-xl bg-primary px-6 py-3 font-bold text-black">Schedule / Save</button></div>
        </section>
        <aside className="rounded-3xl bg-black/35 p-5">
          <p className="text-sm text-white/50">{parseMode} preview</p>
          <article className="mt-3 min-h-52 whitespace-pre-wrap rounded-2xl bg-white/10 p-4">{body || "Your Telegram preview appears here."}</article>
          <p className="mt-4 text-sm text-white/60">Characters: {body.length}</p>
          <p className="mt-2 text-sm text-white/60">Hashtags: {hashtags.join(" ") || "None"}</p>
        </aside>
      </div>
    </form>
  );
}
