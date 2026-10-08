-- Home page view counter used by /api/views. One row per page per day;
-- the API sums rows for the all-time total. Safe to rerun.
create table if not exists public.page_views (
  page  text    not null,
  date  date    not null default current_date,
  count integer not null default 0,
  primary key (page, date)
);
alter table public.page_views enable row level security;  -- no policies: only the server key can reach it
grant select, insert, update on public.page_views to service_role;

create or replace function public.increment_views(p_page text)
returns integer
language sql
set search_path = ''
as $$
  insert into public.page_views (page, date, count)
  values (p_page, current_date, 1)
  on conflict (page, date) do update set count = public.page_views.count + 1
  returning count;
$$;
revoke all on function public.increment_views(text) from public, anon, authenticated;
grant execute on function public.increment_views(text) to service_role;
