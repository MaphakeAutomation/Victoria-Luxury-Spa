// =========================================================
// VICTORIAS LUXURY SPA & WELLNESS — Yoco Webhook Handler
// Supabase Edge Function (Deno)
//
// Register this function's URL in your Yoco Dashboard as the webhook
// endpoint for payment events (Settings > Webhooks).
//
// Deploy with:  supabase functions deploy yoco-webhook --no-verify-jwt
// (--no-verify-jwt because Yoco, not a logged-in user, calls this URL)
//
// !! IMPORTANT — VERIFY BEFORE GOING LIVE !!
// Recent Yoco webhooks are signed using the Svix scheme (headers
// "svix-id", "svix-timestamp", "svix-signature"). Confirm this against
// your Yoco Dashboard's webhook settings and the Checkout API reference
// before relying on it — an unverified webhook should NEVER be trusted
// to mark a deposit as paid in production. Consider adding the "svix"
// npm package (available via esm.sh) to verify signatures properly;
// the check below is a placeholder that verifies the payload structure
// but not yet a cryptographic signature.
// =========================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const event = await req.json();

    // TODO before going live: verify the Svix signature headers here.
    // const svixId = req.headers.get("svix-id");
    // const svixTimestamp = req.headers.get("svix-timestamp");
    // const svixSignature = req.headers.get("svix-signature");
    // ... verify using your webhook signing secret from the Yoco Dashboard ...

    const bookingId = event?.payload?.metadata?.booking_id ?? event?.metadata?.booking_id;
    const paymentStatus = event?.type || event?.payload?.status;

    if (!bookingId) {
      console.warn("Webhook received with no booking_id in metadata:", JSON.stringify(event));
      return new Response("ok", { status: 200 }); // acknowledge anyway so Yoco doesn't retry forever
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const isSuccess = String(paymentStatus).toLowerCase().includes("succeed") || String(paymentStatus).toLowerCase().includes("success");

    await supabase
      .from("bookings")
      .update({
        status: isSuccess ? "confirmed" : "pending",
        yoco_payment_status: String(paymentStatus),
      })
      .eq("id", bookingId);

    // Optional: notify n8n so it can send the confirmation email / free up
    // slot-alert automations. Set N8N_BOOKING_WEBHOOK_URL as a function secret.
    const n8nUrl = Deno.env.get("N8N_BOOKING_WEBHOOK_URL");
    if (n8nUrl && isSuccess) {
      fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, event: "deposit_paid" }),
      }).catch((e) => console.error("n8n notify failed:", e));
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("error", { status: 500 });
  }
});
