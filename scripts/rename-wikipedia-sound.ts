import {
  buildVowelNameToUnicodeMap,
  getWikipediaDir,
  loadVowelNameToUnicodeRows,
  renameWithinWikipediaDir,
  resolveExplicitRename,
  resolveMappedRename,
  runBulkRename,
} from './rename-wikipedia-sound.lib';

type RenamePlan = { fromName: string; toName: string };

function usage(): string {
  return [
    'Usage:',
    '  tsx scripts/rename-wikipedia-sound.ts <from> <to>',
    '  tsx scripts/rename-wikipedia-sound.ts <name> [--variant <n>]',
    '  tsx scripts/rename-wikipedia-sound.ts --all [--variant <n>]',
    '',
    'Examples:',
    '  tsx scripts/rename-wikipedia-sound.ts close_back_rounded U0325-U2589_v1',
    '  tsx scripts/rename-wikipedia-sound.ts close_back_rounded.mp3 U0325-U2589_v1.mp3',
    '  tsx scripts/rename-wikipedia-sound.ts close_back_rounded_vowel',
    '  tsx scripts/rename-wikipedia-sound.ts close_back_rounded_vowel --variant 2',
    '  tsx scripts/rename-wikipedia-sound.ts --all',
    '  tsx scripts/rename-wikipedia-sound.ts --all --variant 2',
  ].join('\n');
}

function isHelpRequested(rawArgs: string[]): boolean {
  return (
    rawArgs.includes('--help') || rawArgs.includes('-h') || rawArgs.length === 0
  );
}

function isExplicitMode(rawArgs: string[]): boolean {
  return (
    rawArgs.length === 2 &&
    !rawArgs[0].startsWith('--') &&
    !rawArgs[1].startsWith('--')
  );
}

function isBulkMode(rawArgs: string[]): boolean {
  return rawArgs.includes('--all');
}

function tryPrintHelp(rawArgs: string[]): boolean {
  if (!isHelpRequested(rawArgs)) {
    return false;
  }
  console.log(usage());
  return true;
}

async function runBulkIfRequested(
  repoRoot: string,
  wikipediaDir: string,
  rawArgs: string[],
): Promise<boolean> {
  if (!isBulkMode(rawArgs)) {
    return false;
  }
  await runBulkRename({ wikipediaDir, repoRoot, rawArgs });
  return true;
}

async function buildMappedRenamePlan(
  repoRoot: string,
  wikipediaDir: string,
  rawArgs: string[],
): Promise<RenamePlan> {
  const rows = await loadVowelNameToUnicodeRows(repoRoot);
  const vowelNameToUnicode = buildVowelNameToUnicodeMap(rows);
  return resolveMappedRename({
    wikipediaDir,
    nameArg: rawArgs[0],
    rawArgs,
    vowelNameToUnicode,
  });
}

async function runSingleRename(
  repoRoot: string,
  wikipediaDir: string,
  rawArgs: string[],
): Promise<void> {
  const renamePlan = isExplicitMode(rawArgs)
    ? resolveExplicitRename(rawArgs[0], rawArgs[1])
    : await buildMappedRenamePlan(repoRoot, wikipediaDir, rawArgs);

  await renameWithinWikipediaDir(
    wikipediaDir,
    renamePlan.fromName,
    renamePlan.toName,
  );

  console.log(`Renamed: ${renamePlan.fromName} -> ${renamePlan.toName}`);
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  if (tryPrintHelp(rawArgs)) {
    return;
  }

  const repoRoot = process.cwd();
  const wikipediaDir = getWikipediaDir(repoRoot);

  const didBulkRename = await runBulkIfRequested(
    repoRoot,
    wikipediaDir,
    rawArgs,
  );
  if (didBulkRename) {
    return;
  }

  await runSingleRename(repoRoot, wikipediaDir, rawArgs);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
