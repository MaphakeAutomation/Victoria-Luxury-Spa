/* =========================================================
   VICTORIAS LUXURY SPA & WELLNESS — Site Configuration
   Fill these in once your Supabase + Yoco accounts are set up.
   See README.md for the full step-by-step setup guide.
   ========================================================= */

const CONFIG = {
  // --- Supabase (database + auth) ---
  // Supabase Dashboard > Project Settings > API Keys
  SUPABASE_URL: "https://vuwrzddrgajaphzwthik.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1d3J6ZGRyZ2FqYXBoend0aGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0Mjc5OTAsImV4cCI6MjEwNDAwMzk5MH0.Y9aK0mXPJZn2pthbDn1eL6PC_GkQs1Dx9CZY6US4Qac",

  // --- Supabase Edge Functions (handle Yoco payments server-side) ---
  // Fill this in once you've deployed /supabase/functions/yoco-checkout (see README Step 3).
  YOCO_CHECKOUT_FUNCTION_URL: "https://vuwrzddrgajaphzwthik.supabase.co/functions/v1/yoco-checkout",

  // --- n8n email automation ---
  // Fill this in once you've imported n8n/slot-alert-broadcast.json and activated
  // it (README Step 5). It's what the admin dashboard's "Notify Subscribers"
  // button calls to email everyone about newly opened slots.
  N8N_SLOT_ALERT_WEBHOOK_URL: "https://maphakeautomation.app.n8n.cloud/webhook/slot-alert",

  // --- Business info shown across the site ---
  BUSINESS_NAME: "Victorias Luxury SPA & WELLNESS",
  WHATSAPP_NUMBER: "27XXXXXXXXX",   // digits only, country code, no +, no spaces (used for wa.me links)
  PHONE_DISPLAY: "+27 XX XXX XXXX",
  EMAIL: "bookings@victoriasluxuryspa.co.za",
  SUBURB: "Camps Bay, Cape Town",

  // --- Feature flags: flip these on as each piece goes live ---
  // Supabase is connected: real bookings, subscribers & admin login now save
  // and read from your actual database instead of running in demo mode.
  SUPABASE_CONNECTED: true,
  // Yoco is connected — the deposit button now creates a real Yoco Checkout
  // session and sends the guest to Yoco's hosted payment page (card, Apple
  // Pay, Google Pay). Booking status flips to "confirmed" automatically once
  // the yoco-webhook Edge Function receives payment confirmation from Yoco.
  YOCO_CONNECTED: true
};
