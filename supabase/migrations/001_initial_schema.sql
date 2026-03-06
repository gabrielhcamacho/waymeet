-- ============================================================
-- WayMeet — Schema Completo para Supabase
-- Gerado em: 2026-03-06
-- ============================================================

-- ============================================================
-- 0. EXTENSÕES
-- ============================================================

create extension if not exists "postgis" with schema extensions;
create extension if not exists "pg_trgm" with schema extensions;


-- ============================================================
-- 1. ENUMS
-- ============================================================

create type user_mode as enum ('visitante', 'morador');

create type event_participant_status as enum ('interested', 'confirmed', 'arrived');

create type intention_type as enum (
    'cafe', 'drinks', 'esporte', 'explorar',
    'musica', 'yoga', 'trabalhar_cafe', 'anti_solidao'
);


-- ============================================================
-- 2. TABELAS PRINCIPAIS
-- ============================================================

-- ────────────────────────────────────────────────────────
-- 2.1 profiles (estende auth.users)
-- ────────────────────────────────────────────────────────

create table public.profiles (
    id            uuid primary key references auth.users(id) on delete cascade,
    display_name  text not null default '',
    email         text not null default '',
    avatar_url    text default '',
    cover_photo_url text default '',
    bio           text default '',
    home_city     text default '',
    mode          user_mode not null default 'visitante',
    reputation    numeric(3,1) not null default 0,
    host_events_count integer not null default 0,
    gdpr_consent  boolean not null default false,
    email_verified boolean not null default false,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público do usuário, estende auth.users';

-- trigger para auto-criar profile quando signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
    insert into public.profiles (id, email, display_name, avatar_url)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', ''),
        coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- trigger para atualizar updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger profiles_updated_at
    before update on public.profiles
    for each row execute procedure public.update_updated_at();


-- ────────────────────────────────────────────────────────
-- 2.2 follows (seguidores)
-- ────────────────────────────────────────────────────────

create table public.follows (
    follower_id  uuid not null references public.profiles(id) on delete cascade,
    following_id uuid not null references public.profiles(id) on delete cascade,
    created_at   timestamptz not null default now(),
    primary key (follower_id, following_id),
    constraint no_self_follow check (follower_id != following_id)
);

create index idx_follows_following on public.follows(following_id);


-- ────────────────────────────────────────────────────────
-- 2.3 categories
-- ────────────────────────────────────────────────────────

create table public.categories (
    id        text primary key,
    name      text not null,
    icon_name text not null default 'pin',
    color     text not null default '#FF7A00'
);

-- categorias do usuario (onboarding)
create table public.user_categories (
    user_id     uuid not null references public.profiles(id) on delete cascade,
    category_id text not null references public.categories(id) on delete cascade,
    primary key (user_id, category_id)
);


-- ────────────────────────────────────────────────────────
-- 2.4 events (regulares + efêmeros)
-- ────────────────────────────────────────────────────────

create table public.events (
    id               uuid primary key default gen_random_uuid(),
    title            text not null,
    description      text default '',
    image_url        text default '',
    category         text not null references public.categories(id),
    date             date not null,
    start_time       time not null,
    location         extensions.geometry(Point, 4326),
    latitude         double precision not null,
    longitude        double precision not null,
    location_name    text not null default '',
    creator_id       uuid not null references public.profiles(id) on delete cascade,
    max_participants integer not null default 20,
    price            numeric(10,2) not null default 0,
    is_public        boolean not null default true,
    is_ephemeral     boolean not null default false,
    expires_at       timestamptz,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create index idx_events_creator on public.events(creator_id);
create index idx_events_category on public.events(category);
create index idx_events_date on public.events(date);
create index idx_events_location on public.events using gist(location);
create index idx_events_ephemeral on public.events(is_ephemeral) where is_ephemeral = true;

create trigger events_updated_at
    before update on public.events
    for each row execute procedure public.update_updated_at();


-- ────────────────────────────────────────────────────────
-- 2.5 event_participants (confirmação social)
-- ────────────────────────────────────────────────────────

create table public.event_participants (
    event_id   uuid not null references public.events(id) on delete cascade,
    user_id    uuid not null references public.profiles(id) on delete cascade,
    status     event_participant_status not null default 'interested',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (event_id, user_id)
);

create index idx_event_participants_user on public.event_participants(user_id);

create trigger event_participants_updated_at
    before update on public.event_participants
    for each row execute procedure public.update_updated_at();


-- ────────────────────────────────────────────────────────
-- 2.6 communities (micro comunidades)
-- ────────────────────────────────────────────────────────

create table public.communities (
    id          uuid primary key default gen_random_uuid(),
    name        text not null,
    description text default '',
    image_url   text default '',
    creator_id  uuid not null references public.profiles(id) on delete cascade,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create trigger communities_updated_at
    before update on public.communities
    for each row execute procedure public.update_updated_at();


-- ────────────────────────────────────────────────────────
-- 2.7 community_members
-- ────────────────────────────────────────────────────────

create table public.community_members (
    community_id uuid not null references public.communities(id) on delete cascade,
    user_id      uuid not null references public.profiles(id) on delete cascade,
    role         text not null default 'member', -- 'member', 'admin'
    joined_at    timestamptz not null default now(),
    primary key (community_id, user_id)
);

create index idx_community_members_user on public.community_members(user_id);


-- ────────────────────────────────────────────────────────
-- 2.8 community_events (vincula eventos a comunidades)
-- ────────────────────────────────────────────────────────

create table public.community_events (
    community_id uuid not null references public.communities(id) on delete cascade,
    event_id     uuid not null references public.events(id) on delete cascade,
    primary key (community_id, event_id)
);


-- ────────────────────────────────────────────────────────
-- 2.9 intentions (intenções sociais ativas)
-- ────────────────────────────────────────────────────────

create table public.intentions (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references public.profiles(id) on delete cascade,
    type       intention_type not null,
    label      text not null,
    latitude   double precision,
    longitude  double precision,
    location   extensions.geometry(Point, 4326),
    expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint one_active_per_user unique (user_id)
);

create index idx_intentions_location on public.intentions using gist(location);
create index idx_intentions_expires on public.intentions(expires_at);


-- ────────────────────────────────────────────────────────
-- 2.10 places (lugares)
-- ────────────────────────────────────────────────────────

create table public.places (
    id             uuid primary key default gen_random_uuid(),
    name           text not null,
    description    text default '',
    image_url      text default '',
    rating         numeric(2,1) not null default 0,
    address        text not null default '',
    city           text not null default '',
    category       text not null references public.categories(id),
    icon_names     text[] not null default '{}',
    latitude       double precision not null,
    longitude      double precision not null,
    location       extensions.geometry(Point, 4326),
    created_by     uuid references public.profiles(id),
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);

create index idx_places_location on public.places using gist(location);
create index idx_places_category on public.places(category);
create index idx_places_city on public.places(city);

create trigger places_updated_at
    before update on public.places
    for each row execute procedure public.update_updated_at();


-- ────────────────────────────────────────────────────────
-- 2.11 social_routes (rotas sociais)
-- ────────────────────────────────────────────────────────

create table public.social_routes (
    id          uuid primary key default gen_random_uuid(),
    title       text not null,
    description text default '',
    image_url   text default '',
    creator_id  uuid not null references public.profiles(id) on delete cascade,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create trigger social_routes_updated_at
    before update on public.social_routes
    for each row execute procedure public.update_updated_at();


-- ────────────────────────────────────────────────────────
-- 2.12 route_places (lugares da rota, ordenados)
-- ────────────────────────────────────────────────────────

create table public.route_places (
    route_id   uuid not null references public.social_routes(id) on delete cascade,
    place_id   uuid not null references public.places(id) on delete cascade,
    position   integer not null,
    primary key (route_id, place_id)
);


-- ────────────────────────────────────────────────────────
-- 2.13 route_groups (grupos ativos em uma rota)
-- ────────────────────────────────────────────────────────

create table public.route_groups (
    id         uuid primary key default gen_random_uuid(),
    route_id   uuid not null references public.social_routes(id) on delete cascade,
    creator_id uuid not null references public.profiles(id) on delete cascade,
    current_place_position integer not null default 0,
    started_at timestamptz not null default now(),
    finished_at timestamptz
);

create table public.route_group_members (
    group_id  uuid not null references public.route_groups(id) on delete cascade,
    user_id   uuid not null references public.profiles(id) on delete cascade,
    joined_at timestamptz not null default now(),
    primary key (group_id, user_id)
);


-- ────────────────────────────────────────────────────────
-- 2.14 chat_messages (mensagens por evento)
-- ────────────────────────────────────────────────────────

create table public.chat_messages (
    id         uuid primary key default gen_random_uuid(),
    event_id   uuid not null references public.events(id) on delete cascade,
    user_id    uuid not null references public.profiles(id) on delete cascade,
    text       text not null,
    is_system  boolean not null default false,
    created_at timestamptz not null default now()
);

create index idx_chat_event on public.chat_messages(event_id, created_at);


-- ────────────────────────────────────────────────────────
-- 2.15 reviews (avaliações pós-evento)
-- ────────────────────────────────────────────────────────

create table public.reviews (
    id            uuid primary key default gen_random_uuid(),
    event_id      uuid not null references public.events(id) on delete cascade,
    reviewer_id   uuid not null references public.profiles(id) on delete cascade,
    reviewed_id   uuid not null references public.profiles(id) on delete cascade,
    showed_up     boolean not null default true,
    respectful    integer not null default 5 check (respectful between 1 and 5),
    good_vibes    integer not null default 5 check (good_vibes between 1 and 5),
    comment       text default '',
    created_at    timestamptz not null default now(),
    constraint one_review_per_pair unique (event_id, reviewer_id, reviewed_id),
    constraint no_self_review check (reviewer_id != reviewed_id)
);

create index idx_reviews_reviewed on public.reviews(reviewed_id);


-- ────────────────────────────────────────────────────────
-- 2.16 heat_zones (zonas de calor social — atualizadas via cron)
-- ────────────────────────────────────────────────────────

create table public.heat_zones (
    id        uuid primary key default gen_random_uuid(),
    name      text not null,
    city      text not null,
    intensity numeric(3,2) not null default 0 check (intensity between 0 and 1),
    latitude  double precision not null,
    longitude double precision not null,
    location  extensions.geometry(Point, 4326),
    updated_at timestamptz not null default now()
);

create index idx_heat_zones_city on public.heat_zones(city);
create index idx_heat_zones_location on public.heat_zones using gist(location);


-- ────────────────────────────────────────────────────────
-- 2.17 notifications
-- ────────────────────────────────────────────────────────

create table public.notifications (
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid not null references public.profiles(id) on delete cascade,
    type       text not null, -- 'event_invite', 'new_follower', 'review', 'intention_match', 'community_event'
    title      text not null,
    body       text default '',
    data       jsonb default '{}',
    read       boolean not null default false,
    created_at timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id, read, created_at desc);


-- ============================================================
-- 3. VIEWS (contadores derivados)
-- ============================================================

-- Contadores de confirmação social por evento
create or replace view public.event_confirmation_counts as
select
    event_id,
    count(*) filter (where status = 'interested') as interested_count,
    count(*) filter (where status = 'confirmed')  as confirmed_count,
    count(*) filter (where status = 'arrived')     as arrived_count
from public.event_participants
group by event_id;

-- Contadores de membros por comunidade
create or replace view public.community_member_counts as
select
    community_id,
    count(*) as member_count
from public.community_members
group by community_id;

-- Contadores de seguidores/seguindo por usuário
create or replace view public.follow_counts as
select
    p.id as user_id,
    coalesce(followers.count, 0) as followers_count,
    coalesce(following.count, 0) as following_count
from public.profiles p
left join lateral (
    select count(*) from public.follows where following_id = p.id
) followers(count) on true
left join lateral (
    select count(*) from public.follows where follower_id = p.id
) following(count) on true;

-- Grupos ativos por rota
create or replace view public.route_active_group_counts as
select
    route_id,
    count(*) as active_groups
from public.route_groups
where finished_at is null
group by route_id;


-- ============================================================
-- 4. FUNÇÕES AUXILIARES
-- ============================================================

-- Calcula reputação de um usuário baseado em reviews
create or replace function public.calculate_reputation(p_user_id uuid)
returns numeric
language sql
stable
as $$
    select coalesce(
        round(
            avg(
                case when showed_up then 1.0 else 0.0 end * 2 +
                respectful::numeric / 5.0 * 1.5 +
                good_vibes::numeric / 5.0 * 1.5
            ), 1
        ),
        0
    )
    from public.reviews
    where reviewed_id = p_user_id;
$$;

-- Busca intenções ativas numa área (para matching)
create or replace function public.get_nearby_intentions(
    p_latitude double precision,
    p_longitude double precision,
    p_radius_km double precision default 5,
    p_exclude_user uuid default null
)
returns table (
    id uuid,
    user_id uuid,
    type intention_type,
    label text,
    distance_km double precision,
    display_name text,
    avatar_url text
)
language sql
stable
as $$
    select
        i.id,
        i.user_id,
        i.type,
        i.label,
        round((st_distancesphere(
            i.location,
            st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)
        ) / 1000)::numeric, 1)::double precision as distance_km,
        p.display_name,
        p.avatar_url
    from public.intentions i
    join public.profiles p on p.id = i.user_id
    where i.expires_at > now()
      and (p_exclude_user is null or i.user_id != p_exclude_user)
      and st_dwithin(
          i.location::geography,
          st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography,
          p_radius_km * 1000
      )
    order by distance_km;
$$;

-- Busca eventos próximos com contadores
create or replace function public.get_nearby_events(
    p_latitude double precision,
    p_longitude double precision,
    p_radius_km double precision default 10,
    p_limit integer default 20
)
returns table (
    id uuid,
    title text,
    image_url text,
    category text,
    date date,
    start_time time,
    location_name text,
    latitude double precision,
    longitude double precision,
    price numeric,
    is_ephemeral boolean,
    expires_at timestamptz,
    creator_id uuid,
    creator_name text,
    creator_avatar text,
    interested_count bigint,
    confirmed_count bigint,
    arrived_count bigint,
    distance_km double precision
)
language sql
stable
as $$
    select
        e.id,
        e.title,
        e.image_url,
        e.category,
        e.date,
        e.start_time,
        e.location_name,
        e.latitude,
        e.longitude,
        e.price,
        e.is_ephemeral,
        e.expires_at,
        e.creator_id,
        p.display_name as creator_name,
        p.avatar_url as creator_avatar,
        coalesce(c.interested_count, 0),
        coalesce(c.confirmed_count, 0),
        coalesce(c.arrived_count, 0),
        round((st_distancesphere(
            e.location,
            st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)
        ) / 1000)::numeric, 1)::double precision as distance_km
    from public.events e
    join public.profiles p on p.id = e.creator_id
    left join public.event_confirmation_counts c on c.event_id = e.id
    where e.is_public = true
      and (e.is_ephemeral = false or e.expires_at > now())
      and e.date >= current_date
      and st_dwithin(
          e.location::geography,
          st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography,
          p_radius_km * 1000
      )
    order by e.date, e.start_time
    limit p_limit;
$$;


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Ativar RLS em todas as tabelas
alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.categories enable row level security;
alter table public.user_categories enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.community_events enable row level security;
alter table public.intentions enable row level security;
alter table public.places enable row level security;
alter table public.social_routes enable row level security;
alter table public.route_places enable row level security;
alter table public.route_groups enable row level security;
alter table public.route_group_members enable row level security;
alter table public.chat_messages enable row level security;
alter table public.reviews enable row level security;
alter table public.heat_zones enable row level security;
alter table public.notifications enable row level security;

-- ── profiles ──
create policy "profiles_public_read" on public.profiles
    for select using (true);

create policy "profiles_own_update" on public.profiles
    for update using (auth.uid() = id);

-- ── follows ──
create policy "follows_public_read" on public.follows
    for select using (true);

create policy "follows_own_insert" on public.follows
    for insert with check (auth.uid() = follower_id);

create policy "follows_own_delete" on public.follows
    for delete using (auth.uid() = follower_id);

-- ── categories ──
create policy "categories_public_read" on public.categories
    for select using (true);

-- ── user_categories ──
create policy "user_categories_read" on public.user_categories
    for select using (true);

create policy "user_categories_own_manage" on public.user_categories
    for all using (auth.uid() = user_id);

-- ── events ──
create policy "events_public_read" on public.events
    for select using (is_public = true or creator_id = auth.uid());

create policy "events_auth_create" on public.events
    for insert with check (auth.uid() = creator_id);

create policy "events_own_update" on public.events
    for update using (auth.uid() = creator_id);

create policy "events_own_delete" on public.events
    for delete using (auth.uid() = creator_id);

-- ── event_participants ──
create policy "event_participants_read" on public.event_participants
    for select using (true);

create policy "event_participants_own_manage" on public.event_participants
    for all using (auth.uid() = user_id);

-- ── communities ──
create policy "communities_public_read" on public.communities
    for select using (true);

create policy "communities_auth_create" on public.communities
    for insert with check (auth.uid() = creator_id);

create policy "communities_own_update" on public.communities
    for update using (auth.uid() = creator_id);

-- ── community_members ──
create policy "community_members_read" on public.community_members
    for select using (true);

create policy "community_members_own_manage" on public.community_members
    for all using (auth.uid() = user_id);

-- ── community_events ──
create policy "community_events_read" on public.community_events
    for select using (true);

-- ── intentions ──
create policy "intentions_public_read" on public.intentions
    for select using (expires_at > now());

create policy "intentions_own_manage" on public.intentions
    for all using (auth.uid() = user_id);

-- ── places ──
create policy "places_public_read" on public.places
    for select using (true);

create policy "places_auth_create" on public.places
    for insert with check (auth.uid() is not null);

-- ── social_routes ──
create policy "social_routes_public_read" on public.social_routes
    for select using (true);

create policy "social_routes_auth_create" on public.social_routes
    for insert with check (auth.uid() = creator_id);

-- ── route_places ──
create policy "route_places_public_read" on public.route_places
    for select using (true);

-- ── route_groups ──
create policy "route_groups_public_read" on public.route_groups
    for select using (true);

create policy "route_groups_auth_create" on public.route_groups
    for insert with check (auth.uid() = creator_id);

-- ── route_group_members ──
create policy "route_group_members_read" on public.route_group_members
    for select using (true);

create policy "route_group_members_own_manage" on public.route_group_members
    for all using (auth.uid() = user_id);

-- ── chat_messages ──
create policy "chat_messages_read" on public.chat_messages
    for select using (
        exists (
            select 1 from public.event_participants ep
            where ep.event_id = chat_messages.event_id
              and ep.user_id = auth.uid()
        )
    );

create policy "chat_messages_participant_insert" on public.chat_messages
    for insert with check (
        auth.uid() = user_id
        and exists (
            select 1 from public.event_participants ep
            where ep.event_id = chat_messages.event_id
              and ep.user_id = auth.uid()
        )
    );

-- ── reviews ──
create policy "reviews_public_read" on public.reviews
    for select using (true);

create policy "reviews_participant_create" on public.reviews
    for insert with check (
        auth.uid() = reviewer_id
        and exists (
            select 1 from public.event_participants ep
            where ep.event_id = reviews.event_id
              and ep.user_id = auth.uid()
        )
    );

-- ── heat_zones ──
create policy "heat_zones_public_read" on public.heat_zones
    for select using (true);

-- ── notifications ──
create policy "notifications_own_read" on public.notifications
    for select using (auth.uid() = user_id);

create policy "notifications_own_update" on public.notifications
    for update using (auth.uid() = user_id);


-- ============================================================
-- 6. REALTIME (habilitar para tabelas relevantes)
-- ============================================================

alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.event_participants;
alter publication supabase_realtime add table public.intentions;
alter publication supabase_realtime add table public.notifications;


-- ============================================================
-- 7. STORAGE BUCKETS
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
    ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
    ('covers', 'covers', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
    ('event-images', 'event-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
    ('community-images', 'community-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
    ('place-images', 'place-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
    ('route-images', 'route-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']);

-- Storage policies: upload próprio, leitura pública
create policy "avatar_upload" on storage.objects
    for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatar_public_read" on storage.objects
    for select using (bucket_id = 'avatars');

create policy "avatar_own_update" on storage.objects
    for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "cover_upload" on storage.objects
    for insert with check (bucket_id = 'covers' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "cover_public_read" on storage.objects
    for select using (bucket_id = 'covers');

create policy "event_image_upload" on storage.objects
    for insert with check (bucket_id = 'event-images' and auth.uid() is not null);

create policy "event_image_public_read" on storage.objects
    for select using (bucket_id = 'event-images');

create policy "community_image_upload" on storage.objects
    for insert with check (bucket_id = 'community-images' and auth.uid() is not null);

create policy "community_image_public_read" on storage.objects
    for select using (bucket_id = 'community-images');

create policy "place_image_upload" on storage.objects
    for insert with check (bucket_id = 'place-images' and auth.uid() is not null);

create policy "place_image_public_read" on storage.objects
    for select using (bucket_id = 'place-images');

create policy "route_image_upload" on storage.objects
    for insert with check (bucket_id = 'route-images' and auth.uid() is not null);

create policy "route_image_public_read" on storage.objects
    for select using (bucket_id = 'route-images');


-- ============================================================
-- 8. SEED DATA (categorias)
-- ============================================================

insert into public.categories (id, name, icon_name, color) values
    ('Sports', 'Esportes', 'sports', '#22C55E'),
    ('Adventures', 'Aventuras', 'adventures', '#3B82F6'),
    ('Cultural', 'Cultural', 'cultural', '#8B5CF6'),
    ('Gastronomic', 'Gastronomia', 'gastronomic', '#EF4444'),
    ('Musical', 'Música', 'musical', '#EC4899'),
    ('Nightlife', 'Vida Noturna', 'nightlife', '#6366F1'),
    ('Wellness', 'Bem-estar', 'wellness', '#14B8A6'),
    ('Social', 'Social', 'social', '#F59E0B')
on conflict (id) do nothing;


-- ============================================================
-- 9. CRON JOBS (via pg_cron — ativar no Supabase Dashboard)
-- ============================================================

-- Limpa intenções expiradas a cada 15 minutos
-- select cron.schedule('cleanup-expired-intentions', '*/15 * * * *', $$
--     delete from public.intentions where expires_at < now();
-- $$);

-- Limpa eventos efêmeros expirados a cada 15 minutos
-- select cron.schedule('cleanup-expired-events', '*/15 * * * *', $$
--     delete from public.events where is_ephemeral = true and expires_at < now();
-- $$);

-- Recalcula reputação de todos os usuários diariamente
-- select cron.schedule('recalculate-reputation', '0 3 * * *', $$
--     update public.profiles
--     set reputation = public.calculate_reputation(id)
--     where id in (select distinct reviewed_id from public.reviews);
-- $$);
