import fs from 'node:fs/promises';
import path from 'node:path';

import { toManifestFileEntry } from './sound-manifests.parse';
import {
  LOGO_EXTENSIONS,
  type GlobalSoundsManifest,
  type LogoResult,
  type SoundVoiceTarget,
  type VoiceFolderManifest,
  type WriteResult,
} from './sound-manifests.types';

function stableSort(left: string, right: string): number {
  return left.localeCompare(right, 'en', {
    numeric: true,
    sensitivity: 'base',
  });
}

function normalizeUrlPath(...parts: string[]): string {
  return parts.join('/').replaceAll('\\', '/');
}

async function fileExists(absolutePath: string): Promise<boolean> {
  try {
    await fs.stat(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function listMp3Files(absPath: string): Promise<string[]> {
  const dirents = await fs.readdir(absPath, { withFileTypes: true });
  return dirents
    .filter(
      dirent => dirent.isFile() && dirent.name.toLowerCase().endsWith('.mp3'),
    )
    .map(dirent => dirent.name)
    .sort(stableSort);
}

async function listImmediateDirectories(absPath: string): Promise<string[]> {
  const dirents = await fs.readdir(absPath, { withFileTypes: true });
  return dirents
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort(stableSort);
}

async function hasMp3Files(absPath: string): Promise<boolean> {
  const dirents = await fs.readdir(absPath, { withFileTypes: true });
  return dirents.some(
    dirent => dirent.isFile() && dirent.name.toLowerCase().endsWith('.mp3'),
  );
}

async function buildVoiceFolderManifest(
  target: SoundVoiceTarget,
): Promise<VoiceFolderManifest> {
  const mp3Files = await listMp3Files(target.absPath);
  const files = mp3Files.map(file => toManifestFileEntry(target, file));

  return {
    version: 2,
    generatedAt: new Date().toISOString(),
    sourceId: target.sourceId,
    voiceId: target.voiceId,
    path: target.publicPath,
    count: files.length,
    files,
  };
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

async function discoverTargetsForSource(
  soundsRootAbsPath: string,
  sourceId: string,
): Promise<SoundVoiceTarget[]> {
  const sourceAbsPath = path.join(soundsRootAbsPath, sourceId);
  const sourcePublicPath = normalizeUrlPath('sounds', sourceId);
  const voiceIds = await listImmediateDirectories(sourceAbsPath);
  const voiceTargets: SoundVoiceTarget[] = voiceIds.map(voiceId => ({
    sourceId,
    voiceId,
    publicPath: normalizeUrlPath(sourcePublicPath, voiceId),
    absPath: path.join(sourceAbsPath, voiceId),
  }));

  if (!(await hasMp3Files(sourceAbsPath))) {
    return voiceTargets;
  }

  return [
    {
      sourceId,
      voiceId: 'default',
      publicPath: sourcePublicPath,
      absPath: sourceAbsPath,
    },
    ...voiceTargets,
  ];
}

async function discoverSoundVoiceTargets(
  repoRoot: string,
): Promise<SoundVoiceTarget[]> {
  const soundsRootAbsPath = path.join(repoRoot, 'public', 'sounds');
  const sources = await listImmediateDirectories(soundsRootAbsPath);
  const perSourceTargets = await Promise.all(
    sources.map(sourceId =>
      discoverTargetsForSource(soundsRootAbsPath, sourceId),
    ),
  );
  return perSourceTargets.flat();
}

async function findProviderLogoUrl(
  soundsRootAbsPath: string,
  sourceId: string,
): Promise<string | undefined> {
  for (const extension of LOGO_EXTENSIONS) {
    const fileName = `logo.${extension}`;
    const candidateAbsPath = path.join(soundsRootAbsPath, sourceId, fileName);
    if (await fileExists(candidateAbsPath)) {
      return normalizeUrlPath('sounds', sourceId, fileName);
    }
  }
  return undefined;
}

async function discoverProviderLogoUrls(
  repoRoot: string,
): Promise<Map<string, string>> {
  const soundsRootAbsPath = path.join(repoRoot, 'public', 'sounds');
  const sources = await listImmediateDirectories(soundsRootAbsPath);
  const results: Array<LogoResult | undefined> = await Promise.all(
    sources.map(async sourceId => {
      const logoUrl = await findProviderLogoUrl(soundsRootAbsPath, sourceId);
      return logoUrl ? { sourceId, logoUrl } : undefined;
    }),
  );

  const logoMap = new Map<string, string>();
  for (const result of results) {
    if (result) {
      logoMap.set(result.sourceId, result.logoUrl);
    }
  }
  return logoMap;
}

function buildGlobalSoundsManifest(
  targets: readonly SoundVoiceTarget[],
  counts: ReadonlyMap<string, number>,
  providerLogos: ReadonlyMap<string, string>,
): GlobalSoundsManifest {
  const bySource = new Map<string, SoundVoiceTarget[]>();
  for (const target of targets) {
    const list = bySource.get(target.sourceId) ?? [];
    list.push(target);
    bySource.set(target.sourceId, list);
  }

  const sources = Array.from(bySource.entries())
    .sort(([leftId], [rightId]) => stableSort(leftId, rightId))
    .map(([sourceId, voices]) => ({
      sourceId,
      ...(providerLogos.get(sourceId)
        ? { logoUrl: providerLogos.get(sourceId) }
        : {}),
      voices: voices
        .slice()
        .sort((leftVoice, rightVoice) =>
          stableSort(leftVoice.voiceId, rightVoice.voiceId),
        )
        .map(voice => ({
          voiceId: voice.voiceId,
          path: voice.publicPath,
          manifestUrl: normalizeUrlPath(voice.publicPath, 'manifest.json'),
          count: counts.get(`${sourceId}/${voice.voiceId}`) ?? 0,
        })),
    }));

  return { version: 1, generatedAt: new Date().toISOString(), sources };
}

async function buildAndWriteVoiceManifest(
  target: SoundVoiceTarget,
): Promise<WriteResult | undefined> {
  const manifest = await buildVoiceFolderManifest(target);
  if (manifest.count === 0) {
    console.warn(
      `Skipping empty voice: ${target.sourceId}/${target.voiceId} (${target.absPath})`,
    );
    return undefined;
  }

  const outFile = path.join(target.absPath, 'manifest.json');
  await writeJson(outFile, manifest);
  console.log(
    `Wrote ${target.sourceId}/${target.voiceId} manifest with ${manifest.count} files -> ${outFile}`,
  );

  return { key: `${target.sourceId}/${target.voiceId}`, count: manifest.count };
}

function toCountsMap(
  results: Array<WriteResult | undefined>,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const result of results) {
    if (result) {
      counts.set(result.key, result.count);
    }
  }
  return counts;
}

async function writeGlobalManifest(args: {
  repoRoot: string;
  targets: readonly SoundVoiceTarget[];
  counts: ReadonlyMap<string, number>;
  providerLogos: ReadonlyMap<string, string>;
}): Promise<void> {
  const globalManifest = buildGlobalSoundsManifest(
    args.targets,
    args.counts,
    args.providerLogos,
  );
  const globalOutFile = path.join(
    args.repoRoot,
    'public',
    'sounds',
    'manifest.json',
  );
  await writeJson(globalOutFile, globalManifest);
  console.log(
    `Wrote global sounds manifest with ${globalManifest.sources.length} sources -> ${globalOutFile}`,
  );
}

export async function generateSoundManifests(repoRoot: string): Promise<void> {
  const targets = await discoverSoundVoiceTargets(repoRoot);
  const providerLogos = await discoverProviderLogoUrls(repoRoot);
  const writeResults = await Promise.all(
    targets.map(target => buildAndWriteVoiceManifest(target)),
  );
  const counts = toCountsMap(writeResults);
  await writeGlobalManifest({ repoRoot, targets, counts, providerLogos });
}
