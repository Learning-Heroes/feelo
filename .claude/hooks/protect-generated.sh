#!/usr/bin/env bash
# PreToolUse: block edits to generated files and secrets. Exit 2 = blocked, stderr goes back to Claude.
set -euo pipefail

file=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')
[ -z "$file" ] && exit 0

rel="${file#"$CLAUDE_PROJECT_DIR"/}"

case "$rel" in
  api/*|postman/*|src/lib/database.types.ts)
    echo "Blocked: $rel is generated. Change the source (migration or Edge Function Zod schema) and regenerate with 'npm run api:sync' / 'npx supabase gen types typescript --local > src/lib/database.types.ts'." >&2
    exit 2
    ;;
  .env.example)
    exit 0
    ;;
  .env|.env.*|*/.env|*/.env.*)
    echo "Blocked: $rel holds secrets and is off limits to agents. Edit .env.example (empty values) instead." >&2
    exit 2
    ;;
esac

exit 0
