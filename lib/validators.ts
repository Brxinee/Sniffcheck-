import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(2).max(140),
  body: z.string().min(1).max(4096),
  status: z.enum(["DRAFT", "SCHEDULED"]),
  parseMode: z.enum(["HTML", "MARKDOWNV2"]),
  scheduledAt: z.string().optional(),
  timezone: z.string().min(1).default("Asia/Kolkata"),
  silent: z.boolean().default(false),
  disableNotification: z.boolean().default(false),
  recurrenceFrequency: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "EVERY_X_HOURS"]).default("NONE"),
  recurrenceInterval: z.coerce.number().int().positive().optional(),
});
