// `pnpm contract:pack` (P3-12a): packs the published HTTP contract as an npm-format tarball for the web lane
// (ADR-0002 §Decision 4-5, PLAN D4):
//   dist-contract/eco-bff-contract-<version>.tgz         package/{CHANGELOG.md, openapi.yaml, package.json}
//   dist-contract/eco-bff-contract-<version>.tgz.sha256  "<hex>  eco-bff-contract-<version>.tgz" (sha256sum format)
// <version> is info.version of contracts/openapi.yaml. package/openapi.yaml is that file byte for byte; package/CHANGELOG.md
// is only the "## <version>" entry of CHANGELOG.md; package/package.json has no scripts and no dependencies.
//
// Reproducible: the same inputs give the same sha256 on every run. The tar is written here, not by npm/pnpm pack:
// ustar entries sorted by path, mode 0644, uid/gid 0, empty owner names, fixed mtime (npm's 1985-10-26T08:15:00Z);
// gzip has mtime 0 in its header (zlib default) and the OS byte pinned to 3 (unix), which zlib otherwise sets per
// platform. dist-contract/ is git-ignored: the tarball is a release artifact, never committed.
// No new dependencies (yaml is already a devDependency).
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { constants, gzipSync } from 'node:zlib';

import { parse } from 'yaml';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SPEC = join(root, 'contracts', 'openapi.yaml');
const CHANGELOG = join(root, 'CHANGELOG.md');
const OUT_DIR = join(root, 'dist-contract');
const PACKAGE_NAME = '@eco/bff-contract';
/** npm's fixed tarball mtime (1985-10-26T08:15:00Z), in seconds. */
const MTIME = 499162500;
const BLOCK = 512;

/** The "## <version>" entry of the changelog, up to the next "## " heading. @param {string} text @param {string} version */
function changelogEntry(text, version) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex(
    (line) => line.startsWith(`## ${version} `) || line === `## ${version}`,
  );
  if (start === -1) throw new Error(`CHANGELOG.md has no "## ${version}" entry`);
  const next = lines.findIndex((line, i) => i > start && line.startsWith('## '));
  const entry = lines.slice(start, next === -1 ? lines.length : next);
  while (entry.length > 0 && entry[entry.length - 1]?.trim() === '') entry.pop();
  return `${entry.join('\n')}\n`;
}

/** Writes `value` as a NUL-terminated octal field of `length` bytes. @param {Buffer} header */
function octal(header, offset, length, value) {
  header.write(`${value.toString(8).padStart(length - 1, '0')}\0`, offset, length, 'ascii');
}

/** One ustar entry (header + data padded to 512 bytes). @param {string} path @param {Buffer} data */
function tarEntry(path, data) {
  if (Buffer.byteLength(path) > 100) throw new Error(`tar path too long: ${path}`);
  const header = Buffer.alloc(BLOCK);
  header.write(path, 0, 100, 'utf8');
  octal(header, 100, 8, 0o644); // mode
  octal(header, 108, 8, 0); // uid
  octal(header, 116, 8, 0); // gid
  octal(header, 124, 12, data.length); // size
  octal(header, 136, 12, MTIME); // mtime
  header.write('        ', 148, 8, 'ascii'); // checksum placeholder: spaces while summing
  header.write('0', 156, 1, 'ascii'); // typeflag: regular file
  header.write('ustar\0', 257, 6, 'ascii'); // magic
  header.write('00', 263, 2, 'ascii'); // version
  let sum = 0;
  for (const byte of header) sum += byte;
  header.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148, 8, 'ascii');
  const padding = Buffer.alloc((BLOCK - (data.length % BLOCK)) % BLOCK);
  return Buffer.concat([header, data, padding]);
}

/** Deterministic gzip of a tar made from `files` (sorted by path). @param {Record<string, Buffer>} files */
function tgz(files) {
  const entries = Object.entries(files)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([path, data]) => tarEntry(path, data));
  const tar = Buffer.concat([...entries, Buffer.alloc(BLOCK * 2)]);
  const gz = gzipSync(tar, { level: constants.Z_BEST_COMPRESSION });
  gz.writeUInt32LE(0, 4); // MTIME: none (zlib already writes 0; pinned so it can never leak a clock)
  gz[9] = 3; // OS: unix, whatever platform packs it
  return gz;
}

function main() {
  const spec = readFileSync(SPEC);
  const version = /** @type {{ info?: { version?: unknown } }} */ (parse(spec.toString('utf8')))
    .info?.version;
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`contracts/openapi.yaml info.version is not SemVer: ${String(version)}`);
  }
  const packageJson = {
    name: PACKAGE_NAME,
    version,
    description: 'HTTP contract (OpenAPI 3.1) of the Eco-Comparador BFF.',
    files: ['openapi.yaml', 'CHANGELOG.md'],
  };
  const tarball = tgz({
    'package/CHANGELOG.md': Buffer.from(changelogEntry(readFileSync(CHANGELOG, 'utf8'), version)),
    'package/openapi.yaml': spec,
    'package/package.json': Buffer.from(`${JSON.stringify(packageJson, null, 2)}\n`),
  });
  const file = `eco-bff-contract-${version}.tgz`;
  const sha256 = createHash('sha256').update(tarball).digest('hex');
  mkdirSync(OUT_DIR, { recursive: true });
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed folder + version from the spec (SemVer-checked).
  writeFileSync(join(OUT_DIR, file), tarball);
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- same file name + ".sha256".
  writeFileSync(join(OUT_DIR, `${file}.sha256`), `${sha256}  ${file}\n`);
  process.stdout.write(
    `packed ${PACKAGE_NAME}@${version}: dist-contract/${file} (${String(tarball.length)} bytes) sha256 ${sha256}\n`,
  );
}

main();
