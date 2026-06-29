import { NextRequest, NextResponse } from "next/server";
import { getSchedulerSecret } from "@/lib/config";
import { runScheduler } from "@/lib/scheduler/run-scheduler";

export async function POST(request: NextRequest) {
  const expected = `Bearer ${getSchedulerSecret()}`;
  if (request.headers.get("authorization") !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await runScheduler();
  return NextResponse.json(stats);
}
