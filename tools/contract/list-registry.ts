// Prints the contract registry as JSON: `pnpm exec tsx tools/contract/list-registry.ts`.
import { listRegistry } from '../../src/contracts/registry.js';

process.stdout.write(`${JSON.stringify(listRegistry())}\n`);
