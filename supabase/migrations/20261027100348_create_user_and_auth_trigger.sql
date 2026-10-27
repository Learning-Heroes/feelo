-- public."user": one row per auth user, created only by the on_auth_user_created trigger.

create table public."user" (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[a-z0-9_]{3,20}$'),
  email text not null unique,
  country text,   -- ISO-3166 alpha-2
  language text,  -- BCP-47
  created_at timestamptz not null default now()
);

create unique index user_username_lower_idx on public."user" (lower(username));

-- RLS: read own row only. No insert/update/delete policy: the trigger is the only writer.
alter table public."user" enable row level security;

create policy "user_select_own" on public."user"
  for select to authenticated using (auth.role() = 'authenticated');

-- Defense in depth: direct writes fail with a permission error instead of silently matching 0 rows.
revoke insert, update, delete, truncate on public."user" from anon, authenticated;

-- Copy the new auth user into public."user" from the signUp metadata.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public."user" (id, username, email, country, language)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.email,
    new.raw_user_meta_data ->> 'country',
    new.raw_user_meta_data ->> 'language'
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Case-insensitive username check for the register form (runs before signUp, so anon needs it).
create function public.is_username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public."user" where lower(username) = lower(p_username)
  );
$$;

revoke execute on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;
