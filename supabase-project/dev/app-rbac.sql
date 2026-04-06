-- App-specific auth bootstrap and RBAC policies.
-- Run this against the database that backs the app workspace.

begin;

create extension if not exists pgcrypto;

insert into public.feature_flags (id, "usersEnabled", "tagsEnabled", "approvalEnabled")
values (true, false, false, true)
on conflict (id) do nothing;

create or replace function public.app_role_for_user(user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.app_role
  from public.profiles as p
  where p.id = user_id
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.app_role_for_user(auth.uid())
$$;

create or replace function public.users_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select ff."usersEnabled"
      from public.feature_flags as ff
      where ff.id = true
    ),
    false
  )
$$;

create or replace function public.tags_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select ff."tagsEnabled"
      from public.feature_flags as ff
      where ff.id = true
    ),
    false
  )
$$;

create or replace function public.approval_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select ff."approvalEnabled"
      from public.feature_flags as ff
      where ff.id = true
    ),
    true
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'ADMIN'
$$;

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'MODERATOR'
$$;

create or replace function public.list_manageable_users()
returns table (
  id uuid,
  email text,
  display_name text,
  app_role text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null or public.current_app_role() not in ('ADMIN', 'MODERATOR') then
    raise exception 'insufficient_privilege';
  end if;

  return query
  select
    profiles.id,
    users.email::text,
    coalesce(
      nullif(btrim(users.raw_user_meta_data ->> 'display_name'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'user_name'), ''),
      nullif(btrim(users.raw_user_meta_data ->> 'username'), ''),
      nullif(split_part(coalesce(users.email, ''), '@', 1), ''),
      'Unknown user'
    ) as display_name,
    profiles.app_role::text,
    profiles.created_at
  from public.profiles as profiles
  join auth.users as users
    on users.id = profiles.id
  order by profiles.created_at desc nulls last, users.email asc nulls last;
end;
$$;

revoke all on function public.list_manageable_users() from public;
grant execute on function public.list_manageable_users() to authenticated;

create or replace function public.can_create_posts()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.current_app_role() in ('ADMIN', 'MODERATOR') then true
    when public.current_app_role() = 'USER' then public.users_enabled()
    else false
  end
$$;

create or replace function public.can_view_post(post_author_id uuid, post_status text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when post_status = 'published' then true
    when auth.uid() is null then false
    when public.current_app_role() in ('ADMIN', 'MODERATOR') then true
    when post_author_id = auth.uid() then true
    else false
  end
$$;

create or replace function public.can_moderate_post(post_author_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.current_app_role() = 'ADMIN' then true
    when public.current_app_role() = 'MODERATOR' then
      post_author_id <> auth.uid()
      and public.app_role_for_user(post_author_id) in ('USER', 'MODERATOR')
    else false
  end
$$;

create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, app_role, created_at)
  values (new.id, 'USER', now())
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.insert_location(
  lat double precision,
  lng double precision,
  p_address text default null,
  p_city text default null,
  p_state text default null,
  p_country text default null
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_id bigint;
begin
  if auth.uid() is null
     or public.current_app_role() not in ('ADMIN', 'MODERATOR', 'USER')
  then
    raise exception 'insufficient_privilege';
  end if;

  insert into public.locations (location, address, city, state, country)
  values (
    st_setsrid(st_makepoint(lng, lat), 4326)::geography,
    p_address,
    p_city,
    p_state,
    p_country
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.insert_location(double precision, double precision, text, text, text, text) from public;
grant execute on function public.insert_location(double precision, double precision, text, text, text, text) to authenticated;

create or replace function public.update_location(
  p_location_id bigint,
  lat double precision,
  lng double precision,
  p_address text default null,
  p_city text default null,
  p_state text default null,
  p_country text default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null
     or public.current_app_role() not in ('ADMIN', 'MODERATOR', 'USER')
  then
    raise exception 'insufficient_privilege';
  end if;

  update public.locations
  set
    location = st_setsrid(st_makepoint(lng, lat), 4326)::geography,
    address  = p_address,
    city     = p_city,
    state    = p_state,
    country  = p_country
  where id = p_location_id;

  if not found then
    raise exception 'location_not_found';
  end if;
end;
$$;

revoke all on function public.update_location(bigint, double precision, double precision, text, text, text, text) from public;
grant execute on function public.update_location(bigint, double precision, double precision, text, text, text, text) to authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_profile();

insert into public.profiles (id, app_role, created_at)
select users.id, 'USER', now()
from auth.users as users
left join public.profiles as profiles
  on profiles.id = users.id
where profiles.id is null;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.feature_flags enable row level security;
alter table public.pages enable row level security;
alter table public.post_tags enable row level security;
alter table public.locations enable row level security;

drop index if exists public.post_tags_post_id_idx;
drop index if exists public.post_tags_tag_id_idx;
drop index if exists public.locations_location_gist;

drop policy if exists "Read locations for all public users" on public.locations;
create policy "Read locations for all public users"
  on public.locations
  for select
  using (true);

drop policy if exists "Write location" on public.locations;
drop policy if exists "locations_insert" on public.locations;
create policy "locations_insert"
  on public.locations
  for insert
  with check (
    (select public.current_app_role()) in ('ADMIN', 'MODERATOR', 'USER')
  );

drop policy if exists "locations_update" on public.locations;
create policy "locations_update"
  on public.locations
  for update
  using (
    (select public.current_app_role()) in ('ADMIN', 'MODERATOR', 'USER')
  )
  with check (
    (select public.current_app_role()) in ('ADMIN', 'MODERATOR', 'USER')
  );

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles
  for select
  using (
    (select auth.uid()) = id
    or public.is_admin()
  );

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles
  for insert
  with check (
    (select auth.uid()) = id
    and app_role = 'USER'
  );

drop policy if exists "profiles_admin_manage_roles" on public.profiles;
create policy "profiles_admin_manage_roles"
  on public.profiles
  for update
  using (
    public.is_admin()
    and app_role in ('USER', 'MODERATOR')
  )
  with check (
    public.is_admin()
    and app_role in ('USER', 'MODERATOR')
  );

drop policy if exists "All access" on public.feature_flags;
drop policy if exists "feature_flags_public_read" on public.feature_flags;
create policy "feature_flags_public_read"
  on public.feature_flags
  for select
  using (true);

drop policy if exists "feature_flags_admin_write" on public.feature_flags;
drop policy if exists "feature_flags_admin_insert" on public.feature_flags;
drop policy if exists "feature_flags_admin_update" on public.feature_flags;
drop policy if exists "feature_flags_admin_delete" on public.feature_flags;

create policy "feature_flags_admin_insert"
  on public.feature_flags
  for insert
  with check (public.is_admin());

create policy "feature_flags_admin_update"
  on public.feature_flags
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "feature_flags_admin_delete"
  on public.feature_flags
  for delete
  using (public.is_admin());

drop policy if exists "pages_public_read" on public.pages;
create policy "pages_public_read"
  on public.pages
  for select
  using (true);

drop policy if exists "pages_admin_write" on public.pages;
drop policy if exists "pages_admin_insert" on public.pages;
drop policy if exists "pages_admin_update" on public.pages;
drop policy if exists "pages_admin_delete" on public.pages;

create policy "pages_admin_insert"
  on public.pages
  for insert
  with check (public.is_admin());

create policy "pages_admin_update"
  on public.pages
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "pages_admin_delete"
  on public.pages
  for delete
  using (public.is_admin());

alter table public.pages drop constraint if exists pages_id_key;

drop policy if exists "Read tags" on public.tags;
drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read"
  on public.tags
  for select
  using (
    public.tags_enabled()
    or public.is_admin()
  );

drop policy if exists "tags_admin_write" on public.tags;
drop policy if exists "tags_admin_insert" on public.tags;
drop policy if exists "tags_admin_update" on public.tags;
drop policy if exists "tags_admin_delete" on public.tags;

create policy "tags_admin_insert"
  on public.tags
  for insert
  with check (
    public.is_admin()
    and public.tags_enabled()
  );

create policy "tags_admin_update"
  on public.tags
  for update
  using (
    public.is_admin()
    and public.tags_enabled()
  )
  with check (
    public.is_admin()
    and public.tags_enabled()
  );

create policy "tags_admin_delete"
  on public.tags
  for delete
  using (
    public.is_admin()
    and public.tags_enabled()
  );

drop policy if exists "Access for supabase superuser" on public.posts;
drop policy if exists "posts_public_or_owner_or_staff_read" on public.posts;
create policy "posts_public_or_owner_or_staff_read"
  on public.posts
  for select
  using (public.can_view_post(author_id, status));

drop policy if exists "posts_insert_by_role" on public.posts;
create policy "posts_insert_by_role"
  on public.posts
  for insert
  with check (
    public.can_create_posts()
    and author_id = (select auth.uid())
    and moderator_id is null
    and (
      (public.current_app_role() = 'ADMIN' and status = 'published')
      or (public.current_app_role() in ('MODERATOR', 'USER') and status = 'pending')
    )
  );

drop policy if exists "posts_author_edit_own_unpublished" on public.posts;
drop policy if exists "posts_moderate_status" on public.posts;
drop policy if exists "posts_update" on public.posts;
create policy "posts_update"
  on public.posts
  for update
  using (
    (
      (select auth.uid()) = author_id
      and status in ('pending', 'rejected')
    )
    or public.can_moderate_post(author_id)
  )
  with check (
    (
      (select auth.uid()) = author_id
      and moderator_id is null
      and status in ('pending', 'rejected')
    )
    or (
      public.can_moderate_post(author_id)
      and moderator_id = (select auth.uid())
      and status in ('published', 'rejected', 'pending')
    )
  );

drop policy if exists "Read tags association table" on public.post_tags;
drop policy if exists "post_tags_read_with_visible_post" on public.post_tags;
create policy "post_tags_read_with_visible_post"
  on public.post_tags
  for select
  using (
    exists (
      select 1
      from public.posts as posts
      where posts.id = post_id
        and public.can_view_post(posts.author_id, posts.status)
    )
  );

drop policy if exists "post_tags_insert_for_owned_posts" on public.post_tags;
create policy "post_tags_insert_for_owned_posts"
  on public.post_tags
  for insert
  with check (
    public.tags_enabled()
    and exists (
      select 1
      from public.posts as posts
      where posts.id = post_id
        and posts.author_id = (select auth.uid())
    )
  );

drop policy if exists "post_tags_delete_for_owned_posts" on public.post_tags;
create policy "post_tags_delete_for_owned_posts"
  on public.post_tags
  for delete
  using (
    public.tags_enabled()
    and exists (
      select 1
      from public.posts as posts
      where posts.id = post_id
        and posts.author_id = (select auth.uid())
    )
  );

commit;