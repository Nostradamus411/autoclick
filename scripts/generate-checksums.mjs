import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { access, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const RELEASE_DIR = path.resolve('release');
const OUTPUT_FILE = path.resolve('checksums.txt');

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function main() {
  await access(RELEASE_DIR);

  const entries = await readdir(RELEASE_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();

  if (files.length === 0) {
    throw new Error(`No files found in ${RELEASE_DIR}`);
  }

  const lines = [];
  for (const file of files) {
    const filePath = path.join(RELEASE_DIR, file);
    const hash = await hashFile(filePath);
    lines.push(`${hash}  release/${file}`);
  }

  await writeFile(OUTPUT_FILE, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Wrote ${OUTPUT_FILE} for ${files.length} artifact(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
