-- ============================================
-- RecallFlow MVP — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. BUSINESSES TABLE
-- Created automatically when a user signs up (via trigger below)
create table public.businesses (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  business_name text not null default 'My Business',
  plan text not null default 'free',
  currency text not null default 'USD',
  timezone text not null default 'UTC',
  business_type text not null default 'general',
  default_appointment_value numeric(10, 2) not null default 75.00,
  created_at timestamptz default now() not null
);

create unique index if not exists idx_businesses_owner_id_unique on public.businesses(owner_id);

-- 2. CLIENTS TABLE
create type client_status as enum ('new', 'confirmed', 'follow-up', 'closed', 'ghosted');

create table public.clients (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  phone text,
  service text,
  status client_status default 'new' not null,
  notes text,
  last_contact timestamptz default now(),
  created_at timestamptz default now() not null
);

-- 3. APPOINTMENTS TABLE
create type appointment_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no-show'
);

create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  date timestamptz not null,
  status appointment_status not null default 'pending',
  amount numeric(10, 2),
  confirmed boolean default false,
  showed_up boolean default false,
  paid boolean default false,
  notes text,
  created_at timestamptz default now() not null
);

-- 4. REMINDERS TABLE
create table public.reminders (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  date timestamptz not null,
  message text not null,
  done boolean default false,
  created_at timestamptz default now() not null
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Each business can only see its own data
-- ============================================

alter table public.businesses enable row level security;
alter table public.clients enable row level security;
alter table public.appointments enable row level security;
alter table public.reminders enable row level security;

-- Businesses: owner can do everything
create policy "Users can view own business"
  on public.businesses for select
  using (owner_id = auth.uid());

create policy "Users can insert own business"
  on public.businesses for insert
  with check (owner_id = auth.uid());

create policy "Users can update own business"
  on public.businesses for update
  using (owner_id = auth.uid());

-- Clients: business members can do everything
create policy "Business can view own clients"
  on public.clients for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Business can insert clients"
  on public.clients for insert
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Business can update clients"
  on public.clients for update
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Business can delete clients"
  on public.clients for delete
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Appointments: business members can do everything
create policy "Business can view own appointments"
  on public.appointments for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Business can insert appointments"
  on public.appointments for insert
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Business can update appointments"
  on public.appointments for update
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Business can delete appointments"
  on public.appointments for delete
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Reminders: business members can do everything
create policy "Business can view own reminders"
  on public.reminders for select
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Business can insert reminders"
  on public.reminders for insert
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Business can update reminders"
  on public.reminders for update
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "Business can delete reminders"
  on public.reminders for delete
  using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- ============================================
-- AUTO-CREATE BUSINESS ON SIGNUP
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.businesses (owner_id, business_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'business_name', 'My Business')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- INDEXES for performance
-- ============================================

create index idx_clients_business_id on public.clients(business_id);
create index idx_appointments_business_id on public.appointments(business_id);
create index idx_appointments_client_id on public.appointments(client_id);
create index idx_appointments_date on public.appointments(date);
create index idx_appointments_status on public.appointments(status);
create index idx_reminders_business_id on public.reminders(business_id);
create index idx_reminders_date on public.reminders(date);
create index idx_reminders_done on public.reminders(done);
