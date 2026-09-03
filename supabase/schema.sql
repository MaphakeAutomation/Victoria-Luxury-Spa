-- =========================================================
-- VICTORIAS LUXURY SPA & WELLNESS — Supabase schema
-- Run this in Supabase Dashboard > SQL Editor (once, on a new project).
-- =========================================================

-- Bookings made through the website
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  service_id text not null,
  service_name text not null,
  booking_date date not null,
  booking_time time not null,
  service_price numeric not null,
  deposit_amount numeric not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  yoco_checkout_id text,
  yoco_payment_status text
);

-- Times the business has manually blocked off (holidays, fully booked, leave, etc.)
create table if not exists blocked_slots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  block_date date not null,
  from_time time not null,
  to_time time not null,
  reason text
);

-- Email sign-ups for "notify me about free slots" (newsletter form + booking opt-in)
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  source text not null default 'newsletter_form',
  interested_service_id text
);

-- Row Level Security: allow the public (anon key) to INSERT bookings/subscribers
-- (so the website can write), but not read/update/delete other people's data.
-- Only an authenticated admin (Supabase Auth) can read/manage everything.

alter table bookings enable row level security;
alter table blocked_slots enable row level security;
alter table subscribers enable row level security;

-- Public can create a booking (the site's booking widget)
create policy "Public can insert bookings" on bookings
  for insert to anon with check (true);

-- Public can create a subscriber row (newsletter form)
create policy "Public can insert subscribers" on subscribers
  for insert to anon with check (true);

-- Public can read blocked_slots + non-cancelled booking date/times ONLY
-- (needed so the booking widget can grey out unavailable slots) — expose
-- only the columns needed via a view, never the full bookings table:
create or replace view public_taken_slots as
  select booking_date, booking_time from bookings where status in ('pending','confirmed');

create policy "Public can read blocked slots" on blocked_slots
  for select to anon using (true);

-- Authenticated admin (logged in via Supabase Auth) can do everything
create policy "Admin full access to bookings" on bookings
  for all to authenticated using (true) with check (true);
create policy "Admin full access to blocked_slots" on blocked_slots
  for all to authenticated using (true) with check (true);
create policy "Admin full access to subscribers" on subscribers
  for all to authenticated using (true) with check (true);

-- Helpful indexes
create index if not exists idx_bookings_date on bookings (booking_date);
create index if not exists idx_bookings_status on bookings (status);
