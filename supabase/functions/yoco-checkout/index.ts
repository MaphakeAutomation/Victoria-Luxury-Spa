// =========================================================
// VICTORIAS LUXURY SPA & WELLNESS — Yoco Checkout Creator
// Supabase Edge Function (Deno)
//
// Deploy with:  supabase functions deploy yoco-checkout
// Set the secret first:  supabase secrets set YOCO_SECRET_KEY=sk_live_xxxxx
//
// !! IMPORTANT — VERIFY BEFORE GOING LIVE !!
// Yoco's Checkout API reference (https://developer.yoco.com/checkout-api-reference)
// could not be fetched automatically to confirm the exact current endpoint,
// field names and webhook signature scheme while this was written. The shape
// below reflects Yoco's documented Checkout API as of general knowledge, but
// before accepting real money you MUST log into your Yoco Developer account,
// open the Checkout API reference, and confirm:
//   1. The exact endpoint URL (currently assumed: POST https://payments.yoco.com/api/checkouts)
//   2. The auth header format (currently assumed: "Authorization: Bearer <secretKey>")
//   3. The request body field names (amount in cents, currency, redirect URLs)
//   4. The response field for the hosted checkout URL (currently assumed: redirectUrl)
// Test with a Yoco TEST secret key (sk_test_...) end-to-end before switching
// to your live key.
// =========================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const YOCO_SECRET_KEY = Deno.env.get("YOCO_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://your-deployed-site.example.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { amountCents, currency, booking } = await req.json();

    if (!amountCents || !booking?.serviceId || !booking?.email) {
      return json({ error: "Missing required booking fields." }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Create a "pending" booking row first, so we have an id to attach to the checkout.
    const { data: bookingRow, error: dbError } = await supabase
      .from("bookings")
      .insert({
        guest_name: booking.name,
        guest_email: booking.email,
        guest_phone: booking.phone,
        service_id: booking.serviceId,
        service_name: booking.serviceName,
        booking_date: booking.date,
        booking_time: booking.time,
        service_price: booking.servicePrice,
        deposit_amount: booking.deposit,
        notes: booking.notes ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (dbError) {
      console.error(dbError);
      return json({ error: "Could not save booking." }, 500);
    }

    // 2. Create the Yoco hosted checkout, tagging it with our booking id via metadata.
    const yocoRes = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${YOCO_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountCents, // amount in cents, e.g. R255.00 -> 25500
        currency: currency || "ZAR",
        cancelUrl: `${SITE_URL}/index.html#booking`,
        successUrl: `${SITE_URL}/booking-confirmed.html?booking_id=${bookingRow.id}`,
        failureUrl: `${SITE_URL}/index.html#booking`,
        metadata: { booking_id: bookingRow.id },
      }),
    });

    if (!yocoRes.ok) {
      const errText = await yocoRes.text();
      console.error("Yoco error:", errText);
      return json({ error: "Could not start Yoco checkout." }, 502);
    }

    const yocoData = await yocoRes.json();

    await supabase.from("bookings").update({ yoco_checkout_id: yocoData.id }).eq("id", bookingRow.id);

    return json({ redirectUrl: yocoData.redirectUrl, bookingId: bookingRow.id });
  } catch (err) {
    console.error(err);
    return json({ error: "Unexpected server error." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
