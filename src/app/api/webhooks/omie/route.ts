import { NextResponse } from "next/server";
import { validateOmieWebhookSignature } from "@/lib/webhook-validator";
import { createClient } from "@/utils/supabase/server";
import { apiError } from "@/utils/api-error";

export async function POST(request: Request) {
  try {
    // Extract raw body for signature validation
    const rawBody = await request.text();
    const signature = request.headers.get('X-Omie-Signature');
    const secret = process.env.OMIE_WEBHOOK_SECRET;

    if (!secret) {
      console.error("OMIE_WEBHOOK_SECRET is not defined in environment variables");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    // Validate Omie signature
    if (!validateOmieWebhookSignature(rawBody, signature, secret)) {
      console.warn("Invalid Omie webhook signature received");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.event || "unknown";
    
    // Store in Supabase
    const supabase = await createClient();
    const { error } = await supabase
      .from('webhook_events')
      .insert({
        event: eventName,
        payload: payload,
        status: 'Pending',
        message_id: payload.message_id || null
      });

    if (error) {
      throw error;
    }

    console.log(`Webhook received and stored: ${eventName}`);

    return NextResponse.json({ status: "success", received: true });
  } catch (error: unknown) {
    return apiError(error, 'POST /api/webhooks/omie');
  }
}
