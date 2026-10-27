-- Seed users A and B: confirmed email + password users. Idempotent.
-- Inserting into auth.users fires on_auth_user_created, which creates their public."user" rows.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
)
values
  (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-4000-a000-00000000000a', 'authenticated', 'authenticated',
    'usuario-a@feelo.test', extensions.crypt('FeeloA#2026', extensions.gen_salt('bf')), now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "usuario_a", "country": "ES", "language": "es-ES"}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', '00000000-0000-4000-a000-00000000000b', 'authenticated', 'authenticated',
    'usuario-b@feelo.test', extensions.crypt('FeeloB#2026', extensions.gen_salt('bf')), now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "usuario_b", "country": "ES", "language": "es-ES"}',
    now(), now(), '', '', '', ''
  )
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, 'email',
       jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
       now(), now(), now()
from auth.users u
where u.email in ('usuario-a@feelo.test', 'usuario-b@feelo.test')
on conflict (provider_id, provider) do nothing;
