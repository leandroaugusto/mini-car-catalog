#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DB_NAME="mini-car-catalog"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/restore-db-backup.sh <archive-path> [target-db-name]

Examples:
  bash scripts/restore-db-backup.sh backups/mini-car-catalog-db-20260619-204328.archive.gz
  bash scripts/restore-db-backup.sh backups/mini-car-catalog-db-20260619-204328.archive.gz mini-car-catalog-restore-test

Notes:
  - The archive is expected to contain data from the "mini-car-catalog" database.
  - The target database defaults to "mini-car-catalog".
  - Existing collections in the target database are dropped before restore.
EOF
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage >&2
  exit 1
fi

ARCHIVE_PATH="$1"
TARGET_DB_NAME="${2:-mini-car-catalog}"

cd "${ROOT_DIR}"

if [[ ! -f "${ARCHIVE_PATH}" ]]; then
  echo "Backup archive not found: ${ARCHIVE_PATH}" >&2
  exit 1
fi

CONTAINER_ID="$(docker compose ps -q mongodb)"

if [[ -z "${CONTAINER_ID}" ]]; then
  echo "MongoDB service is not running. Start it with 'docker compose up -d mongodb' first." >&2
  exit 1
fi

ARCHIVE_BASENAME="$(basename "${ARCHIVE_PATH}")"
CONTAINER_ARCHIVE_PATH="/tmp/${ARCHIVE_BASENAME}"

docker cp "${ARCHIVE_PATH}" "${CONTAINER_ID}:${CONTAINER_ARCHIVE_PATH}"

docker compose exec -T mongodb \
  mongorestore \
  --gzip \
  --archive="${CONTAINER_ARCHIVE_PATH}" \
  --nsInclude="${SOURCE_DB_NAME}.*" \
  --nsFrom="${SOURCE_DB_NAME}.*" \
  --nsTo="${TARGET_DB_NAME}.*" \
  --drop

docker compose exec -T mongodb rm -f "${CONTAINER_ARCHIVE_PATH}"

echo "Restore completed into database: ${TARGET_DB_NAME}"
