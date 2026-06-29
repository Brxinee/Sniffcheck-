import { prisma } from "@/lib/db";

type TelegramResult = {
  ok: boolean;
  result?: { message_id?: number } | Array<{ message_id?: number }>;
  description?: string;
};

const telegramEndpoint = (method: string) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return `https://api.telegram.org/bot${token}/${method}`;
};

function extractMessageIds(result: TelegramResult) {
  const value = result.result;
  if (Array.isArray(value)) return value.map((item) => item.message_id).filter(Boolean).map(String);
  return value?.message_id ? [String(value.message_id)] : [];
}

export async function publishPost(postId: string) {
  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) throw new Error("TELEGRAM_CHANNEL_ID is not configured");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { media: { include: { media: true }, orderBy: { order: "asc" } } },
  });

  if (!post) throw new Error("Post not found");

  const media = post.media.map((item) => item.media);
  const parseMode = post.parseMode === "MARKDOWNV2" ? "MarkdownV2" : "HTML";
  let method = "sendMessage";
  let payload: Record<string, unknown> = {
    chat_id: channelId,
    parse_mode: parseMode,
    disable_notification: post.disableNotification,
    reply_markup: post.buttons ? { inline_keyboard: post.buttons } : undefined,
  };

  if (media.length > 1) {
    method = "sendMediaGroup";
    payload = {
      chat_id: channelId,
      disable_notification: post.disableNotification,
      media: media.map((item, index) => ({
        type: item.type.toLowerCase(),
        media: item.url,
        caption: index === 0 ? post.body : undefined,
        parse_mode: parseMode,
      })),
    };
  } else if (media[0]?.type === "IMAGE") {
    method = "sendPhoto";
    payload = { ...payload, photo: media[0].url, caption: post.body };
  } else if (media[0]?.type === "VIDEO") {
    method = "sendVideo";
    payload = { ...payload, video: media[0].url, caption: post.body };
  } else if (media[0]?.type === "DOCUMENT") {
    method = "sendDocument";
    payload = { ...payload, document: media[0].url, caption: post.body };
  } else {
    payload = { ...payload, text: post.body };
  }

  const response = await fetch(telegramEndpoint(method), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await response.json()) as TelegramResult;
  const messageIds = extractMessageIds(json);

  await prisma.publishLog.create({
    data: {
      postId,
      success: response.ok && json.ok,
      response: json,
      error: response.ok && json.ok ? undefined : json.description ?? JSON.stringify(json),
      retry: post.retryCount,
      telegramId: messageIds.join(",") || undefined,
    },
  });

  if (!response.ok || !json.ok) throw new Error(json.description ?? JSON.stringify(json));

  return { response: json, messageIds };
}
