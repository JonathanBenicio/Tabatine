import { NextResponse } from "next/server";

const globalWithWebhooks = global as typeof globalThis & {
  webhookEvents?: Record<string, unknown>[];
};

export async function GET() {
  const events = globalWithWebhooks.webhookEvents || [];
  return NextResponse.json(events);
}
