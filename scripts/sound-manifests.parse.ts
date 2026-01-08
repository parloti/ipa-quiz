import type {
  ManifestFileEntry,
  SoundVoiceTarget,
} from './sound-manifests.types';

function normalizeUrlPath(...parts: string[]): string {
  return parts.join('/').replaceAll('\\', '/');
}

function tryParseHexCodepoint(text: string): number | undefined {
  const trimmed = text.trim();
  if (!/^[0-9a-fA-F]{4,}$/.test(trimmed)) {
    return undefined;
  }
  const value = Number.parseInt(trimmed, 16);
  return Number.isFinite(value) ? value : undefined;
}

function tryParseVariantIndex(text: string): number | undefined {
  if (!/^\d+$/.test(text)) {
    return undefined;
  }
  const value = Number.parseInt(text, 10);
  return Number.isFinite(value) ? value : undefined;
}

function tryCodepointsToChars(
  codepoints: readonly number[],
): string | undefined {
  if (codepoints.length === 0) {
    return undefined;
  }

  try {
    return String.fromCodePoint(...codepoints);
  } catch {
    return undefined;
  }
}

function parseStem(stem: string): {
  codepoints: number[];
  chars?: string;
  variant?: number;
} {
  const vSuffixMatch = stem.match(/^(.*?)[_-]v(\d+)$/i);
  const numericSuffixMatch = stem.match(/^(.*)_(\d+)$/);

  const baseStem = vSuffixMatch?.[1] ?? numericSuffixMatch?.[1] ?? stem;
  const variantText = vSuffixMatch?.[2] ?? numericSuffixMatch?.[2];
  const variant = variantText ? tryParseVariantIndex(variantText) : undefined;

  const isExplicitUnicode = /^U[0-9a-fA-F]{4,6}(\+U[0-9a-fA-F]{4,6})*$/.test(
    baseStem,
  );

  const codepoints = isExplicitUnicode
    ? baseStem
        .split('+')
        .map(part => part.replace(/^U/i, ''))
        .map(tryParseHexCodepoint)
        .filter((cp): cp is number => cp !== undefined)
    : baseStem
        .split('_')
        .map(part => part.trim())
        .map(tryParseHexCodepoint)
        .filter((cp): cp is number => cp !== undefined);

  const chars = tryCodepointsToChars(codepoints);
  return {
    codepoints,
    ...(chars ? { chars } : {}),
    ...(variant === undefined ? {} : { variant }),
  };
}

export function toManifestFileEntry(
  target: SoundVoiceTarget,
  file: string,
): ManifestFileEntry {
  const stem = file.replace(/\.mp3$/i, '');
  const parsed = parseStem(stem);

  return {
    file,
    stem,
    url: normalizeUrlPath(target.publicPath, file),
    ...(parsed.codepoints.length > 0 ? { codepoints: parsed.codepoints } : {}),
    ...(parsed.chars ? { chars: parsed.chars } : {}),
    ...(parsed.variant === undefined ? {} : { variant: parsed.variant }),
  };
}
