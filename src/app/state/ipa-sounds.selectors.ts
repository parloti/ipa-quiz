import type { IpaSoundEntry, IpaSoundManifest } from '../models/ipa-sounds';

function arraysEqual(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function selectIpaSoundEntryByFile(
  manifest: IpaSoundManifest | undefined,
  file: string,
): IpaSoundEntry | undefined {
  return manifest?.files.find(entry => entry.file === file);
}

export function selectIpaSoundEntryByStem(
  manifest: IpaSoundManifest | undefined,
  stem: string,
): IpaSoundEntry | undefined {
  return manifest?.files.find(entry => entry.stem === stem);
}

export function selectIpaSoundEntryByChars(
  manifest: IpaSoundManifest | undefined,
  chars: string,
): IpaSoundEntry | undefined {
  return manifest?.files.find(entry => entry.chars === chars);
}

export function selectIpaSoundEntryByCodepoints(
  manifest: IpaSoundManifest | undefined,
  codepoints: readonly number[],
): IpaSoundEntry | undefined {
  return manifest?.files.find(entry =>
    entry.codepoints ? arraysEqual(entry.codepoints, codepoints) : false,
  );
}

export function selectIpaSoundUrlByChars(
  manifest: IpaSoundManifest | undefined,
  chars: string,
): string | undefined {
  return selectIpaSoundEntryByChars(manifest, chars)?.url;
}

export function selectIpaSoundUrlByCodepoints(
  manifest: IpaSoundManifest | undefined,
  codepoints: readonly number[],
): string | undefined {
  return selectIpaSoundEntryByCodepoints(manifest, codepoints)?.url;
}
