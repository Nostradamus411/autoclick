# Release Contract: Deterministic GitHub Actions Artifacts

## Workflow responsibilities
- Run on `push` events that create a semantic `vMAJOR.MINOR.PATCH` tag.
- Use `actions/checkout@v5`, `actions/setup-node@v4` (Node 20) and `electron-userland/builder-action@v2` pinning `electron-builder`.
- Execute `npm ci`, `npm run build`, and `electron-builder --publish never --config release.config.json`.

## Determinism requirements
1. **Lockfiles & Versions**: `package-lock.json` is committed and immutable; the action uses `npm ci` to honor exact versions. Node/Electron versions are documented in `release.config.json`.  
2. **Environment parity**: The workflow sets `CI=true`, `TZ=UTC`, and `LC_ALL=en_US.UTF-8` to avoid locale/time differences; archives are created with `tar --owner=0 --group=0 --mtime=0` when allowed.  
3. **Artifact naming**: `artifactName` is static (e.g., `autoclick-${platform}-${arch}.${ext}`) so checksum files never shift names.  
4. **Checksum publication**: After building, compute `sha256sum` for every artifact and upload a `checksums.txt` that pairs name → hash. The workflow also updates `contracts/release.md` and `quickstart.md` ATM when releasing so the docs stay in sync.

## Verification expectations for auditors
- Reproduce the build by checking out the tagged commit, running `npm ci`, `npm run build`, and `electron-builder --config release.config.json`, and then hashing the produced installers using `sha256sum`.  
- Compare their hashes with the `checksums.txt` published during the workflow.  
- If all hashes match, the release can be certified as deterministic.
