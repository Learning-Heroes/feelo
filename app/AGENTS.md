# app/ — client (Expo Router)

Applies to `app/` (routes) and `src/` (components, features, hooks, lib, theme). Root rules in [`../AGENTS.md`](../AGENTS.md) still apply.

## Screens are thin

- A file in `app/` composes; it doesn't decide. Over ~150 lines or holding a business rule → extract to a hook or a component in `src/features/<feature>/`.
- A screen never calls Supabase. Data comes from a feature hook (`useDiscoverFeed`, `useSuggestion`…) built on TanStack Query.
- Every network state is handled: loading, error (with a recovery action, in the user's language) and empty.

```tsx
export default function DiscoverScreen() {
  const { clips, isLoading, onSwipe } = useDiscoverFeed()

  if (isLoading) return <FeedSkeleton />
  return <ClipSwiper clips={clips} onSwipe={onSwipe} />
}
```

## Where things go

| Thing | Path |
|---|---|
| New screen / route | `app/<route>.tsx` (groups and layouts per Expo Router) |
| Domain UI, hooks, logic for one feature | `src/features/<feature>/` |
| Reusable, domain-agnostic UI | `src/components/` — never knows the domain, never calls Supabase |
| Supabase client (the only one) | `src/lib/supabase.ts` |
| Generated DB types | `src/lib/database.types.ts` — **generated, don't edit** |
| Design tokens | `src/theme/` |

## Styles: Unistyles + tokens

- Styles with **Unistyles 3** (`StyleSheet.create` from `react-native-unistyles`) reading the theme. No Tailwind, no NativeWind, no inline style objects with literals.
- Zero magic values: colors, spacing, radii, typography all come from `src/theme`. If a token is missing, add it to the theme (and check the [Brand book](https://app.notion.com/p/3c6bd3bd193b8070be4bc17609c8fd55)) instead of hardcoding.

## Glass: only through `<GlassSurface>`

- No screen or feature imports `expo-glass-effect`, `@callstack/liquid-glass` or `expo-blur` directly. Only `src/components/GlassSurface.tsx` does.
- Every glass surface has a defined fallback for Android and iOS < 26, and degrades when *Reduce Transparency* is on. No fallback → the PR doesn't pass.
- Limit simultaneous blurred surfaces on Android (performance on low-end devices).
- Building or changing glass UI → load the `glass-component` skill.

## State

| State | Tool | Rule |
|---|---|---|
| Server data | TanStack Query | Never copied into a store; the cache is the source |
| UI / session | Zustand | Small stores, one per domain |
| Local | `useState` | Default; only lift it when needed |
| Forms | React Hook Form + Zod | The same schema validates and types |

## Components, a11y, i18n

- Function components with typed props (`interface` for props). One component per file, file named like the export.
- Long lists with `FlashList` and a stable `keyExtractor` (never the index).
- Interactive elements carry `accessibilityRole` + `accessibilityLabel`, touch target ≥ 44×44. Respect *Reduce Motion*.
- No visible hardcoded text: everything through i18n, including errors.
- Memoise only when a measurement justifies it.

## Tests

Co-located `*.test.tsx`, React Native Testing Library, assert visible behaviour — not internal state or snapshots.
