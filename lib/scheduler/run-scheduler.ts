import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { publishPost } from "@/lib/telegram";

export type SchedulerStats = {
  processed: number;
  published: number;
  failed: number;
  skipped: number;
};

const MAX_RETRIES = 3;
const STALE_LOCK_MINUTES = 30;

function nextRecurringDate(date: Date, frequency: string, interval?: number | null) {
  const next = new Date(date);
  if (frequency === "DAILY") next.setDate(next.getDate() + 1);
  if (frequency === "WEEKLY") next.setDate(next.getDate() + 7);
  if (frequency === "MONTHLY") next.setMonth(next.getMonth() + 1);
  if (frequency === "EVERY_X_HOURS") next.setHours(next.getHours() + (interval || 1));
  return next;
}

async function releaseStaleLocks(now: Date) {
  const staleBefore = new Date(now.getTime() - STALE_LOCK_MINUTES * 60 * 1000);
  await prisma.post.updateMany({
    where: { status: "PUBLISHING", publishStartedAt: { lt: staleBefore }, retryCount: { lt: MAX_RETRIES } },
    data: { status: "SCHEDULED", publishLockId: null, publishStartedAt: null },
  });
}

export async function runScheduler(now = new Date()): Promise<SchedulerStats> {
  await releaseStaleLocks(now);

  const duePosts = await prisma.post.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: now }, retryCount: { lt: MAX_RETRIES } },
    orderBy: { scheduledAt: "asc" },
    take: 100,
  });

  const stats: SchedulerStats = { processed: duePosts.length, published: 0, failed: 0, skipped: 0 };

  for (const post of duePosts) {
    const lockId = randomUUID();
    const claim = await prisma.post.updateMany({
      where: { id: post.id, status: "SCHEDULED", publishedAt: null, publishLockId: null },
      data: { status: "PUBLISHING", publishLockId: lockId, publishStartedAt: now },
    });

    if (claim.count !== 1) {
      stats.skipped += 1;
      continue;
    }

    try {
      const result = await publishPost(post.id);
      await prisma.post.updateMany({
        where: { id: post.id, publishLockId: lockId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          publishLockId: null,
          publishStartedAt: null,
          lastError: null,
          telegramMessageIds: result.messageIds,
        },
      });

      if (post.recurrenceFrequency !== "NONE" && post.scheduledAt) {
        await prisma.post.create({
          data: {
            title: post.title,
            body: post.body,
            status: "SCHEDULED",
            parseMode: post.parseMode,
            scheduledAt: nextRecurringDate(post.scheduledAt, post.recurrenceFrequency, post.recurrenceInterval),
            timezone: post.timezone,
            silent: post.silent,
            disableNotification: post.disableNotification,
            buttons: post.buttons ?? undefined,
            poll: post.poll ?? undefined,
            recurrenceFrequency: post.recurrenceFrequency,
            recurrenceInterval: post.recurrenceInterval,
          },
        });
      }

      stats.published += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown publish error";
      const retryCount = post.retryCount + 1;
      await prisma.post.updateMany({
        where: { id: post.id, publishLockId: lockId },
        data: {
          status: retryCount >= MAX_RETRIES ? "FAILED" : "SCHEDULED",
          retryCount,
          lastError: message,
          publishLockId: null,
          publishStartedAt: null,
        },
      });
      await prisma.publishLog.create({
        data: { postId: post.id, success: false, error: message, retry: retryCount },
      });
      stats.failed += 1;
    }
  }

  return stats;
}
