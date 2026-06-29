import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_CHANNEL_ID: z.string().min(1).optional(),
  SCHEDULER_SECRET: z.string().min(24).optional(),
  OWNER_EMAIL: z.string().email().optional(),
  OWNER_PASSWORD_HASH: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}

export function getSchedulerSecret() {
  const secret = process.env.SCHEDULER_SECRET;
  if (!secret) throw new Error("SCHEDULER_SECRET is not configured");
  return secret;
}
