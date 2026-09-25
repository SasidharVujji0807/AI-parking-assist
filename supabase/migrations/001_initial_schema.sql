-- AI Parking Finder — Complete Production Schema Migration
-- Run this in the Supabase SQL editor

-- ── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- For text search

-- ── Profiles ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'user'
    check (role in ('user', 'operator', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Parking Locations ──────────────────────────────────────────────────────
create table if not exists public.parking_locations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  description text,
  address text not null,
  city text,
  state text,
  postal_code text,
  latitude double precision not null,
  longitude double precision not null,
  parking_type text not null
    check (parking_type in ('street','garage','lot','private','mall','airport','hospital','hotel','office','residential','valet','public')),
  vehicle_types text[] not null default '{}',
  amenities text[] not null default '{}',
  total_spaces integer check (total_spaces >= 0),
  available_spaces integer check (available_spaces >= 0),
  availability_status text not null default 'unknown'
    check (availability_status in ('available','limited','full','unknown','closed')),
  price numeric(10,2),
  currency text not null default 'INR',
  pricing_unit text check (pricing_unit in ('hour','day','month','flat')),
  rating numeric(2,1) check (rating >= 0 and rating <= 5),
  review_count integer not null default 0,
  is_24_7 boolean not null default false,
  opening_time time,
  closing_time time,
  is_active boolean not null default true,
  last_availability_update timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Parking Images ─────────────────────────────────────────────────────────
create table if not exists public.parking_images (
  id uuid primary key default gen_random_uuid(),
  parking_id uuid not null references public.parking_locations(id) on delete cascade,
  image_url text not null,
  alt_text text,
  created_at timestamptz not null default now()
);

-- ── Favorites ──────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  parking_id uuid not null references public.parking_locations(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, parking_id)
);

-- ── Reviews ────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  parking_id uuid not null references public.parking_locations(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  is_approved boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, parking_id)
);

-- ── Search History ─────────────────────────────────────────────────────────
create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  search_query text,
  latitude double precision,
  longitude double precision,
  filters jsonb not null default '{}'::jsonb,
  result_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- ── Parking Reports ────────────────────────────────────────────────────────
create table if not exists public.parking_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  parking_id uuid not null references public.parking_locations(id) on delete cascade,
  report_type text not null
    check (report_type in ('incorrect_price','incorrect_location','closed_parking','incorrect_availability','duplicate','incorrect_hours','other')),
  description text,
  status text not null default 'pending'
    check (status in ('pending','reviewed','resolved','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── AI Conversations ───────────────────────────────────────────────────────
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── AI Messages ────────────────────────────────────────────────────────────
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════════════════════════════

create index if not exists idx_parking_location on public.parking_locations(latitude, longitude);
create index if not exists idx_parking_city on public.parking_locations(city);
create index if not exists idx_parking_type on public.parking_locations(parking_type);
create index if not exists idx_parking_availability on public.parking_locations(availability_status);
create index if not exists idx_parking_price on public.parking_locations(price);
create index if not exists idx_parking_owner on public.parking_locations(owner_id);
create index if not exists idx_parking_active on public.parking_locations(is_active);
create index if not exists idx_parking_rating on public.parking_locations(rating desc);
create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_favorites_parking on public.favorites(parking_id);
create index if not exists idx_reviews_parking on public.reviews(parking_id);
create index if not exists idx_reviews_user on public.reviews(user_id);
create index if not exists idx_history_user on public.search_history(user_id);
create index if not exists idx_reports_status on public.parking_reports(status);
create index if not exists idx_reports_parking on public.parking_reports(parking_id);
create index if not exists idx_ai_conv_user on public.ai_conversations(user_id);
create index if not exists idx_ai_messages_conv on public.ai_messages(conversation_id);

-- Text search index
create index if not exists idx_parking_name_trgm on public.parking_locations using gin(name gin_trgm_ops);
create index if not exists idx_parking_address_trgm on public.parking_locations using gin(address gin_trgm_ops);

-- ══════════════════════════════════════════════════════════════════════════════
-- TRIGGERS — updated_at automation
-- ══════════════════════════════════════════════════════════════════════════════

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create or replace trigger set_parking_updated_at
  before update on public.parking_locations
  for each row execute function public.handle_updated_at();

create or replace trigger set_reviews_updated_at
  before update on public.reviews
  for each row execute function public.handle_updated_at();

create or replace trigger set_reports_updated_at
  before update on public.parking_reports
  for each row execute function public.handle_updated_at();

create or replace trigger set_ai_conv_updated_at
  before update on public.ai_conversations
  for each row execute function public.handle_updated_at();

-- ── Auto-create profile on user signup ─────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ══════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.parking_locations enable row level security;
alter table public.parking_images enable row level security;
alter table public.favorites enable row level security;
alter table public.reviews enable row level security;
alter table public.search_history enable row level security;
alter table public.parking_reports enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

-- Profiles RLS
create policy "profiles_read_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Prevent role escalation from client
    and (role = (select role from public.profiles where id = auth.uid()))
  );

-- Parking Locations RLS — public can read active
create policy "parking_public_read" on public.parking_locations
  for select using (is_active = true);

create policy "parking_owner_all" on public.parking_locations
  for all using (
    auth.uid() = owner_id
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Parking Images
create policy "parking_images_public_read" on public.parking_images
  for select using (true);

create policy "parking_images_owner_manage" on public.parking_images
  for all using (
    exists (
      select 1 from public.parking_locations
      where id = parking_images.parking_id
      and (owner_id = auth.uid() or (select role from public.profiles where id = auth.uid()) = 'admin')
    )
  );

-- Favorites RLS
create policy "favorites_user_own" on public.favorites
  for all using (auth.uid() = user_id);

-- Reviews RLS
create policy "reviews_public_read" on public.reviews
  for select using (is_approved = true);

create policy "reviews_user_create" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "reviews_user_update_delete" on public.reviews
  for all using (
    auth.uid() = user_id
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- Search History RLS
create policy "history_user_own" on public.search_history
  for all using (auth.uid() = user_id);

-- Reports RLS
create policy "reports_user_create" on public.parking_reports
  for insert with check (true); -- allow anonymous reports

create policy "reports_user_read_own" on public.parking_reports
  for select using (
    auth.uid() = user_id
    or (select role from public.profiles where id = auth.uid()) = 'admin'
  );

create policy "reports_admin_update" on public.parking_reports
  for update using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- AI Conversations RLS
create policy "ai_conv_user_own" on public.ai_conversations
  for all using (auth.uid() = user_id);

-- AI Messages RLS
create policy "ai_messages_user_own" on public.ai_messages
  for all using (
    exists (
      select 1 from public.ai_conversations
      where id = ai_messages.conversation_id
      and user_id = auth.uid()
    )
  );
