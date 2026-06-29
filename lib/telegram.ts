import { prisma } from "@/lib/db";

const endpoint = (method: string) => `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;

export async function publishPost(postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId }, include: { media: { include: { media: true }, orderBy: { order: "asc" } } } });
  if (!post) throw new Error("Post not found");
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) throw new Error("Telegram env vars are missing");
  const media = post.media.map((m) => m.media);
  let method = "sendMessage";
  let payload: Record<string, unknown> = { chat_id: process.env.TELEGRAM_CHANNEL_ID, parse_mode: post.parseMode === "MARKDOWNV2" ? "MarkdownV2" : "HTML", disable_notification: post.disableNotification, protect_content: post.silent, reply_markup: post.buttons ? { inline_keyboard: post.buttons } : undefined };
  if (media.length > 1) { method = "sendMediaGroup"; payload = { chat_id: process.env.TELEGRAM_CHANNEL_ID, media: media.map((m, i) => ({ type: m.type.toLowerCase(), media: m.url, caption: i === 0 ? post.body : undefined, parse_mode: payload.parse_mode })) }; }
  else if (media[0]?.type === "IMAGE") { method = "sendPhoto"; payload = { ...payload, photo: media[0].url, caption: post.body }; }
  else if (media[0]?.type === "VIDEO") { method = "sendVideo"; payload = { ...payload, video: media[0].url, caption: post.body }; }
  else if (media[0]?.type === "DOCUMENT") { method = "sendDocument"; payload = { ...payload, document: media[0].url, caption: post.body }; }
  else payload = { ...payload, text: post.body };
  const res = await fetch(endpoint(method), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  const json = await res.json();
  await prisma.publishLog.create({ data: { postId, success: res.ok, response: json, error: res.ok ? undefined : JSON.stringify(json), retry: post.retryCount } });
  if (!res.ok) throw new Error(JSON.stringify(json));
  await prisma.post.update({ where: { id: postId }, data: { status: "PUBLISHED", publishedAt: new Date() } });
  return json;
}
