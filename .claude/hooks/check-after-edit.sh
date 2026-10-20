#!/usr/bin/env bash
# PostToolUse: lint the edited file and typecheck the project. Exit 2 = errors, stderr goes back to Claude.
set -uo pipefail

file=$(jq -r '.tool_input.file_path // empty')
case "$file" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Until the Expo app is scaffolded there is nothing to run.
[ -d node_modules ] || exit 0

# Edge Functions run on Deno, not on the app's toolchain.
case "$file" in
  "$CLAUDE_PROJECT_DIR"/supabase/functions/*)
    if command -v deno >/dev/null 2>&1; then
      out=$(deno check "$file" 2>&1) || { echo "deno check failed for $file:" >&2; echo "$out" >&2; exit 2; }
    fi
    exit 0
    ;;
esac

errors=""

if [ -x node_modules/.bin/eslint ]; then
  out=$(node_modules/.bin/eslint --no-warn-ignored "$file" 2>&1) || errors+=$'ESLint:\n'"$out"$'\n'
fi

if [ -x node_modules/.bin/tsc ] && [ -f tsconfig.json ]; then
  out=$(node_modules/.bin/tsc --noEmit -p tsconfig.json 2>&1) || errors+=$'TypeScript:\n'"$out"$'\n'
fi

if [ -n "$errors" ]; then
  echo "Checks failed after editing $file — fix before continuing:" >&2
  echo "$errors" >&2
  exit 2
fi

exit 0
