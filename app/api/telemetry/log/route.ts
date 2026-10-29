import { NextRequest, NextResponse } from "next/server";
import { loki, LokiLogEntry } from "@/lib/loki";

export async function POST(req: NextRequest) {
  try {
    const entry = (await req.json()) as LokiLogEntry;
    if (entry && entry.message) {
      loki.log({
        level: entry.level || "info",
        message: entry.message,
        traceId: entry.traceId,
        data: {
          ...entry.data,
          client_ip: req.headers.get("x-forwarded-for") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
        },
      });
      await loki.flush();
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
