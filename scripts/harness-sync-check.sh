#!/usr/bin/env bash
# Compare docs/harness/manifest.json sha256 entries to on-disk files
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="$ROOT/docs/harness/manifest.json"

if [ ! -f "$MANIFEST" ]; then
  echo "missing manifest: $MANIFEST" >&2
  exit 1
fi

python3 - "$MANIFEST" <<'PY'
import hashlib, json, sys
from pathlib import Path

manifest_path = Path(sys.argv[1])
root = manifest_path.parent.parent.parent
data = json.loads(manifest_path.read_text())
drift = []

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()

for c in data.get("components", []):
    rel = c["path"]
    p = root / rel
    if not p.is_file():
        drift.append(f"MISSING {rel}")
        continue
    actual = sha256_file(p)
    expected = c.get("sha256", "")
    if expected and actual != expected:
        status = c.get("status", "generated")
        drift.append(f"DRIFT {rel} ({status}) expected={expected[:12]}… actual={actual[:12]}…")

if drift:
    print("Harness drift detected:")
    for line in drift:
        print(f"  {line}")
    sys.exit(1)

print("Harness sync OK — all component hashes match manifest")
PY
