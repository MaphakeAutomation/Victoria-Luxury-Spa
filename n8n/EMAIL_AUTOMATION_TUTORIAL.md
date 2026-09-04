# Email Automation Setup — Step by Step

This walks you through wiring up all three email automations for Victorias Luxury SPA:
booking confirmations, a welcome email for new subscribers, and the "Notify Subscribers"
slot-alert button in your admin dashboard.

**You need three files for this**, already sitting in your project's `n8n/` folder:
- `booking-confirmation.json`
- `new-subscriber-welcome.json`
- `slot-alert-broadcast.json`

If you're not sure where that folder is on your PC, it's here:
`C:\Users\mapha\Downloads\victoria-luxury-spa\victoria-luxury-spa\n8n\`

---

## Part 0 — What you're building

| Automation | Trigger | What happens |
|---|---|---|
| Booking confirmation | Guest pays their deposit via Yoco | They get an email with their appointment details |
| New subscriber welcome | Someone signs up for slot alerts on the site | They get a "you're on the list" email |
| Slot alert broadcast | You click "🔔 Notify Subscribers" in your admin dashboard | Every subscriber gets an email that new slots are open |

All three send email through **n8n's own built-in Send Email node** — no Brevo, no Mailgun,
nothing else to sign up for. It just needs an SMTP login, which we'll get from Gmail for free.

---

## Part 1 — One-time setup (do this once, before importing anything)

### 1.1 Get a Gmail App Password

This lets n8n send emails "through" your Gmail account without needing your actual password.

1. Go to **myaccount.google.com/apppasswords** in your browser (you'll need to sign in).
2. If it asks you to turn on **2-Step Verification** first, do that — it's required for app
   passwords to work.
3. Once you're on the App Passwords page, type a name like `n8n` and click **Create**.
4. Google shows you a **16-character code** (four groups of four letters). **Copy it now** — it
   won't be shown again. This is NOT your normal Gmail password; it's a special one just for n8n.

### 1.2 Add that as an SMTP credential inside n8n

1. In n8n, look at the left sidebar and click **Credentials**.
2. Click **Add Credential** (top right), then search for and select **SMTP**.
3. Fill in the fields:
   - **User**: your full Gmail address (e.g. `youraddress@gmail.com`)
   - **Password**: paste the 16-character app password from step 1.1
   - **Host**: `smtp.gmail.com`
   - **Port**: `465`
   - **SSL/TLS**: turn this ON
4. Click **Save**. Name it something clear like `Victorias Email` so it's easy to find later.

You only need to do this once — all three workflows will reuse this same credential.

### 1.3 Get your Supabase service role key

Some of the workflows need to read data (bookings, subscribers) directly from your database.

1. Go to your Supabase project dashboard: **supabase.com/dashboard**
2. Click **Project Settings** (gear icon) → **API Keys**.
3. Find the key labeled **service_role** (NOT the "anon" one you used in `config.js` — this one
   has full access, so it's only ever used inside n8n, never in the website's code).
4. Copy it and keep it somewhere handy — you'll paste it into two of the workflows below.

---

## Part 2 — Import Workflow 1: Booking Confirmation

1. In n8n, go to your **Workflows** list (left sidebar → Overview, or click the n8n logo).
2. Click **Add workflow** (top right, the **+** button) to create a blank one.
3. On the blank canvas, click the **"..." (three dots) menu** near the top (next to "Personal /
   My workflow" at the top left) — you saw this menu in your screenshot, with options like
   Rename, Duplicate, Export JSON, **Import**, Push to git, etc.
4. Click **Import**, then **From file**.
5. Browse to your project's `n8n` folder and select **`booking-confirmation.json`**.
6. The canvas fills in with 4 connected boxes ("nodes"): a Webhook, a "Get Booking from
   Supabase" step, a "Build Confirmation Email" step, and a "Send Confirmation Email" step.

Now configure it:

7. **Double-click "Get Booking from Supabase"**. In the header parameters, you'll see two rows
   with the text `REPLACE_ME_SUPABASE_SERVICE_ROLE_KEY`. Click into each value field and replace
   it with the real service role key from step 1.3. Also find `REPLACE_ME_SUPABASE_URL` in the
   URL field at the top and replace it with:
   ```
   https://vuwrzddrgajaphzwthik.supabase.co
   ```
   Click outside the node to close it (it auto-saves).

8. **Double-click "Send Confirmation Email"**. Near the top you'll see a **Credential to connect
   with** dropdown — select **Victorias Email** (the one you made in step 1.2). Then find the
   **From Email** field showing `REPLACE_ME_YOUR_EMAIL` and replace it with your Gmail address.

9. Click **Save** (top left, near the workflow name).

10. Toggle the switch in the top-right corner from **Inactive** to **Active**.

11. Double-click the **Webhook** node (the first box). You'll see a **Production URL** — click
    the copy icon next to it. **Save this URL somewhere** (a notes app, or just message it to
    me) — you'll need it in Part 5.

---

## Part 3 — Import Workflow 2: New Subscriber Welcome

Repeat the same import process:

1. **Add workflow** → blank canvas → **"..." → Import → From file** → select
   `new-subscriber-welcome.json`.
2. This one only has 3 nodes: Webhook → "Extract Subscriber Email" → "Send Welcome Email". There's
   no Supabase step here, so nothing to fill in there.
3. **Double-click "Send Welcome Email"** → select the **Victorias Email** credential → replace
   `REPLACE_ME_YOUR_EMAIL` with your Gmail address.
4. **Save**, then toggle **Active**.
5. Open the **Webhook** node, copy its **Production URL**, and save it for Part 5.

---

## Part 4 — Import Workflow 3: Slot Alert Broadcast

Same process again:

1. **Add workflow** → **"..." → Import → From file** → select `slot-alert-broadcast.json`.
2. **Double-click "Get Subscribers from Supabase"** → replace `REPLACE_ME_SUPABASE_URL` and
   both `REPLACE_ME_SUPABASE_SERVICE_ROLE_KEY` fields, same as Part 2 step 7.
3. **Double-click "Send Slot Alert (one per subscriber)"** → select the **Victorias Email**
   credential → replace `REPLACE_ME_YOUR_EMAIL` with your Gmail address → also find
   `REPLACE_ME_SITE_URL` inside the email's HTML content and replace it with your live site URL:
   ```
   https://maphakeautomation.github.io/Victoria-Luxury-Spa/
   ```
4. **Save**, then toggle **Active**.
5. Open the **Webhook** node, copy its **Production URL**, and save it for Part 5.

---

## Part 5 — Connect all three webhook URLs to the actual site

You should now have **3 webhook URLs** copied somewhere. Here's where each one goes:

### 5.1 Booking confirmation URL → Supabase secret

Open PowerShell (same one you've used before) and run, pasting your real URL in:

```powershell
npx -y supabase@latest secrets set N8N_BOOKING_WEBHOOK_URL=PASTE_URL_HERE --project-ref vuwrzddrgajaphzwthik
```

### 5.2 Slot alert URL → your site's config.js

Send me this URL directly in chat and I'll update `js/config.js` and push it to your site for
you — same way I've been handling the other file updates.

### 5.3 New subscriber URL → Supabase Database Webhook

1. In Supabase Dashboard, go to **Database** (left sidebar) → **Webhooks**.
2. Click **Create a new hook**.
3. **Table**: `subscribers`. **Events**: check only **Insert**.
4. **Type**: HTTP Request. **URL**: paste the new-subscriber-welcome webhook URL.
5. **Method**: POST. Leave headers as default (`Content-Type: application/json`).
6. Click **Create webhook**.

---

## Part 6 — Test it

1. **New subscriber welcome**: go to your live site, scroll to the newsletter sign-up, and enter
   a test email you can check. You should get the welcome email within a few seconds.
2. **Slot alert broadcast**: log into `admin.html`, go to **Subscribers**, and click
   **🔔 Notify Subscribers**. Everyone on the list (including your test signup) should get the
   email.
3. **Booking confirmation**: go through the full booking + Yoco test payment flow on your site.
   Once payment succeeds, the guest email on that booking should get the confirmation.

For each test, if nothing arrives within a minute or two: in n8n, open that workflow and click
**Executions** (left of the canvas) — it'll show you exactly what happened and where it failed,
which is the fastest way to fix it. Send me a screenshot of that and I'll help.

---

## Troubleshooting

- **"Node type not found" or a version warning on import** — click through it / let n8n update
  the node automatically. This is normal and doesn't break anything.
- **Emails land in spam** — normal for a brand-new Gmail-based sender with no history yet. It'll
  improve over the first few weeks of real sending. For a real business, eventually setting up a
  proper domain email is worth it, but Gmail is fine to start.
- **Gmail blocks the SMTP login** — double check you used the 16-character **app password**,
  not your normal Gmail password. Regular passwords won't work for this.
- **Webhook says "not registered" or 404** — make sure the workflow is toggled **Active**, not
  just saved. Inactive workflows don't listen for incoming requests.
- **"Notify Subscribers" button says it can't reach n8n** — double-check the URL pasted into
  `config.js` is the **Production URL** (not the "Test URL", which only works while you have the
  workflow open and are manually watching it).
