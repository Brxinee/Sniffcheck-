"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { runScheduler } from "@/lib/scheduler/run-scheduler";
import { postSchema } from "@/lib/validators";

export async function createPost(formData: FormData) {
  const data = postSchema.parse({
    title: formData.get("title"),
    body: formData.get("body"),
    status: formData.get("status"),
    parseMode: formData.get("parseMode"),
    scheduledAt: String(formData.get("scheduledAt") || ""),
    timezone: formData.get("timezone") || "UTC",
    silent: formData.get("silent") === "on",
    disableNotification: formData.get("disableNotification") === "on",
    recurrenceFrequency: formData.get("recurrenceFrequency") || "NONE",
    recurrenceInterval: formData.get("recurrenceInterval") || undefined,
  });

  await prisma.post.create({
    data: { ...data, scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function publishNow(formData: FormData) {
  const data = postSchema.parse({
    title: formData.get("title"),
    body: formData.get("body"),
    status: "SCHEDULED",
    parseMode: formData.get("parseMode"),
    scheduledAt: new Date().toISOString(),
    timezone: formData.get("timezone") || "UTC",
    silent: formData.get("silent") === "on",
    disableNotification: formData.get("disableNotification") === "on",
    recurrenceFrequency: "NONE",
  });

  await prisma.post.create({ data: { ...data, scheduledAt: new Date() } });
  await runScheduler();
  revalidatePath("/dashboard");
  redirect("/published");
}

export async function duplicatePost(id: string) {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;
  await prisma.post.create({
    data: {
      title: `${post.title} copy`,
      body: post.body,
      status: "DRAFT",
      parseMode: post.parseMode,
      timezone: post.timezone,
      silent: post.silent,
      disableNotification: post.disableNotification,
      buttons: post.buttons ?? undefined,
      poll: post.poll ?? undefined,
      recurrenceFrequency: post.recurrenceFrequency,
      recurrenceInterval: post.recurrenceInterval,
    },
  });
  revalidatePath("/dashboard");
}

export async function deletePost(id: string) {
  await prisma.post.delete({ where: { id } });
  revalidatePath("/dashboard");
}
