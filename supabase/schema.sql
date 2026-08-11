-- Tastemap schema for Supabase
-- Run this in the Supabase SQL editor once.

-- 1. Esquema exclusivo para Tastemap (aisla el proyecto de otros)
create schema if not exists tastemap;

-- 2. Tabla de Restaurantes / Lugares
create table if not exists tastemap.places (
  id uuid primary key default gen_random_uuid(), -- la DB genera el ID si no se envía
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  cuisine text not null,
  cuisine_group text not null,
  specialty text not null,
  area text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  price_level smallint not null check (price_level between 1 and 4),
  status text not null check (status in ('ranked', 'want')),
  rank integer,
  visits integer not null default 0,
  tags text[] not null default '{}',
  note text not null default '',
  photo text,
  website text,
  date_added timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists places_user_id_idx on tastemap.places (user_id);

-- 3. Tabla de Duelos / Comparaciones
create table if not exists tastemap.comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  a_id uuid not null references tastemap.places (id) on delete cascade,
  b_id uuid not null references tastemap.places (id) on delete cascade,
  result text not null check (result in ('a', 'b', 'tie')),
  date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint check_different_places check (a_id <> b_id) -- evita duelos contra sí mismo
);

create index if not exists comparisons_user_id_idx on tastemap.comparisons (user_id);
create index if not exists comparisons_a_id_idx on tastemap.comparisons (a_id);
create index if not exists comparisons_b_id_idx on tastemap.comparisons (b_id);

-- 4. Exponer el schema a PostgREST (el API REST de Supabase)
-- Sin esto el frontend recibe "Invalid schema: tastemap"
alter role postgres in database postgres set pgrst.db_schemas to 'public, graphql_public, tastemap';
select pg_notify('pgrst', 'reload config');

-- 5. Permisos de esquema (mínimos: anónimos solo lectura, autenticados CRUD)
grant usage on schema tastemap to anon, authenticated;

-- A los usuarios anónimos solo les damos lectura (el modo guest usa sample data en el cliente, no la DB)
grant select on all tables in schema tastemap to anon;

-- A los usuarios autenticados: CRUD completo
grant select, insert, update, delete on all tables in schema tastemap to authenticated;
grant usage, select on all sequences in schema tastemap to authenticated;

-- Privilegios por defecto para tablas futuras
alter default privileges in schema tastemap grant select on tables to anon;
alter default privileges in schema tastemap grant select, insert, update, delete on tables to authenticated;

-- 6. Habilitar Seguridad a Nivel de Fila (RLS)
alter table tastemap.places enable row level security;
alter table tastemap.comparisons enable row level security;

-- Politicas para Places (drop previo para que el script sea re-ejecutable)
drop policy if exists "Users can read their own places" on tastemap.places;
create policy "Users can read their own places"
  on tastemap.places for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own places" on tastemap.places;
create policy "Users can insert their own places"
  on tastemap.places for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own places" on tastemap.places;
create policy "Users can update their own places"
  on tastemap.places for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own places" on tastemap.places;
create policy "Users can delete their own places"
  on tastemap.places for delete
  using (auth.uid() = user_id);

-- Politicas para Comparisons
drop policy if exists "Users can read their own comparisons" on tastemap.comparisons;
create policy "Users can read their own comparisons"
  on tastemap.comparisons for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own comparisons" on tastemap.comparisons;
create policy "Users can insert their own comparisons"
  on tastemap.comparisons for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own comparisons" on tastemap.comparisons;
create policy "Users can update their own comparisons"
  on tastemap.comparisons for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own comparisons" on tastemap.comparisons;
create policy "Users can delete their own comparisons"
  on tastemap.comparisons for delete
  using (auth.uid() = user_id);

-- 7. Nota: el script es 100% idempotente (IF NOT EXISTS + drop policy if exists).
-- Puedes re-ejecutarlo completo en el SQL Editor cuando quieras.
-- Los grants y la exposicion a PostgREST se re-aplican sin problema.
-- Las politicas RLS se eliminan y recrean con la misma definicion (sin cortes).
