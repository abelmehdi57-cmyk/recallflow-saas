-- Run AFTER schema.sql if you signed up before the database was set up.
-- Creates a business row for every auth user that doesn't have one.

insert into public.businesses (owner_id, business_name)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'business_name', 'My Business')
from auth.users u
where not exists (
  select 1 from public.businesses b where b.owner_id = u.id
);
