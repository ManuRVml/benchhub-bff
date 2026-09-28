/* eslint-disable security/detect-non-literal-fs-filename -- a local build CLI: every path is the --web-dist / --out argument or a fixed folder of this repo */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { relative, resolve, sep } from 'node:path';

const usage = 'Usage: pnpm package:with-web --web-dist <path> [--out <path>]\n';
const args = process.argv.slice(2);

function fail(message) {
  throw new Error(message);
}

let webDist;
let outDir = resolve('package');

for (let index = 0; index < args.length; index += 1) {
  const argument = args.at(index);
  const value = args.at(index + 1);

  if (argument === '--web-dist') {
    if (value === undefined || value.startsWith('--')) {
      fail(`Missing value for --web-dist\n${usage}`);
    }
    webDist = resolve(value);
    index += 1;
    continue;
  }

  if (argument === '--out') {
    if (value === undefined || value.startsWith('--')) {
      fail(`Missing value for --out\n${usage}`);
    }
    outDir = resolve(value);
    index += 1;
    continue;
  }

  fail(`Unknown argument: ${argument}\n${usage}`);
}

if (webDist === undefined) {
  fail(`Missing required --web-dist argument\n${usage}`);
}

const indexFile = resolve(webDist, 'index.html');
if (!existsSync(indexFile)) {
  fail(`Web dist is missing index.html: ${indexFile}`);
}

if (outDir === webDist) {
  fail('--out must not be the same directory as --web-dist');
}

function listFiles(root) {
  return readdirSync(root, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = resolve(root, entry.name);
      return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
    })
    .sort((left, right) => left.localeCompare(right));
}

function hashPublicTree(publicDir) {
  const hash = createHash('sha256');
  const files = listFiles(publicDir);

  for (const file of files) {
    const filename = relative(publicDir, file).split(sep).join('/');
    hash.update(`${filename}\0`);
    hash.update(readFileSync(file));
  }

  return { digest: hash.digest('hex'), fileCount: files.length };
}

try {
  execSync('pnpm build', { cwd: process.cwd(), stdio: 'inherit' });
} catch {
  fail('BFF build failed; package was not created.');
}

const bffDist = resolve('dist');
if (!existsSync(bffDist)) {
  fail(`BFF build output is missing: ${bffDist}`);
}

const mockExamples = resolve('src/presentation/http/routes/mock-examples');
if (!existsSync(mockExamples)) {
  fail(`Mock contract examples are missing: ${mockExamples}`);
}

rmSync(outDir, { force: true, recursive: true });
mkdirSync(outDir, { recursive: true });

cpSync(bffDist, resolve(outDir, 'dist'), { recursive: true });
cpSync(webDist, resolve(outDir, 'public'), { recursive: true });
cpSync(mockExamples, resolve(outDir, 'mock-examples'), { recursive: true });

for (const filename of ['package.json', 'pnpm-lock.yaml', 'app.yaml']) {
  cpSync(resolve(filename), resolve(outDir, filename));
}

const publicTree = hashPublicTree(resolve(outDir, 'public'));
const builtAt = new Date().toISOString();
writeFileSync(
  resolve(outDir, 'web-build.json'),
  `${JSON.stringify({ webDistSha256: publicTree.digest, builtAt }, null, 2)}\n`,
);

process.stdout.write(
  `Package: ${outDir}\nWeb files: ${String(publicTree.fileCount)}\nWeb SHA-256: ${publicTree.digest}\nBuilt at: ${builtAt}\n`,
);
