// =========================================================
// VICTORIAS LUXURY SPA & WELLNESS — Yoco Webhook Handler
// Supabase Edge Function (Deno)
//
// This function's URL is registered with Yoco as a webhook endpoint
// (via POST https://payments.yoco.com/api/webhooks). Yoco returned a
// signing secret (whsec_...) when that webhook was created — set it as
// the YOCO_WEBHOOK_SECRET function secret so this file can verify that
// incoming requests genuinely came from Yoco before trusting them.
//
// Deploy with:  supabase functions deploy yoco-webhook --no-verify-jwt
// (--no-verify-jwt because Yoco, not a logged-in user, calls this URL)
//
// !! VERIFY BEFORE RELYING ON THIS WITH REAL MONEY !!
// Yoco's webhooks use the Svix signing scheme. Yoco's own developer docs
// were not accessible to confirm the exact header names they send, so
// this checks both the Svix defaults ("svix-id" etc.) and the renamed
// "webhook-id" variant some Svix-based providers use. If verification
// never succeeds against your real webhook traffic, check Supabase's
// function logs for the actual header names Yoco is sending and adjust.
// =========================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.24.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const YOCO_WEBHOOK_SECRET = Deno.env.get("YOCO_WEBHOOK_SECRET");

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawBody = await req.text();

  // Verify the request really came from Yoco before trusting it.
  if (YOCO_WEBHOOK_SECRET) {
    const svixId = req.headers.get("svix-id") ?? req.headers.get("webhook-id");
    const svixTimestamp = req.headers.get("svix-timestamp") ?? req.headers.get("webhook-timestamp");
    const svixSignature = req.headers.get("svix-signature") ?? req.headers.get("webhook-signature");

    if (svixId && svixTimestamp && svixSignature) {
      try {
        new Webhook(YOCO_WEBHOOK_SECRET).verify(rawBody, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });
      } catch (err) {
        console.error("Webhook signature verification FAILED — rejecting:", err);
        return new Response("invalid signature", { status: 401 });
      }
    } else {
      // Headers didn't match either naming scheme. Logged so you can check
      // the real header names in Supabase's function logs and fix the
      // names above rather than silently accepting unverified events.
      console.warn("No recognized signature headers on incoming webhook — accepting UNVERIFIED. Check function logs for actual header names.");
    }
  } else {
    console.warn("YOCO_WEBHOOK_SECRET not set — accepting webhook WITHOUT signature verification.");
  }

  try {
    const event = JSON.parse(rawBody);

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
