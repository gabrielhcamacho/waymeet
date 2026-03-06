-- ============================================================
-- WayMeet — Migration 002: Real-Time Social System
-- ============================================================

-- ────────────────────────────────────────────────────────
-- 1. user_presence (presença ativa com TTL de 10 min)
-- ────────────────────────────────────────────────────────

create table public.user_presence (
    user_id        uuid primary key references public.profiles(id) on delete cascade,
    latitude       double precision not null,
    longitude      double precision not null,
    location       extensions.geometry(Point, 4326),
    intention_type intention_type,
    last_active    timestamptz not null default now()
);

create index idx_presence_location on public.user_presence using gist(location);
create index idx_presence_last_active on public.user_presence(last_active);

-- Trigger to auto-update geometry from lat/lng
create or replace function public.update_presence_geometry()
returns trigger
language plpgsql
as $$
begin
    new.location = st_setsrid(st_makepoint(new.longitude, new.latitude), 4326);
    new.last_active = now();
    return new;
end;
$$;

create trigger presence_geometry
    before insert or update on public.user_presence
    for each row execute procedure public.update_presence_geometry();


-- ────────────────────────────────────────────────────────
-- 2. activity_feed (feed de atividade recente)
-- ────────────────────────────────────────────────────────

create type activity_feed_type as enum (
    'event_created', 'user_arrived', 'route_started',
    'intention_set', 'community_joined', 'event_joined'
);

create table public.activity_feed (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid not null references public.profiles(id) on delete cascade,
    type         activity_feed_type not null,
    description  text not null,
    metadata     jsonb default '{}',
    created_at   timestamptz not null default now()
);

create index idx_feed_created on public.activity_feed(created_at desc);
create index idx_feed_user on public.activity_feed(user_id);
create index idx_feed_community on public.activity_feed using gin(metadata jsonb_path_ops);


-- ────────────────────────────────────────────────────────
-- 3. Funções de consulta
-- ────────────────────────────────────────────────────────

-- Buscar usuários ativos num raio (últimos N minutos)
create or replace function public.get_nearby_active_users(
    p_latitude double precision,
    p_longitude double precision,
    p_radius_km double precision default 5,
    p_minutes integer default 10,
    p_exclude_user uuid default null
)
returns table (
    user_id uuid,
    display_name text,
    avatar_url text,
    latitude double precision,
    longitude double precision,
    intention_type intention_type,
    last_active timestamptz,
    mode user_mode,
    distance_km double precision
)
language sql
stable
as $$
    select
        up.user_id,
        p.display_name,
        p.avatar_url,
        up.latitude,
        up.longitude,
        up.intention_type,
        up.last_active,
        p.mode,
        round((st_distancesphere(
            up.location,
            st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)
        ) / 1000)::numeric, 2)::double precision as distance_km
    from public.user_presence up
    join public.profiles p on p.id = up.user_id
    where up.last_active > now() - (p_minutes || ' minutes')::interval
      and (p_exclude_user is null or up.user_id != p_exclude_user)
      and st_dwithin(
          up.location::geography,
          st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography,
          p_radius_km * 1000
      )
    order by distance_km;
$$;

-- Feed de atividade recente com dados do perfil
create or replace function public.get_recent_activity(
    p_limit integer default 20,
    p_community_id uuid default null
)
returns table (
    id uuid,
    type activity_feed_type,
    user_id uuid,
    user_name text,
    user_avatar text,
    description text,
    metadata jsonb,
    created_at timestamptz
)
language sql
stable
as $$
    select
        af.id,
        af.type,
        af.user_id,
        p.display_name,
        p.avatar_url,
        af.description,
        af.metadata,
        af.created_at
    from public.activity_feed af
    join public.profiles p on p.id = af.user_id
    where (p_community_id is null or af.metadata->>'communityId' = p_community_id::text)
    order by af.created_at desc
    limit p_limit;
$$;

-- Contar usuários com mesma intenção num raio (para matching)
create or replace function public.get_intention_matches(
    p_latitude double precision,
    p_longitude double precision,
    p_intention intention_type,
    p_radius_km double precision default 3,
    p_exclude_user uuid default null
)
returns table (
    matched_count bigint,
    users jsonb
)
language sql
stable
as $$
    select
        count(*) as matched_count,
        jsonb_agg(jsonb_build_object(
            'userId', up.user_id,
            'displayName', p.display_name,
            'avatarUrl', p.avatar_url,
            'distance', round((st_distancesphere(
                up.location,
                st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)
            ) / 1000)::numeric, 1)
        )) as users
    from public.user_presence up
    join public.profiles p on p.id = up.user_id
    where up.intention_type = p_intention
      and up.last_active > now() - interval '10 minutes'
      and (p_exclude_user is null or up.user_id != p_exclude_user)
      and st_dwithin(
          up.location::geography,
          st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography,
          p_radius_km * 1000
      );
$$;


-- ────────────────────────────────────────────────────────
-- 4. RLS
-- ────────────────────────────────────────────────────────

alter table public.user_presence enable row level security;
alter table public.activity_feed enable row level security;

-- Presença: leitura pública (para ver quem está ativo), escrita própria
create policy "presence_public_read" on public.user_presence
    for select using (last_active > now() - interval '10 minutes');

create policy "presence_own_upsert" on public.user_presence
    for all using (auth.uid() = user_id);

-- Feed: leitura pública, inserção autenticada
create policy "feed_public_read" on public.activity_feed
    for select using (true);

create policy "feed_auth_insert" on public.activity_feed
    for insert with check (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────
-- 5. Realtime
-- ────────────────────────────────────────────────────────

alter publication supabase_realtime add table public.user_presence;
alter publication supabase_realtime add table public.activity_feed;


-- ────────────────────────────────────────────────────────
-- 6. Cron: limpeza de presença antiga (a cada 5 min)
-- ────────────────────────────────────────────────────────

-- select cron.schedule('cleanup-stale-presence', '*/5 * * * *', $$
--     delete from public.user_presence where last_active < now() - interval '30 minutes';
-- $$);

-- select cron.schedule('cleanup-old-feed', '0 * * * *', $$
--     delete from public.activity_feed where created_at < now() - interval '24 hours';
-- $$);
