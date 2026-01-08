import fs from 'node:fs/promises';
import path from 'node:path';

export type VowelNameToUnicodeRow = {
  symbol: string;
  name: string;
  unicode: string;
};

type RenamePlan = { fromName: string; toName: string };

type BulkRenameArgs = {
  wikipediaDir: string;
  repoRoot: string;
  rawArgs: string[];
};

type MappedRenameArgs = {
  wikipediaDir: string;
  nameArg: string;
  rawArgs: string[];
  vowelNameToUnicode: ReadonlyMap<string, string>;
};

function getMappingJsonPath(repoRoot: string): string {
  return path.join(repoRoot, 'scripts', 'vowel-name-to-unicode.json');
}

export async function loadVowelNameToUnicodeRows(
  repoRoot: string,
): Promise<VowelNameToUnicodeRow[]> {
  const filePath = getMappingJsonPath(repoRoot);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error(`Invalid mapping JSON: ${filePath}`);
  }

  return parsed as VowelNameToUnicodeRow[];
}

export function buildVowelNameToUnicodeMap(
  rows: readonly VowelNameToUnicodeRow[],
): Map<string, string> {
  return new Map(rows.map(row => [row.name.toLowerCase(), row.unicode]));
}

function ensureMp3Name(name: string): string {
  return name.toLowerCase().endsWith('.mp3') ? name : `${name}.mp3`;
}

function normalizeBaseName(input: string): string {
  return input
    .trim()
    .replace(/\.mp3$/i, '')
    .toLowerCase()
    .replaceAll(' ', '_');
}

function stripVowelSuffixes(input: string): string {
  return input
    .replace(/_vowel(\(.*\))?$/i, '')
    .replace(/_vowel_\(.*\)$/i, '')
    .replace(/_\(schwa\)$/i, '');
}

function parseUnicodeToTargetBase(
  unicodeText: string,
  variant: number,
): string {
  const hexParts = unicodeText
    .trim()
    .split(/\s*[^0-9a-fA-F+]+\s*/)
    .join(' ')
    .split(/\s+/)
    .flatMap(part => part.split('+'))
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => part.replace(/^U\+?/i, ''))
    .filter(part => /^[0-9a-fA-F]{4,6}$/.test(part))
    .map(part => part.toUpperCase().padStart(4, '0'));

  if (hexParts.length === 0) {
    throw new Error(`Could not parse unicode value: ${unicodeText}`);
  }

  const joined = hexParts.map(hex => `U${hex}`).join('-');
  return `${joined}_v${variant}`;
}

async function fileExists(absolutePath: string): Promise<boolean> {
  try {
    await fs.stat(absolutePath);
    return true;
  } catch {
    return false;
  }
}

export function getWikipediaDir(repoRoot: string): string {
  return path.join(repoRoot, 'public', 'sounds', 'wikipedia');
}

export function parseVariant(rawArgs: string[]): number {
  const variantFlagIndex = rawArgs.findIndex(arg => arg === '--variant');
  const variantText =
    variantFlagIndex >= 0 ? rawArgs[variantFlagIndex + 1] : undefined;
  const variant = variantText ? Number.parseInt(variantText, 10) : 1;

  if (!Number.isFinite(variant) || variant < 1) {
    throw new Error(`Invalid --variant value: ${variantText}`);
  }

  return variant;
}

function getUnicodeForName(
  name: string,
  vowelNameToUnicode: ReadonlyMap<string, string>,
): string {
  const normalizedName = normalizeBaseName(name);
  const unicode = vowelNameToUnicode.get(normalizedName);
  if (!unicode) {
    throw new Error(
      `Unknown vowel name: ${name}\n` +
        `Add it to the mapping or use explicit <from> <to> mode.`,
    );
  }
  return unicode;
}

function buildSourceBaseCandidates(normalizedName: string): string[] {
  const stripped = stripVowelSuffixes(normalizedName);
  const candidates = [
    normalizedName,
    stripped,
    normalizedName.replaceAll('_', '-'),
    stripped.replaceAll('_', '-'),
  ];
  return Array.from(new Set(candidates));
}

async function findSourceMatches(
  wikipediaDir: string,
  baseCandidates: readonly string[],
): Promise<string[]> {
  const found: string[] = [];
  for (const baseCandidate of baseCandidates) {
    const candidateFile = ensureMp3Name(baseCandidate);
    const candidatePath = path.join(wikipediaDir, candidateFile);
    if (await fileExists(candidatePath)) {
      found.push(candidateFile);
    }
  }
  return found;
}

function pickSingleSourceMatch(
  normalizedName: string,
  baseCandidates: readonly string[],
  found: readonly string[],
): string {
  if (found.length === 0) {
    throw new Error(
      `Could not find a source mp3 for name: ${normalizedName}\n` +
        `Tried: ${baseCandidates.join(', ')}`,
    );
  }
  if (found.length > 1) {
    throw new Error(
      `Multiple possible source files for name: ${normalizedName}\n` +
        `Matches: ${found.join(', ')}\n` +
        `Rename explicitly using <from> <to> mode.`,
    );
  }
  return found[0];
}

async function resolveSourceFile(
  wikipediaDir: string,
  normalizedName: string,
): Promise<string> {
  const baseCandidates = buildSourceBaseCandidates(normalizedName);
  const found = await findSourceMatches(wikipediaDir, baseCandidates);
  return pickSingleSourceMatch(normalizedName, baseCandidates, found);
}

export async function renameWithinWikipediaDir(
  wikipediaDir: string,
  fromName: string,
  toName: string,
): Promise<void> {
  const fromPath = path.join(wikipediaDir, fromName);
  const toPath = path.join(wikipediaDir, toName);

  if (!(await fileExists(fromPath))) {
    throw new Error(`Source file does not exist: ${fromPath}`);
  }
  if (await fileExists(toPath)) {
    throw new Error(`Destination already exists: ${toPath}`);
  }

  await fs.rename(fromPath, toPath);
}

async function tryRenameWithinWikipediaDir(
  wikipediaDir: string,
  fromName: string,
  toName: string,
): Promise<'renamed' | 'skipped'> {
  const fromPath = path.join(wikipediaDir, fromName);
  const toPath = path.join(wikipediaDir, toName);

  if (!(await fileExists(fromPath))) {
    return 'skipped';
  }
  if (await fileExists(toPath)) {
    return 'skipped';
  }

  await fs.rename(fromPath, toPath);
  return 'renamed';
}

async function bulkRenameOne(
  wikipediaDir: string,
  row: VowelNameToUnicodeRow,
  variant: number,
): Promise<'renamed' | 'skipped'> {
  const targetBase = parseUnicodeToTargetBase(row.unicode, variant);
  const toName = ensureMp3Name(targetBase);
  const fromName = await resolveSourceFile(wikipediaDir, row.name);
  const result = await tryRenameWithinWikipediaDir(
    wikipediaDir,
    fromName,
    toName,
  );

  if (result === 'renamed') {
    console.log(`Renamed: ${fromName} -> ${toName}`);
  } else {
    console.log(`Skipped: ${row.name} (${fromName} -> ${toName})`);
  }

  return result;
}

function logBulkError(row: VowelNameToUnicodeRow, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  console.log(`Skipped: ${row.name} (${message})`);
}

async function bulkRenameAll(
  wikipediaDir: string,
  rows: readonly VowelNameToUnicodeRow[],
  variant: number,
): Promise<{ renamedCount: number; skippedCount: number }> {
  let renamedCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    try {
      const result = await bulkRenameOne(wikipediaDir, row, variant);
      renamedCount += result === 'renamed' ? 1 : 0;
      skippedCount += result === 'skipped' ? 1 : 0;
    } catch (error) {
      skippedCount++;
      logBulkError(row, error);
    }
  }

  return { renamedCount, skippedCount };
}

export async function runBulkRename(args: BulkRenameArgs): Promise<void> {
  const variant = parseVariant(args.rawArgs);
  const rows = await loadVowelNameToUnicodeRows(args.repoRoot);
  const result = await bulkRenameAll(args.wikipediaDir, rows, variant);
  console.log(
    `Done. Renamed: ${result.renamedCount}, Skipped: ${result.skippedCount}`,
  );
}

export async function resolveMappedRename(
  args: MappedRenameArgs,
): Promise<RenamePlan> {
  const normalizedName = normalizeBaseName(args.nameArg);
  const unicode = getUnicodeForName(normalizedName, args.vowelNameToUnicode);
  const variant = parseVariant(args.rawArgs);

  const targetBase = parseUnicodeToTargetBase(unicode, variant);
  const toName = ensureMp3Name(targetBase);
  const fromName = await resolveSourceFile(args.wikipediaDir, normalizedName);

  return { fromName, toName };
}

export function resolveExplicitRename(
  fromArg: string,
  toArg: string,
): RenamePlan {
  return {
    fromName: ensureMp3Name(fromArg),
    toName: ensureMp3Name(toArg),
  };
}
