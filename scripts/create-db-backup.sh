#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE_NAME="mini-car-catalog-db-${TIMESTAMP}.archive.gz"
CONTAINER_ARCHIVE_PATH="/tmp/${ARCHIVE_NAME}"

cd "${ROOT_DIR}"

mkdir -p "${BACKUP_DIR}"

CONTAINER_ID="$(docker compose ps -q mongodb)"

if [[ -z "${CONTAINER_ID}" ]]; then
  echo "MongoDB service is not running. Start it with 'docker compose up -d mongodb' first." >&2
  exit 1
fi

docker compose exec -T mongodb \
  mongodump --db mini-car-catalog --gzip --archive="${CONTAINER_ARCHIVE_PATH}"

docker cp "${CONTAINER_ID}:${CONTAINER_ARCHIVE_PATH}" "${BACKUP_DIR}/${ARCHIVE_NAME}"
docker compose exec -T mongodb rm -f "${CONTAINER_ARCHIVE_PATH}"

echo "Backup created at: backups/${ARCHIVE_NAME}"
