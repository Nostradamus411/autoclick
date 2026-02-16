#!/usr/bin/env bash
set -euo pipefail

RELEASE_DIR=${1:-release}
CHECKSUM_FILE=${2:-checksums.txt}

if [[ ! -d "${RELEASE_DIR}" ]]; then
  echo "Release directory '${RELEASE_DIR}' not found. Build artifacts first (npm run build + electron-builder)."
  exit 1
fi

mapfile -t artifacts < <(find "${RELEASE_DIR}" -maxdepth 1 -type f -print | sort)
if [[ ${#artifacts[@]} -eq 0 ]]; then
  echo "No artifacts found in ${RELEASE_DIR}";
  exit 1
fi

tmp_file=$(mktemp)
sha256sum "${artifacts[@]}" > "${tmp_file}"

if [[ -f "${CHECKSUM_FILE}" ]]; then
  if diff -u "${CHECKSUM_FILE}" "${tmp_file}" > /dev/null; then
    echo "Checksums match existing ${CHECKSUM_FILE}."
    rm "${tmp_file}"
    exit 0
  else
    echo "Checksum mismatch detected between ${CHECKSUM_FILE} and freshly computed values." >&2
    diff -u "${CHECKSUM_FILE}" "${tmp_file}" || true
    rm "${tmp_file}"
    exit 2
  fi
fi

mv "${tmp_file}" "${CHECKSUM_FILE}"
echo "Wrote ${CHECKSUM_FILE} with hashes for:"
printf ' - %s\n' "${artifacts[@]}"

echo "Verification steps:" 
echo "  1) git checkout <tag>" 
echo "  2) npm ci" 
echo "  3) npm run build" 
echo "  4) npx electron-builder --config release.config.json --publish never" 
echo "  5) ./scripts/verify-release.sh"
