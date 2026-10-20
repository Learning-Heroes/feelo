# app/ — client

Covers `app/` (Expo Router routes) and `src/`. Only what's specific to the client; the root `AGENTS.md` still applies. Owner: Toni.

## Where things go

| Thing | Path |
|---|---|
| Screen / route | `app/<route>.tsx` |
| UI, hooks and logic of one feature | `src/features/<feature>/` |
| Reusable UI, domain-agnostic (never calls Supabase) | `src/components/` |
| Cross-cutting hooks | `src/hooks/` |
| The only Supabase client · generated types | `src/lib/supabase.ts` · `src/lib/database.types.ts` |
| Design tokens | `src/theme/` |

Imports go one way: `app → features → components/hooks → lib/theme`. A feature never imports another feature; shared code moves up to `src/*`. Always the `@/` alias, never chained `../../`.

## Screens are thin

- A file in `app/` composes. Over ~150 lines or holding a rule → extract to a hook or a feature component.
- Data comes from a feature hook (TanStack Query), never from Supabase directly. Handle loading, error (with a recovery action) and empty.

```tsx
export default function DiscoverScreen() {
  const { clips, isLoading, onSwipe } = useDiscoverFeed()

  if (isLoading) return <FeedSkeleton />
  return <ClipSwiper clips={clips} onSwipe={onSwipe} />
}
```

## State

| State | Tool | Rule |
|---|---|---|
| Server data | TanStack Query | Never copied into a store; the cache is the source |
| UI / session | Zustand | Small stores, one per domain |
| Local | `useState` | Default; lift only when needed |
| Forms | React Hook Form + Zod | One schema validates and types |

## Styles and glass

- **Unistyles 3** reading `src/theme`. No Tailwind / NativeWind. Zero magic values: a missing token is added to the theme, not hardcoded.
- Glass only through `<GlassSurface>`, always with its fallback for Android, iOS < 26 and *Reduce Transparency* — the `glass-component` skill has how.

## Components, a11y, i18n

- Function components, `interface` for props, one component per file.
- `FlashList` with a stable `keyExtractor` (never the index) for long lists. Memoise only after measuring.
- `accessibilityRole` + `accessibilityLabel` on interactive elements, touch target ≥ 44×44, respect *Reduce Motion*.
- No visible hardcoded text: everything through i18n, errors included.
