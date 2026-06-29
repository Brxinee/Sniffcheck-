import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

const cookieName = "smelloff_session";
const ttl = 60 * 60 * 24 * 7;

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return secret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", sessionSecret()).update(value).digest("hex");
}

export async function login(email: string, password: string) {
  const expectedEmail = process.env.OWNER_EMAIL;
  const hash = process.env.OWNER_PASSWORD_HASH;
  if (!expectedEmail || !hash || email !== expectedEmail || !(await bcrypt.compare(password, hash))) return false;
  const payload = `${email}.${Date.now()}`;
  const signature = sign(payload);
  (await cookies()).set(cookieName, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ttl,
    path: "/",
  });
  return true;
}

export async function requireOwner() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) redirect("/login");
  const parts = token.split(".");
  const signature = parts.pop();
  const payload = parts.join(".");
  if (!signature || sign(payload) !== signature) redirect("/login");
}
