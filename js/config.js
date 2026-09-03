/* =========================================================
   VICTORIAS LUXURY SPA & WELLNESS — Site Configuration
   Fill these in once your Supabase + Yoco accounts are set up.
   See README.md for the full step-by-step setup guide.
   ========================================================= */

const CONFIG = {
  // --- Supabase (database + auth) ---
  // Supabase Dashboard > Project Settings > API
  SUPABASE_URL: "YOUR_SUPABASE_PROJECT_URL",      // e.g. https://xxxxx.supabase.co
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",    // the public "anon" key — safe to expose client-side

  // --- Supabase Edge Functions (handle Yoco payments server-side) ---
  // These are created when you deploy the /supabase/functions folder (see README).
  YOCO_CHECKOUT_FUNCTION_URL: "YOUR_SUPABASE_URL/functions/v1/yoco-checkout",

  // --- Business info shown across the site ---
  BUSINESS_NAME: "Victorias Luxury SPA & WELLNESS",
  WHATSAPP_NUMBER: "27XXXXXXXXX",   // digits only, country code, no +, no spaces (used for wa.me links)
  PHONE_DISPLAY: "+27 XX XXX XXXX",
  EMAIL: "bookings@victoriasluxuryspa.co.za",
  SUBURB: "Camps Bay, Cape Town",

  // Set to true once Supabase is wired up. While false, the booking widget
  // runs in local "demo mode" (no data is saved anywhere) so you can preview
  // and test the full flow before connecting a backend.
  BACKEND_CONNECTED: false
};
