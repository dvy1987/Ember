#!/usr/bin/env bash
# Run harness regression tasks (deterministic layer)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TASKS_FILE="docs/harness/tasks.json"
if [ ! -f "$TASKS_FILE" ]; then
  echo "missing $TASKS_FILE" >&2
  exit 1
fi

PASS=0
FAIL=0
SKIP=0

run_task() {
  local id="$1" cmd="$2" optional="${3:-false}"
  printf "→ %s ... " "$id"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "PASS"
    PASS=$((PASS + 1))
  else
    if [ "$optional" = "true" ]; then
      echo "SKIP (optional)"
      SKIP=$((SKIP + 1))
    else
      echo "FAIL"
      FAIL=$((FAIL + 1))
    fi
  fi
}

# Parse tasks.json with python3 (no jq dependency)
while IFS=$'\t' read -r id cmd optional; do
  run_task "$id" "$cmd" "$optional"
done < <(python3 - "$TASKS_FILE" <<'PY'
import json, sys
data = json.load(open(sys.argv[1]))
for t in data["tasks"]:
    if t.get("split") != "held-in" and t["id"] not in json.load(open("docs/harness/suite.json"))["task_ids"]:
        continue
    print(f"{t['id']}\t{t['command']}\t{str(t.get('optional', False)).lower()}")
PY
)

echo "---"
echo "pass=$PASS fail=$FAIL skip=$SKIP"
[ "$FAIL" -eq 0 ]
