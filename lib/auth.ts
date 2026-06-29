import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const cookieName = "smelloff_session";
const ttl = 60 * 60 * 24 * 7;

function secret() { return process.env.SESSION_SECRET ?? "dev-secret-change-me"; }
function sign(value: string) { return crypto.createHmac("sha256", secret()).update(value).digest("hex"); }

export async function login(email: string, password: string) {
  const expectedEmail = process.env.OWNER_EMAIL;
  const hash = process.env.OWNER_PASSWORD_HASH;
  if (!expectedEmail || !hash || email !== expectedEmail || !(await bcrypt.compare(password, hash))) return false;
  const payload = `${email}.${Date.now()}`;
  (await cookies()).set(cookieName, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: ttl, path: "/" });
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
