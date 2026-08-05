#!/usr/bin/env bash
# Après chaque écriture : format + lint + typecheck du fichier touché.
# stderr + exit 2 => les erreurs reviennent à Claude, qui corrige aussitôt.
input=$(cat)
file=$(echo "$input" | jq -r '.tool_input.file_path // empty')

case "$file" in
  *.ts|*.tsx|*.astro)
    npx prettier --write "$file" >/dev/null 2>&1
    errors=$(npx eslint "$file" 2>&1)
    if [ $? -ne 0 ]; then
      echo "ESLint a rejeté $file :" >&2
      echo "$errors" >&2
      exit 2
    fi
    ;;
esac
exit 0
