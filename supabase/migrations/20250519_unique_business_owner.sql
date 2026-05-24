-- Run in Supabase SQL Editor if schema was applied before this constraint existed.
-- Keeps one business per user so .maybeSingle() lookups stay reliable.

create unique index if not exists idx_businesses_owner_id_unique on public.businesses(owner_id);
