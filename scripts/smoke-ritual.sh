#!/usr/bin/env bash
# Smoke test for Ember sacred loop API — run with api-server on localhost:8080
set -euo pipefail

BASE="${EMBER_API_URL:-http://localhost:8080/api}"

echo "→ health"
curl -sf "$BASE/healthz" | grep -q '"ok"'

echo "→ settings (filtered)"
curl -sf "$BASE/settings" | grep -q 'default_session_minutes'

echo "→ projects"
PROJECTS=$(curl -sf "$BASE/projects")
echo "$PROJECTS" | grep -q 'projects'

PROJECT_ID=$(echo "$PROJECTS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['projects'][0]['id'] if d.get('projects') else '')")
if [ -z "$PROJECT_ID" ]; then
  echo "No project found — creating one"
  PROJECT_ID=$(curl -sf -X POST "$BASE/projects" \
    -H 'Content-Type: application/json' \
    -d '{"name":"Smoke Test Dragon","dragon_type":"cinder"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
fi
echo "  project_id=$PROJECT_ID"

echo "→ ritual analytics"
curl -sf "$BASE/analytics/ritual" | grep -q 'sessions_this_week'

echo "→ insights tray"
curl -sf "$BASE/projects/$PROJECT_ID/insights-tray" | grep -q 'project_id'

echo "→ start session (45 min)"
SESSION=$(curl -sf -X POST "$BASE/sessions/start" \
  -H 'Content-Type: application/json' \
  -d "{\"project_id\":\"$PROJECT_ID\",\"duration_minutes\":45}")
SESSION_ID=$(echo "$SESSION" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
PLANNED=$(echo "$SESSION" | python3 -c "import sys,json; print(json.load(sys.stdin).get('planned_duration_minutes', 0))")
if [ "$PLANNED" != "45" ]; then
  echo "expected planned_duration_minutes=45 got $PLANNED" >&2
  exit 1
fi
echo "  session_id=$SESSION_ID"

echo "→ end session (finishTraining path)"
curl -sf -X POST "$BASE/sessions/end" \
  -H 'Content-Type: application/json' \
  -d "{\"session_id\":\"$SESSION_ID\",\"reflection\":\"smoke test\",\"tasks_completed_count\":0}" \
  | grep -q 'reflection_processed'

echo "→ idempotent end (no double-count)"
MINUTES_BEFORE=$(curl -sf "$BASE/projects/$PROJECT_ID" | python3 -c "import sys,json; print(json.load(sys.stdin)['total_focus_minutes'])")
curl -sf -X POST "$BASE/sessions/end" \
  -H 'Content-Type: application/json' \
  -d "{\"session_id\":\"$SESSION_ID\",\"reflection\":\"retry\",\"tasks_completed_count\":0}" \
  | grep -q 'already_completed'
MINUTES_AFTER=$(curl -sf "$BASE/projects/$PROJECT_ID" | python3 -c "import sys,json; print(json.load(sys.stdin)['total_focus_minutes'])")
if [ "$MINUTES_BEFORE" != "$MINUTES_AFTER" ]; then
  echo "idempotency failed: minutes changed $MINUTES_BEFORE -> $MINUTES_AFTER" >&2
  exit 1
fi

echo "→ ritual metric reject unknown event"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/ritual-metrics" \
  -H 'Content-Type: application/json' \
  -d '{"event":"bogus_event","at":"2026-01-01T00:00:00.000Z"}')
if [ "$CODE" != "400" ]; then
  echo "expected 400 for bogus ritual event got $CODE" >&2
  exit 1
fi

echo "✓ smoke-ritual passed"
