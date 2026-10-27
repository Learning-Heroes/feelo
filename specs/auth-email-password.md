# Spec — Email + password auth on Supabase (data, session, login, register)

- Task: [[App] — Implementar el flujo de autenticación con email y contraseña sobre Supabase](https://app.notion.com/p/7763ee77283f4f5b9c4907b24f5aca04)
- Branch: `m3-06-feature-mediana`
- Validation owner: Toni (frontend), Rafa (data + RLS)

## Scope of this delivery

In: data (table, trigger, RPC, RLS, Auth config, seed), Supabase client + persisted session, route guards, login and register screens, private placeholder with «Cerrar sesión».

Out (later tasks): email confirmation, «Revisa tu email», password recovery and new password, deep links (`feelo://auth/callback`), Maestro E2E. Criteria not covered here: 7 (redirect URLs / `enable_confirmations = true`), 15, 16, 19, 24–27.

## Local only

Everything runs against the local Docker stack. Nothing touches staging: no `link`, `db push`, `config push`, `--linked`, or staging MCP. Migrations stay as files; promoting them to staging is a separate step.

- Integration tests and seed run only when `SUPABASE_URL` is `http://127.0.0.1:54321` or `localhost` (a guard throws otherwise).
- `.env` points at the local stack (`npx supabase status -o env`). The local `service_role` key is only read by the integration tests from the environment, never written to `.env` or the repo.

## Decisions

| # | Decision | Source |
|---|---|---|
| D1 | Confirmation stays off (`enable_confirmations = false`). `signUp` returns a session and the route guard takes the user to the private area. | Toni, 2026-10-27 |
| D2 | New deps approved: `zustand`, `react-hook-form`, `@hookform/resolvers`, `zod`, `expo-localization`, `expo-secure-store`, `@react-native-async-storage/async-storage`, `aes-js` (+ `@types/aes-js`), `react-native-get-random-values`. **To record in Notion → Decisiones.** | Toni, 2026-10-27 |
| D3 | Local Docker only (see above). | Toni, 2026-10-27 |
| D4 | «Cerrar sesión» floats at the top of the Discover screen (`app/(app)/index.tsx`), no separate page. | Toni, 2026-10-27 |
| D5 | `colors.error = #FF6B6B`, provisional red not in the Brand book. | Toni, 2026-10-27 |

## Phase 1 — Data

```
supabase/migrations/<ts>_create_user_and_auth_trigger.sql
supabase/config.toml            # [auth] minimum_password_length = 8
supabase/seed.sql               # users A and B, idempotent
supabase/tests/user.rls.test.ts # integration, local only
jest.integration.config.js
src/lib/database.types.ts       # generated: gen types --local
package.json                    # script test:integration
```

- `public."user"`: `id uuid pk references auth.users(id) on delete cascade`, `username text not null check (username ~ '^[a-z0-9_]{3,20}$')` + unique index on `lower(username)`, `email text not null unique`, `country text`, `language text`, `created_at timestamptz not null default now()`.
- RLS on. One policy: `user_select_own` — `select`, `authenticated`, `(select auth.uid()) = id`. No insert/update/delete policy → denied.
- Also `revoke insert, update, delete, truncate … from anon, authenticated`. Without a policy, `update`/`delete` would succeed silently on 0 rows. With the revoke, every direct write fails with `42501` (criterion 5: «rechazada»).
- `npm run test:integration` loads `API_URL`, `ANON_KEY` and `SERVICE_ROLE_KEY` from `npx supabase status -o env` (local stack) and runs `jest.integration.config.js`. `npm test` ignores `supabase/`.
- `public.handle_new_user()` — `security definer`, `set search_path = ''`, inserts `new.id`, `new.email`, `raw_user_meta_data ->> 'username' | 'country' | 'language'`. Trigger `on_auth_user_created after insert on auth.users for each row`.
- `public.is_username_available(p_username text) returns boolean` — `security definer`, `stable`, `set search_path = ''`, compares `lower(username) = lower(p_username)`. `revoke execute … from public`, `grant execute … to anon, authenticated`.
- Seed: A `usuario-a@feelo.test` / `FeeloA#2026` / `usuario_a`, B `usuario-b@feelo.test` / `FeeloB#2026` / `usuario_b`. Inserted into `auth.users` + `auth.identities` with `crypt(…, gen_salt('bf'))`, confirmed, fixed UUIDs, `on conflict do nothing`. The trigger creates their `public."user"` rows.

## Phase 2 — Client and session (no UI)

```
src/lib/requireEnv.ts               # requireEnv(name, value) — file name = export name
src/lib/requireEnv.test.ts
src/lib/LargeSecureStore.ts         # AES key in SecureStore, ciphertext in AsyncStorage
src/lib/LargeSecureStore.test.ts
src/lib/supabase.ts                 # createClient<Database>, persisted session, AppState refresh
src/lib/supabase.test.ts
src/features/auth/useAuthStore.ts   # Zustand: session, isRestoring, init(), signOut()
src/features/auth/useAuthStore.test.ts
app/_layout.tsx                     # splash until fonts + session restored; Stack.Protected
src/features/auth/routeGuard.test.tsx  # renders the real app/_layout (tests can't live in app/: they'd become routes)
app/(auth)/_layout.tsx
app/(auth)/login.tsx                # thin route → LoginScreen (title only until phase 3)
src/features/auth/LoginScreen.tsx
src/features/auth/messages.ts
app/(app)/_layout.tsx
app/(app)/index.tsx                 # Discover moves here (was app/index.tsx)
jest.setup.ts                       # mocks: AsyncStorage, SecureStore (expo-localization in phase 3)
```

- `auth: { storage: LargeSecureStore, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false }`.
- `AppState` `active` → `startAutoRefresh()`, otherwise `stopAutoRefresh()`.
- Guards: `Stack.Protected` with explicit `redirectTo` (`(app)` → `/login`, `(auth)` → `/`). Without it, `/` with no session renders «Unmatched Route», because the default anchor is itself protected.
- `useAuthStore.init()` only subscribes to `onAuthStateChange`: its `INITIAL_SESSION` event fires once storage is restored, so no separate `getSession()`.
- `requireEnv` throws `Falta la variable de entorno {NAME}`. No fallbacks. Expo inlines `process.env.EXPO_PUBLIC_*` only on static access, so `supabase.ts` reads each var by its literal name and passes it to `requireEnv`.

## Phase 3 — Screens

```
src/features/auth/messages.ts       # every auth text (the task's error table)
src/features/auth/schemas.ts        # loginSchema, registerSchema (Zod)
src/features/auth/mapAuthError.ts
src/features/auth/useAuthSubmit.ts    # one request at a time + isSubmitting + mapped error
src/features/auth/useLogin.ts
src/features/auth/useRegister.ts
src/features/auth/AuthScreen.tsx       # shared frame: title, form, form error, link to the other screen
src/features/auth/AuthTextField.tsx    # RHF-controlled field (useController)
src/features/auth/AuthSubmitButton.tsx
src/features/auth/LogoutButton.tsx
src/features/auth/LoginScreen.tsx
src/features/auth/RegisterScreen.tsx
src/features/auth/*.test.ts(x)
src/theme/tokens.ts                 # + colors.error, layout.touchTarget (44)
app/(auth)/login.tsx, app/(auth)/register.tsx   # thin routes
app/(app)/index.tsx                 # + «Cerrar sesión»
```

- Email: `trim()` + `toLowerCase()` before validation.
- Password: min 8 and `/[^\p{L}\p{N}]/u` (any non letter/digit). Server only enforces length 8 (accepted risk, per task).
- Register: `rpc('is_username_available')` → `false` shows the taken message and stops. Otherwise `signUp({ email, password, options: { data: { username, country, language } } })`, with `country = getLocales()[0].regionCode ?? null` and `language = getLocales()[0].languageTag`. No `emailRedirectTo` (no deep links yet).
- No manual navigation after login/register: the guard switches stacks when the session changes, so login does not stay in history.
- Double tap: `useAuthSubmit` keeps `isSubmitting` for the UI (button disabled + `ActivityIndicator`) and a ref that drops a second submit fired before the re-render.
- Offline: an auth error with status 0, a raw `TypeError`, or an `rpc` response with `status === 0`. A 5xx is a server error, so it gets the generic message, not «sin conexión».
- Not mapped in this delivery: `email_not_confirmed` (confirmation is off, criterion 19 is out of scope) and errors the task does not list (for example an already registered email): they get the generic message.
- `mapAuthError`: `invalid_credentials`, `weak_password`, status 429 / `over_request_rate_limit` / `over_email_send_rate_limit`, network (`AuthRetryableFetchError` or `TypeError` from fetch) → table messages; anything else → generic message + `console.error`.

## Deviations to flag

- Seed is `supabase/seed.sql`, not `scripts/seed-auth-users.ts`: local only, and `db reset --local` already runs it.
- No TanStack Query in auth: one-shot mutations in plain hooks; the session lives in Zustand.
- Texts in `messages.ts` instead of i18n (the task asks for it).
- No GlassSurface; minimal RN UI on existing tokens (the task asks for it).
- `colors.error` (#FF6B6B) is not in the Brand book (D5).

## Open questions

- An email that is already registered shows the generic error. The task has no message for it: confirm the text with Iskren if it is wanted.

## Tests (written first, must fail)

| Test | File | Criterion |
|---|---|---|
| `trigger_crea_la_fila_de_usuario` | supabase/tests/user.rls.test | 2 |
| `a_solo_ve_su_fila` / `a_no_ve_la_fila_de_b` | supabase/tests/user.rls.test | 3 |
| `anonimo_no_ve_usuarios` | supabase/tests/user.rls.test | 4 |
| `no_se_puede_escribir_directamente_en_user` (insert, update, delete) | supabase/tests/user.rls.test | 5 |
| `username_libre` / `username_ocupado` / `username_en_mayusculas_ocupado` | supabase/tests/user.rls.test | 6 |
| `falta_variable_de_entorno` | src/lib/requireEnv.test | 34 |
| `guarda_la_sesion_cifrada` (round-trip, AsyncStorage holds no plain text) | src/lib/LargeSecureStore.test | storage |
| `refresco_con_appstate` | src/lib/supabase.test | 33 |
| `restaura_sesion_al_arrancar` / `logout_limpia_la_sesion` | src/features/auth/useAuthStore.test | 28, 32 |
| `splash_durante_restauracion` | src/features/auth/routeGuard.test | 31 |
| `ruta_privada_sin_sesion_va_a_login` | src/features/auth/routeGuard.test | 29 |
| `usuario_con_sesion_abre_ruta_de_auth` | src/features/auth/routeGuard.test | 30 |
| `logout_vuelve_a_login` | src/features/auth/routeGuard.test | 32 |
| validation cases (email, short password, `Abcdef1!` valid, no special, mismatch, username `ab` / `Mal Usuario`, empty field) | src/features/auth/schemas.test | 8–12 |
| `email_con_espacios_se_normaliza` | src/features/auth/schemas.test | 14 |
| error mapping (credentials, weak password, 429, offline, unknown + `console.error`) | src/features/auth/mapAuthError.test | 18, 20–22 |
| `registro_valido_llama_a_signup_con_metadatos` / `locale_sin_region` / `username_ocupado_bloquea_el_registro` / `email_invalido_no_llama_a_supabase` | src/features/auth/RegisterScreen.test | 8, 13, 14 |
| `credenciales_incorrectas` / `sin_conexion` / `email_invalido_no_llama_a_supabase` | src/features/auth/LoginScreen.test | 8, 18, 20 |
| `doble_toque_en_enviar` | src/features/auth/useAuthSubmit.test | 23 |
| `boton_deshabilitado_con_carga` | src/features/auth/AuthSubmitButton.test | 23 |
| `logout_llama_a_signout` | src/features/auth/LogoutButton.test | 32 |
| real `signUp` returns a session + own row; password < 8 rejected by Auth | supabase/tests/user.rls.test | 14, D1 |

Criterion 17 (login not in history) is covered by the guard tests plus the manual check.

## Done means

- `npm run lint`, `npm run typecheck`, `npm test` and `npm run test:integration` (local stack up) green.
- Manual steps on the iOS dev build against local: log in as A, reopen still inside, log out, register a new user and see their row in Studio, each error message shows.
- Nothing pushed, no PR, no staging command without confirmation.
