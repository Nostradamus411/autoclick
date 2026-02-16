# Reproduce and Verify Releases

Follow these steps to rebuild the artifacts and confirm their checksums match the published release output.

## Prerequisites
- Node.js 20 (use `nvm use 20`)
- npm 10+
- Git
- Linux/macOS/Windows build tooling compatible with Electron Builder

## Rebuild the artifacts
1. Clone the tagged release: `git clone <repo> && cd autoclick && git checkout <tag>`.
2. Install dependencies: `npm ci`.
3. Build renderer and package the app (no publishing):
   ```sh
   npm run build
   npx electron-builder --config release.config.json --publish never
   ```
   Artifacts appear under `release/`.

## Generate and compare checksums
1. From repo root, run:
   ```sh
   npm run release:hash
   ```
   - If `checksums.txt` does not exist, the script writes one from the current artifacts.
   - If `checksums.txt` exists, it compares the freshly computed hashes and fails on any mismatch.

2. To manually inspect:
   ```sh
   find release -maxdepth 1 -type f -print0 | sort -z | xargs -0 sha256sum
   ```

## Expected outcomes
- `checksums.txt` pairs each artifact filename with its SHA256 hash.
- Matching hashes confirm the release is reproducible from the tagged source.

## Troubleshooting
- Ensure your environment matches the workflow: Node 20, `CI=true`, `TZ=UTC`, `LC_ALL=en_US.UTF-8`.
- Clear previous artifacts (`rm -rf release`) before rebuilding to avoid stale files.
- If you see missing native deps (e.g., for Playwright), install suggested OS packages or rerun the installer: `npx playwright install-deps` (may require sudo).
