// `pnpm contract:examples` (P3-01b): extracts the JSON examples of docs/requirements/view-data-contracts/*.md into
// tests/contract-examples/ plus a manifest (index.json) for the contract schema rows (PLAN BFF-P3 v0.2, amendment 2).
//
// Rules:
//  1. Blocks: every ```json fence at the start of a line, possibly indented inside a bullet; the captured indent is
//     removed from every body line that has it before JSON.parse.
//  2. ID: the first two "-"-separated parts of the file name ("V-03-home.md" → "V-03").
//  3. kind: "request" when the last top-level bullet ("- " at column 0) before the block starts with "- Request",
//     else "response"; a further response of an ID that already has a response/fragment is a "fragment".
//  4. file: "<ID>.<kind>.json"; fragments "<ID>.fragment.<n>.json", n = earlier response/fragment entries of the ID.
//  5. form: "descriptor" when any string value contains "branded-id" or "<…>", starts with "optional-", or is a pipe
//     list (a|b|c); otherwise "instance".
//  6. sections (responses only): ["$root"] when the whole value is { status: "ok", data }, else the top-level keys whose
//     value has exactly that shape.
//  7. Writes each example as JSON.stringify(value, null, 2) + "\n" and index.json sorted by id, kind, file.
//  8. Deletes every *.json of the output folder first, except hand-written "*.instance.json" files.
// No dependencies.
import { readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const sourceDir = join(root, 'docs', 'requirements', 'view-data-contracts');
const outDir = join(root, 'tests', 'contract-examples');

const BLOCK = /^([ \t]*)```json\r?\n([\s\S]*?)\r?\n\1```/gm;
const KIND_ORDER = { request: 0, response: 1, fragment: 2 };
const PIPE_PART = /^[\w.:-]+$/;
const ANGLE = /<[^>]*>/;

/** `^[\w.:-]+(\|[\w.:-]+)+$` without nested quantifiers: at least two "|" parts, each `[\w.:-]+`. */
const isPipeList = (s) => {
  const parts = s.split('|');
  return parts.length > 1 && parts.every((part) => PIPE_PART.test(part));
};

/** Rule 5: true when the string marks a descriptor rather than a concrete value. */
const isDescriptorString = (s) =>
  s.includes('branded-id') || ANGLE.test(s) || s.startsWith('optional-') || isPipeList(s);

const hasDescriptorString = (value) => {
  if (typeof value === 'string') return isDescriptorString(value);
  if (Array.isArray(value)) return value.some(hasDescriptorString);
  if (value !== null && typeof value === 'object')
    return Object.values(value).some(hasDescriptorString);
  return false;
};

/** Rule 6 shape: an object with exactly the keys status and data, status "ok". */
const isOkSection = (value) => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return (
    keys.length === 2 && keys.includes('status') && keys.includes('data') && value.status === 'ok'
  );
};

const sectionsOf = (value) => {
  if (isOkSection(value)) return ['$root'];
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value)
    .filter(([, section]) => isOkSection(section))
    .map(([key]) => key);
};

/** Rule 3: kind from the last top-level bullet before the block's offset. */
const lastBulletIsRequest = (text, offset) => {
  const bullets = text
    .slice(0, offset)
    .split(/\r?\n/)
    .filter((line) => line.startsWith('- '));
  return bullets.at(-1)?.startsWith('- Request') ?? false;
};

const dedent = (body, indent) =>
  indent
    ? body
        .split('\n')
        .map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
        .join('\n')
    : body;

const files = readdirSync(sourceDir)
  .filter((name) => name.endsWith('.md'))
  .sort();

const entries = [];
const responseCount = new Map(); // id → number of response/fragment entries so far

for (const name of files) {
  const id = name.split('-').slice(0, 2).join('-');
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- name comes from readdirSync of the contracts folder
  const text = readFileSync(join(sourceDir, name), 'utf8');
  for (const match of text.matchAll(BLOCK)) {
    const [, indent = '', body = ''] = match;
    let value;
    try {
      value = JSON.parse(dedent(body.replace(/\r\n/g, '\n'), indent));
    } catch (error) {
      throw new Error(`${name}: JSON block at offset ${String(match.index)} does not parse`, {
        cause: error,
      });
    }
    let kind = lastBulletIsRequest(text, match.index) ? 'request' : 'response';
    const earlier = responseCount.get(id) ?? 0;
    if (kind === 'response' && earlier > 0) kind = 'fragment';
    if (kind !== 'request') responseCount.set(id, earlier + 1);
    const file =
      kind === 'fragment' ? `${id}.fragment.${String(earlier)}.json` : `${id}.${kind}.json`;
    entries.push({
      id,
      kind,
      form: hasDescriptorString(value) ? 'descriptor' : 'instance',
      file,
      sections: kind === 'response' ? sectionsOf(value) : [],
      value,
    });
  }
}

const byFile = new Map();
for (const entry of entries) {
  if (byFile.has(entry.file)) throw new Error(`Duplicate output file ${entry.file}`);
  byFile.set(entry.file, entry);
}

entries.sort(
  (a, b) =>
    (a.id < b.id ? -1 : a.id > b.id ? 1 : 0) ||
    KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
    (a.file < b.file ? -1 : a.file > b.file ? 1 : 0),
);

mkdirSync(outDir, { recursive: true });
for (const name of readdirSync(outDir)) {
  if (name.endsWith('.json') && !name.endsWith('.instance.json')) rmSync(join(outDir, name));
}
for (const entry of entries) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- file is built from the contract id and kind
  writeFileSync(join(outDir, entry.file), `${JSON.stringify(entry.value, null, 2)}\n`);
}
const manifest = entries.map(({ id, kind, form, file, sections }) => ({
  id,
  kind,
  form,
  file,
  sections,
}));
writeFileSync(join(outDir, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const descriptors = manifest.filter((e) => e.form === 'descriptor').length;
process.stdout.write(
  `extracted ${String(manifest.length)} examples (${String(manifest.length - descriptors)} instance, ${String(descriptors)} descriptor)\n`,
);
