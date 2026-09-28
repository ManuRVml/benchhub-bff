// `pnpm contract:diff BASE REVISION` (P3-02): the breaking-change gate of the HTTP contract. Runs oasdiff in a container
// (`${CONTAINER_ENGINE:-podman}`, PLAN D5) as `oasdiff breaking BASE REVISION --fail-on ERR` and exits with oasdiff's
// code: 0 when REVISION breaks no client of BASE, non-zero on an ERR-level break (or when oasdiff cannot run).
//
// - Image: pinned oasdiff release (OASDIFF_IMAGE overrides it); never a floating tag.
// - Both files are mounted read-only; paths are relative to the working directory.
// - Labels: the output of `raster service labels` when the raster CLI is present (Raster container hygiene), else none.
//   The engine is spawned with an argv array and no shell, so a quoted label value such as 'Bruno 2' stays one argument.
// No dependencies.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const IMAGE = process.env.OASDIFF_IMAGE ?? 'tufin/oasdiff:v1.32.1';
const ENGINE = process.env.CONTAINER_ENGINE || 'podman';

/** Splits a shell-style argument string ('…' and "…" quoting, no escapes) into argv. @param {string} line */
function splitArgs(line) {
  /** @type {string[]} */
  const args = [];
  let current = '';
  let inWord = false;
  /** @type {string | null} */
  let quote = null;
  for (const char of line) {
    if (quote) {
      if (char === quote) quote = null;
      else current += char;
    } else if (char === "'" || char === '"') {
      quote = char;
      inWord = true;
    } else if (/\s/.test(char)) {
      if (inWord) args.push(current);
      current = '';
      inWord = false;
    } else {
      current += char;
      inWord = true;
    }
  }
  if (inWord) args.push(current);
  return args;
}

/** `--label k=v` pairs from `raster service labels`, or [] outside a Raster workspace. */
function rasterLabels() {
  // The raster CLI is a shell shim on Windows; the command line is fixed, no user input reaches the shell.
  const out = spawnSync('raster service labels', { shell: true, encoding: 'utf8' });
  if (out.status !== 0) return [];
  const args = splitArgs(out.stdout.trim());
  return args.every((arg, i) => (i % 2 === 0 ? arg === '--label' : arg.includes('='))) ? args : [];
}

/** Runs the gate; returns the exit code (2 on a usage error). @param {string[]} args */
function main(args) {
  const [base, revision] = args;
  if (!base || !revision || args.length !== 2) {
    process.stderr.write('usage: pnpm contract:diff BASE REVISION   (two OpenAPI files)\n');
    return 2;
  }
  for (const file of [base, revision]) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- CLI argument: the spec file to compare.
    if (!existsSync(file)) {
      process.stderr.write(`contract:diff: ${file} not found\n`);
      return 2;
    }
  }
  const argv = [
    'run',
    '--rm',
    ...rasterLabels(),
    '-v',
    `${resolve(base)}:/specs/base.yaml:ro`,
    '-v',
    `${resolve(revision)}:/specs/revision.yaml:ro`,
    IMAGE,
    'breaking',
    '/specs/base.yaml',
    '/specs/revision.yaml',
    '--fail-on',
    'ERR',
  ];
  process.stdout.write(
    `contract:diff: oasdiff breaking ${base} ${revision} --fail-on ERR (${IMAGE})\n`,
  );
  const run = spawnSync(ENGINE, argv, { stdio: 'inherit' });
  if (run.error)
    process.stderr.write(`contract:diff: cannot run ${ENGINE}: ${run.error.message}\n`);
  return run.status ?? 1;
}

process.exitCode = main(process.argv.slice(2));
