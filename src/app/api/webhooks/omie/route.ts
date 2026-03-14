import { NextResponse } from "next/server";

// Using a global variable that persists across hot-reloads and request cycles as much as possible in dev.
// Note: In production Vercel, this will reset frequently. 
const globalWithWebhooks = global as typeof globalThis & {
  webhookEvents?: any[];
};

if (!globalWithWebhooks.webhookEvents) {
  globalWithWebhooks.webhookEvents = [];
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Add timestamp and ID
    const event = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      payload,
    };

    // Store the event (keep last 50)
    globalWithWebhooks.webhookEvents!.unshift(event);
    if (globalWithWebhooks.webhookEvents!.length > 50) {
      globalWithWebhooks.webhookEvents!.pop();
    }

    console.log("Webhook received:", event);

    return NextResponse.json({ status: "success", received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ status: "error", message: "Invalid payload" }, { status: 400 });
  }
}
