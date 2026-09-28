// `pnpm check:architecture:planted`: runs both architecture linters over tools/arch-fixtures/planted.
// Every bad-*.ts fixture breaks exactly one layer rule, so this command is expected to FAIL and to name each of
// them. It exits 0 only if both tools report nothing, which would mean the rules stopped working.
import { spawnSync } from 'node:child_process';

const PLANTED = 'tools/arch-fixtures/planted';
const run = (args) =>
  spawnSync('pnpm', ['exec', ...args], { stdio: 'inherit', shell: process.platform === 'win32' });

const cruise = run([
  'depcruise',
  '--config',
  '.dependency-cruiser.cjs',
  '--output-type',
  'err-long',
  PLANTED,
]);
const lint = run([
  'eslint',
  '--no-config-lookup',
  '--config',
  'tools/architecture/eslint.planted.config.js',
  PLANTED,
]);

process.exitCode = cruise.status || lint.status ? 1 : 0;
