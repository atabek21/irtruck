create table if not exists docs(coll text not null,id text not null,data jsonb not null,updated timestamptz default now(),primary key(coll,id));
alter table docs enable row level security;
create policy "only logged in users" on docs for all to authenticated using (true) with check (true);
