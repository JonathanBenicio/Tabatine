import { NextResponse } from "next/server";

const globalWithWebhooks = global as typeof globalThis & {
  webhookEvents?: any[];
};

export async function GET() {
  const events = globalWithWebhooks.webhookEvents || [];
  return NextResponse.json(events);
}
