create table public.saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.saves to authenticated;
grant all on public.saves to service_role;

alter table public.saves enable row level security;

create policy "own save" on public.saves
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = public;

create trigger update_saves_updated_at
before update on public.saves
for each row execute function public.update_updated_at_column();