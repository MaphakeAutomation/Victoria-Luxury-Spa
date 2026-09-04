# Victorias Luxury SPA & WELLNESS — Website

A luxury booking website for Victorias Luxury SPA & WELLNESS (Camps Bay, Cape Town), with a
customer-facing booking site, an admin dashboard, and the scaffolding for real deposit payments
via Yoco and email automation via n8n.

## What's already working, right now

Open `index.html` in a browser (or double-click it) and the whole site works today — hero,
full treatment menu, signature packages, gallery, policies, the falling-petals animation, and
a complete booking flow. It's running in **demo mode**: bookings and sign-ups are logged to the
browser console instead of being saved anywhere, so you can click through and test everything
before connecting a real backend. Open `admin.html` and sign in with the demo password
`victoria2026` to preview the dashboard with sample bookings.

## Project structure

```
index.html                    Main site
admin.html                    Admin dashboard
booking-confirmed.html        Page guests land on after a successful payment
css/style.css                 Site design (colors, fonts, animations, responsive layout)
css/admin.css                 Admin dashboard layout
js/config.js                  All your settings — edit this first
js/services-data.js           Every treatment, package and price — single source of truth
js/main.js                    Site behaviour (menu, gallery, booking widget, petals animation)
js/admin.js                   Admin dashboard behaviour
images/                       All photos currently in use (concept images — see note below)
supabase/schema.sql           Database tables + security rules
supabase/functions/           Payment server code (Yoco checkout + webhook)
```

## Step 1 — Edit your prices & content

Everything you'll want to change regularly lives in two files:

- **`js/services-data.js`** — every treatment, price, duration and the five signature packages.
  Add, remove or reprice anything here and it updates the whole site (menu, booking dropdown,
  deposit calculation) automatically.
- **`js/config.js`** — your WhatsApp number, phone, email, and (once you have them) your
  Supabase/Yoco keys.

## Step 2 — Set up Supabase (the database)

Supabase stores your bookings, blocked-out times, and email sign-ups, and gives your admin
login a real password (instead of the demo one).

1. Create a free account at [supabase.com](https://supabase.com) and a new project.
2. In the Supabase Dashboard, go to **SQL Editor**, paste the contents of `supabase/schema.sql`,
   and run it. This creates the `bookings`, `blocked_slots` and `subscribers` tables with the
   right security rules already applied.
3. Go to **Project Settings > API** and copy your **Project URL** and **anon public key**.
4. Paste them into `js/config.js` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
5. Go to **Authentication > Users** and create yourself an admin user (your email + a strong
   password) — this is what you'll log into `admin.html` with once it's wired to Supabase Auth.
6. Add the Supabase JS client to `index.html` and `admin.html` (just above your other `<script>`
   tags):
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
   <script>const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);</script>
   ```
7. Set `BACKEND_CONNECTED: true` in `js/config.js`.
8. Follow the `// LIVE MODE` comments in `js/main.js` and `js/admin.js` — each one shows the
   exact Supabase call to swap in (inserting a booking/subscriber, reading bookings, signing in).

## Step 3 — Set up Yoco (real payments)

Yoco's Checkout API automatically supports card, Apple Pay and Google Pay once your gateway is
active — no extra setup needed for those payment methods themselves.

1. Sign up for a Yoco account at [yoco.com](https://www.yoco.com/za/online-payment/) and enable
   the Online Payment Gateway.
2. Get your **secret key** (starts with `sk_test_...` for testing, `sk_live_...` for real money)
   from the Yoco Dashboard.
3. Install the [Supabase CLI](https://supabase.com/docs/guides/cli), then from this project folder:
   ```
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase secrets set YOCO_SECRET_KEY=sk_test_xxxxx
   supabase secrets set SITE_URL=https://your-deployed-site.example.com
   supabase functions deploy yoco-checkout
   supabase functions deploy yoco-webhook --no-verify-jwt
   ```
4. In the Yoco Dashboard, register the deployed `yoco-webhook` function URL as your webhook
   endpoint for payment events.
5. Copy the deployed `yoco-checkout` function URL into `js/config.js` as
   `YOCO_CHECKOUT_FUNCTION_URL`.

   **Before accepting real money:** open Yoco's own Checkout API reference in your Yoco
   Developer account and double-check the endpoint, field names and webhook signature scheme
   against the code in `supabase/functions/` — these were written from Yoco's documented API
   shape, but Yoco's own docs are the source of truth and can change. Test everything with your
   **test** secret key first.

## Step 4 — Deploy the site

Any static host works. The simplest free options:

- **Netlify**: drag the whole project folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **Vercel**: `npx vercel` from this folder, or connect a GitHub repo.

Once deployed, come back and update `SITE_URL` in your Supabase function secrets (Step 3.3) to
match your real domain.

## Step 5 — Set up n8n (email automation)

Three ready-to-import workflows live in the `n8n/` folder: booking confirmations, a welcome
email for new subscribers, and a "Notify Subscribers" broadcast triggered from your admin
dashboard. All three send email using **n8n's own built-in Send Email node** — no separate
email service to sign up for. It just needs an SMTP login, which your existing Gmail (or
whatever inbox you want emails to come from) can provide for free.

### 5.1 — Sign up for n8n + get an SMTP login

1. **n8n Cloud**: sign up at [n8n.io](https://n8n.io) (14-day free trial, then a paid plan — or
   self-host n8n for free if you'd rather not pay later).
2. **Get an "app password" for the inbox you want to send from** (using a personal/business
   Gmail address is the easiest free option):
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
     (requires 2-Step Verification to be turned on for that Google account first).
   - Create an app password named "n8n", and copy the 16-character code it gives you — you
     won't see it again.
   - This code is what you'll use as the password below (not your normal Gmail password).
3. In n8n, go to **Credentials > Add Credential > SMTP**, and fill in:
   - **User**: your full Gmail address
   - **Password**: the 16-character app password from step 2
   - **Host**: `smtp.gmail.com`
   - **Port**: `465`, **SSL/TLS**: on
   - Save it as something like "Victorias Email".

   (Using a different provider instead of Gmail? Any SMTP login works the same way — just use
   that provider's host/port/credentials instead.)

### 5.2 — Import the workflows

For each of the three files in `n8n/` (`booking-confirmation.json`, `new-subscriber-welcome.json`,
`slot-alert-broadcast.json`):

1. In n8n, click **Add workflow > Import from File** and select the file.
2. Open every **HTTP Request** node (the ones talking to Supabase) and replace:
   - `REPLACE_ME_SUPABASE_URL` → `https://vuwrzddrgajaphzwthik.supabase.co`
   - `REPLACE_ME_SUPABASE_SERVICE_ROLE_KEY` → your Supabase **service_role** key (Project
     Settings > API Keys — NOT the anon key; this one bypasses RLS so keep it inside n8n only)
3. Open the **Send Email** node and:
   - Select the "Victorias Email" SMTP credential you created in 5.1
   - Replace `REPLACE_ME_YOUR_EMAIL` (the "From" field) with the same Gmail address
   - In `slot-alert-broadcast.json` only, also replace `REPLACE_ME_SITE_URL` with your live site URL
4. Click **Save**, then toggle the workflow **Active** (top right).
5. Open the workflow's **Webhook** node and copy its **Production URL** — you'll need it next.

### 5.3 — Connect each workflow to the site

- **Booking confirmations** (`booking-confirmation.json`): paste its webhook URL as the
  `N8N_BOOKING_WEBHOOK_URL` secret on Supabase:
  ```
  npx -y supabase@latest secrets set N8N_BOOKING_WEBHOOK_URL=<paste URL> --project-ref vuwrzddrgajaphzwthik
  ```
  Every time a deposit payment succeeds, the `yoco-webhook` function will call this and the guest
  gets an automatic confirmation email.

- **Slot alert broadcast** (`slot-alert-broadcast.json`): paste its webhook URL into
  `N8N_SLOT_ALERT_WEBHOOK_URL` in `js/config.js`, then redeploy the site. A **🔔 Notify
  Subscribers** button now appears on the admin dashboard's Subscribers tab — click it any time
  you have open slots to email everyone on the list in one go.

- **New subscriber welcome** (`new-subscriber-welcome.json`): in Supabase Dashboard, go to
  **Database > Webhooks > Create a new hook**. Set it to fire on **Insert** for the `subscribers`
  table, type **HTTP Request**, and paste this workflow's webhook URL as the target. Now anyone
  who signs up (via the newsletter form or while booking) gets an instant welcome email.

That's the full loop: someone signs up → welcome email; a slot opens up → you click one button
to tell everyone; someone books and pays their deposit → they get a confirmation email
automatically.

## Certifications & real photography

Per your instructions, no fictional certificates were created. The "Professional Care" section
uses a neutral placeholder until you have real practitioner qualifications to add — when ready,
add each one individually (name, qualification, issuing organisation, year) by editing the
`.professional-section` in `index.html`.

The gallery currently uses the concept images you provided, organised into categories, with a
visible disclaimer that they're for branding purposes. Swap files in `images/` for real photos
of your premises and team whenever you have them — just keep the same filenames, or update the
paths in `js/main.js` (`GALLERY_ITEMS`) and `index.html`.

## Deposit logic

Currently: **30% of the treatment/package price, R100 minimum**, rounded to the nearest R10.
This lives in `js/services-data.js` as `DEPOSIT_RATE` and `DEPOSIT_MIN` — change either value
and the whole site (menu cards, booking summary) updates automatically.
