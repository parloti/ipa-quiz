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
    dirent => dirent.isFile() && dirent.name.toLowerCase().endsWith('.mp3'), // TODO: Add support for other formats.
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

async function readProviderMeta(
  soundsRootAbsPath: string,
  sourceId: string,
): Promise<{ title?: string; logo?: string } | undefined> {
  const candidate = path.join(soundsRootAbsPath, sourceId, 'meta.json');
  try {
    const contents = await fs.readFile(candidate, 'utf8');
    const parsed = JSON.parse(contents) as {
      title?: string;
      logo?: string;
      logoUrl?: string;
    };
    // Accept either `logo` (file name/path) or `logoUrl` (public path)
    const logo = parsed.logoUrl ?? parsed.logo;
    return { title: parsed.title, logo };
  } catch {
    return undefined;
  }
}

async function readVoiceMeta(
  soundsRootAbsPath: string,
  sourceId: string,
  voiceId: string,
): Promise<{ author?: string } | undefined> {
  const candidate = path.join(
    soundsRootAbsPath,
    sourceId,
    voiceId,
    'meta.json',
  );
  try {
    const contents = await fs.readFile(candidate, 'utf8');
    const parsed = JSON.parse(contents) as { author?: string };
    return { author: parsed.author };
  } catch {
    return undefined;
  }
}

async function discoverProviderMeta(
  repoRoot: string,
): Promise<Map<string, { title?: string; logo?: string }>> {
  const soundsRootAbsPath = path.join(repoRoot, 'public', 'sounds');
  const sources = await listImmediateDirectories(soundsRootAbsPath);
  const results = await Promise.all(
    sources.map(async sourceId => {
      const meta = await readProviderMeta(soundsRootAbsPath, sourceId);
      return meta ? { sourceId, meta } : undefined;
    }),
  );

  const map = new Map<string, { title?: string; logo?: string }>();
  for (const r of results) {
    if (r) {
      map.set(r.sourceId, r.meta);
    }
  }
  return map;
}

async function discoverVoiceMeta(
  repoRoot: string,
): Promise<Map<string, { author?: string }>> {
  const soundsRootAbsPath = path.join(repoRoot, 'public', 'sounds');
  const sources = await listImmediateDirectories(soundsRootAbsPath);
  const entries: Array<{ key: string; meta: { author?: string } } | undefined> =
    [];

  for (const sourceId of sources) {
    const voiceIds = await listImmediateDirectories(
      path.join(soundsRootAbsPath, sourceId),
    );
    for (const voiceId of voiceIds) {
      const meta = await readVoiceMeta(soundsRootAbsPath, sourceId, voiceId);
      if (meta) {
        entries.push({ key: `${sourceId}/${voiceId}`, meta });
      }
    }
    // Also check for a default voice meta at the source root (support a few filenames)
    const defaultCandidates = [
      'voice.meta.json',
      'default.meta.json',
      'meta.voice.json',
    ];
    for (const fname of defaultCandidates) {
      const candidate = path.join(soundsRootAbsPath, sourceId, fname);
      try {
        const contents = await fs.readFile(candidate, 'utf8');
        const parsed = JSON.parse(contents) as {
          author?: string;
        };
        entries.push({
          key: `${sourceId}/default`,
          meta: { author: parsed.author },
        });
        break;
      } catch {
        // ignore
      }
    }
  }

  const map = new Map<string, { author?: string }>();
  for (const e of entries) {
    if (e) {
      map.set(e.key, e.meta);
    }
  }
  return map;
}

function buildGlobalSoundsManifest(
  targets: readonly SoundVoiceTarget[],
  counts: ReadonlyMap<string, number>,
  providerLogos: ReadonlyMap<string, string>,
  providerMeta: ReadonlyMap<string, { title?: string; logo?: string }>,
  voiceMeta: ReadonlyMap<string, { author?: string }>,
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
      ...(providerMeta.get(sourceId)?.logo
        ? { logoUrl: providerMeta.get(sourceId)?.logo }
        : {}),
      ...(providerMeta.get(sourceId)?.title
        ? { title: providerMeta.get(sourceId)?.title }
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
          ...(voiceMeta.get(`${sourceId}/${voice.voiceId}`)?.author
            ? { author: voiceMeta.get(`${sourceId}/${voice.voiceId}`)?.author }
            : {}),
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
  providerMeta: ReadonlyMap<string, { title?: string; logo?: string }>;
  voiceMeta: ReadonlyMap<string, { author?: string }>;
}): Promise<void> {
  const globalManifest = buildGlobalSoundsManifest(
    args.targets,
    args.counts,
    args.providerLogos,
    args.providerMeta,
    args.voiceMeta,
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
  const providerMeta = await discoverProviderMeta(repoRoot);
  const voiceMeta = await discoverVoiceMeta(repoRoot);
  const writeResults = await Promise.all(
    targets.map(target => buildAndWriteVoiceManifest(target)),
  );
  const counts = toCountsMap(writeResults);
  await writeGlobalManifest({
    repoRoot,
    targets,
    counts,
    providerLogos,
    providerMeta,
    voiceMeta,
  });
}
