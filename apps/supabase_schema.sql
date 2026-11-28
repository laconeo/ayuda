-- Esquema de base de datos para Check-in de Viajes (apps/checkin.html)
-- Ejecutar este script completo en el SQL Editor de Supabase:
-- https://supabase.com/dashboard/project/gumfbdcfjfhpqtttlsbw/sql

-- 1. Tabla de eventos
create table if not exists public.events (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  owner_name text,
  title text not null,
  type text default 'Templo',
  date text,
  meet text,
  from_place text,
  depart text,
  to_place text,
  show_time text,
  back_place text,
  back_time text,
  created_at bigint default (extract(epoch from now()) * 1000)::bigint
);

-- 2. Tabla de autos por evento
create table if not exists public.cars (
  id text primary key,
  event_id text references public.events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  model text not null,
  driver text not null,
  layout text not null default '5',
  sort_order bigint default (extract(epoch from now()) * 1000)::bigint
);

-- 3. Tabla de pasajeros por evento
create table if not exists public.people (
  id text primary key,
  event_id text references public.events(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  name text not null,
  created_at bigint default (extract(epoch from now()) * 1000)::bigint
);

-- 4. Tabla de asientos reservados / confirmados
create table if not exists public.seats (
  id text primary key,
  event_id text references public.events(id) on delete cascade not null,
  car_id text references public.cars(id) on delete cascade not null,
  leg text not null check (leg in ('ida', 'vuelta')),
  code text not null,
  person_id text references public.people(id) on delete cascade not null,
  name text not null,
  confirmed boolean not null default false,
  user_id uuid references auth.users(id) on delete set null default auth.uid(),
  updated_at bigint default (extract(epoch from now()) * 1000)::bigint
);

-- 5. Índices para consultas rápidas
create index if not exists idx_cars_event on public.cars(event_id);
create index if not exists idx_people_event on public.people(event_id);
create index if not exists idx_seats_event on public.seats(event_id);

-- 6. Row Level Security (RLS)
alter table public.events enable row level security;
alter table public.cars enable row level security;
alter table public.people enable row level security;
alter table public.seats enable row level security;

-- Eventos: cualquier usuario autenticado puede verlos y crear los suyos; solo el creador edita o borra su evento
create policy "events_select_auth" on public.events
  for select to authenticated using (true);

create policy "events_insert_own" on public.events
  for insert to authenticated with check (auth.uid() = user_id);

create policy "events_update_own" on public.events
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "events_delete_own" on public.events
  for delete to authenticated using (auth.uid() = user_id);

-- Autos: usuarios autenticados pueden ver, agregar, editar y quitar autos en los eventos
create policy "cars_all_auth" on public.cars
  for all to authenticated using (true) with check (true);

-- Pasajeros: usuarios autenticados pueden ver, agregar y quitar pasajeros
create policy "people_all_auth" on public.people
  for all to authenticated using (true) with check (true);

-- Asientos: usuarios autenticados pueden reservar, confirmar y liberar asientos
create policy "seats_all_auth" on public.seats
  for all to authenticated using (true) with check (true);

-- 7. Habilitar Realtime para sincronización en vivo
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.cars;
alter publication supabase_realtime add table public.people;
alter publication supabase_realtime add table public.seats;
