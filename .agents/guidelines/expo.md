# Expo / React Native

**Level**: convention (tightens once real code exists).

- `TODO`: pick a linter/formatter (ESLint + Prettier is the Expo/React Native default) and document it here once decided.
- For navigation, project structure, data fetching and UI, use the official `expo-*` skills (`expo-router`, `expo-project-structure`, `expo-data-fetching`, `expo-native-ui`, etc. — installed from the `claude-plugins-official` marketplace) instead of inventing conventions here.
- Core screens to expect once implementation starts: onboarding/platform picker, mood check-in, swipe deck, watchlist, match screen (see [`docs/product.md`](../../docs/product.md)).
- For what's specific to Feelo (screen flow, swipe-deck state, calling Supabase from the client) use the [`expo`](../skills/expo/SKILL.md) skill instead of duplicating it here.
