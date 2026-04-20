-- ============================================================
-- WayMeet — Migration 004: Community Chat Support
-- ============================================================
-- Context:
--   chat_messages was designed exclusively for event chat.
--   event_id is NOT NULL with a FK constraint to events(id),
--   so a community UUID cannot be stored there without a FK violation.
--
-- Changes:
--   1. Make event_id nullable (remove NOT NULL constraint).
--   2. Add community_id column with FK to communities(id).
--   3. Add a CHECK constraint ensuring exactly one of
--      (event_id, community_id) is set per row.
--   4. Add an index for community chat queries.
--   5. Add RLS policies for community chat read/write.
--   6. Register the table with Supabase Realtime (already done
--      in 001, but guarded with IF NOT EXISTS logic below).
-- ============================================================


-- ────────────────────────────────────────────────────────
-- 1. Make event_id nullable
-- ────────────────────────────────────────────────────────

alter table public.chat_messages
    alter column event_id drop not null;


-- ────────────────────────────────────────────────────────
-- 2. Add community_id column
-- ────────────────────────────────────────────────────────

alter table public.chat_messages
    add column community_id uuid references public.communities(id) on delete cascade;


-- ────────────────────────────────────────────────────────
-- 3. Enforce that each message belongs to exactly one context
--    (either an event OR a community, never both, never neither)
-- ────────────────────────────────────────────────────────

alter table public.chat_messages
    add constraint chat_messages_context_exclusive check (
        (event_id is not null and community_id is null)
        or
        (event_id is null and community_id is not null)
    );


-- ────────────────────────────────────────────────────────
-- 4. Index for efficient community chat queries
-- ────────────────────────────────────────────────────────

create index idx_chat_community on public.chat_messages(community_id, created_at)
    where community_id is not null;


-- ────────────────────────────────────────────────────────
-- 5. RLS policies for community chat
--
--    Existing policies (chat_messages_read, chat_messages_participant_insert)
--    remain untouched — they guard event chat and their conditions
--    naturally evaluate to false when event_id is null, so they
--    do not interfere with community rows.
--
--    Community members can read messages in communities they belong to.
--    Community members can insert messages into communities they belong to.
-- ────────────────────────────────────────────────────────

create policy "chat_messages_community_read" on public.chat_messages
    for select using (
        community_id is not null
        and exists (
            select 1 from public.community_members cm
            where cm.community_id = chat_messages.community_id
              and cm.user_id = auth.uid()
        )
    );

create policy "chat_messages_community_insert" on public.chat_messages
    for insert with check (
        community_id is not null
        and auth.uid() = user_id
        and exists (
            select 1 from public.community_members cm
            where cm.community_id = chat_messages.community_id
              and cm.user_id = auth.uid()
        )
    );


-- ────────────────────────────────────────────────────────
-- 6. Realtime publication
--    chat_messages was added to supabase_realtime in migration 001.
--    No action needed — community rows in the same table are
--    automatically covered by the existing publication entry.
--    This comment is retained for explicitness.
-- ────────────────────────────────────────────────────────
-- alter publication supabase_realtime add table public.chat_messages;
-- (already present from 001_initial_schema.sql)
