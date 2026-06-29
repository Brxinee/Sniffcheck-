import { del, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const updateMediaSchema = z.object({ id: z.string().min(1), name: z.string().min(1).optional(), folder: z.string().min(1).optional() });
const deleteMediaSchema = z.object({ id: z.string().min(1) });

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const assets = await prisma.mediaAsset.findMany({
    where: query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { folder: { contains: query, mode: "insensitive" } }] } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assets);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  const blob = await put(file.name, file, { access: "public" });
  const type: "IMAGE" | "VIDEO" | "DOCUMENT" = file.type.startsWith("image/") ? "IMAGE" : file.type.startsWith("video/") ? "VIDEO" : "DOCUMENT";
  const asset = await prisma.mediaAsset.create({
    data: { name: file.name, url: blob.url, type, size: file.size, folder: String(form.get("folder") || "General") },
  });
  return NextResponse.json(asset);
}

export async function PATCH(request: Request) {
  const data = updateMediaSchema.parse(await request.json());
  const asset = await prisma.mediaAsset.update({ where: { id: data.id }, data: { name: data.name, folder: data.folder } });
  return NextResponse.json(asset);
}

export async function DELETE(request: Request) {
  const data = deleteMediaSchema.parse(await request.json());
  const asset = await prisma.mediaAsset.delete({ where: { id: data.id } });
  await del(asset.url);
  return NextResponse.json({ deleted: true });
}
