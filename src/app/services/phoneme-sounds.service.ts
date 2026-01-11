import { Injectable } from '@angular/core';
import { type PhonemeSoundRef } from '../models/phoneme-sound';

type GlobalSoundsManifest = {
  version: 1;
  generatedAt: string;
  sources: Array<{
    sourceId: string;
    logoUrl?: string;
    title?: string;
    voices: Array<{
      voiceId: string;
      path: string;
      manifestUrl: string;
      count: number;
      author?: string;
    }>;
  }>;
};

type VoiceSoundsManifest = {
  version: 2;
  generatedAt: string;
  sourceId: string;
  voiceId: string;
  path: string;
  count: number;
  files: Array<{
    file: string;
    stem: string;
    url: string;
    codepoints?: number[];
    chars?: string;
    variant?: number;
  }>;
};

export type PickedPhonemeSound = PhonemeSoundRef;

function pickRandom<T>(items: readonly T[]): T | undefined {
  if (items.length === 0) {
    return undefined;
  }
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

function tryUnicodesToChars(unicodes: readonly string[]): string | undefined {
  const codepoints = unicodes
    .map(text => text.trim())
    .map(text => text.replace(/^U\+?/i, '').replace(/^0x/i, ''))
    .map(text => (text ? Number.parseInt(text, 16) : Number.NaN))
    .filter(cp => Number.isFinite(cp));

  if (codepoints.length === 0) {
    return undefined;
  }

  try {
    return String.fromCodePoint(...codepoints);
  } catch {
    return undefined;
  }
}

@Injectable({ providedIn: 'root' })
export class PhonemeSoundsService {
  private indexPromise?: Promise<GlobalSoundsManifest>;
  private voiceManifestPromises = new Map<
    string,
    Promise<VoiceSoundsManifest>
  >();

  async pickSoundByChars(
    chars: string,
  ): Promise<PickedPhonemeSound | undefined> {
    return pickRandom(await this.listSoundsByChars(chars));
  }

  async listSoundsByChars(chars: string): Promise<PickedPhonemeSound[]> {
    const index = await this.loadIndex();
    const voiceRefs = index.sources.flatMap(source =>
      source.voices.map(voice => voice.manifestUrl),
    );

    const logoBySourceId = new Map(
      index.sources
        .filter(source => !!source.logoUrl)
        .map(source => [source.sourceId, source.logoUrl!] as const),
    );

    const titleBySourceId = new Map(
      index.sources
        .filter(source => !!source.title)
        .map(source => [source.sourceId, source.title!] as const),
    );

    const voiceMetaByKey = new Map(
      index.sources
        .flatMap(source =>
          source.voices.map(
            v =>
              [
                `${source.sourceId}/${v.voiceId}`,
                { author: v.author },
              ] as const,
          ),
        )
        .filter(([, meta]) => meta.author),
    );

    const manifests = await Promise.all(
      voiceRefs.map(manifestUrl => this.loadVoiceManifest(manifestUrl)),
    );

    const matches = manifests.flatMap(manifest =>
      manifest.files
        .filter(file => file.chars === chars)
        .map(file => ({
          url: file.url,
          sourceId: manifest.sourceId,
          voiceId: manifest.voiceId,
          ...(logoBySourceId.get(manifest.sourceId)
            ? { logoUrl: logoBySourceId.get(manifest.sourceId) }
            : {}),
          ...(titleBySourceId.get(manifest.sourceId)
            ? { sourceTitle: titleBySourceId.get(manifest.sourceId) }
            : {}),
          ...(voiceMetaByKey.get(`${manifest.sourceId}/${manifest.voiceId}`)
            ? voiceMetaByKey.get(`${manifest.sourceId}/${manifest.voiceId}`)
            : {}),
        })),
    );

    return matches;
  }

  async pickSoundByUnicodes(
    unicodes: readonly string[],
  ): Promise<PickedPhonemeSound | undefined> {
    return pickRandom(await this.listSoundsByUnicodes(unicodes));
  }

  async listSoundsByUnicodes(
    unicodes: readonly string[],
  ): Promise<PickedPhonemeSound[]> {
    const chars = tryUnicodesToChars(unicodes);
    return chars ? this.listSoundsByChars(chars) : [];
  }

  async pickSoundUrlByChars(chars: string): Promise<string | undefined> {
    return (await this.pickSoundByChars(chars))?.url;
  }

  async pickSoundUrlByUnicodes(
    unicodes: readonly string[],
  ): Promise<string | undefined> {
    return (await this.pickSoundByUnicodes(unicodes))?.url;
  }

  private loadIndex(): Promise<GlobalSoundsManifest> {
    this.indexPromise ??= this.fetchJson<GlobalSoundsManifest>(
      'sounds/manifest.json',
    );
    return this.indexPromise;
  }

  private loadVoiceManifest(manifestUrl: string): Promise<VoiceSoundsManifest> {
    const key = manifestUrl;
    const existing = this.voiceManifestPromises.get(key);
    if (existing) {
      return existing;
    }

    const created = this.fetchJson<VoiceSoundsManifest>(manifestUrl);
    this.voiceManifestPromises.set(key, created);
    return created;
  }

  private async fetchJson<T>(relativeUrl: string): Promise<T> {
    const url = new URL(relativeUrl, document.baseURI).toString();
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to load sound manifest: ${response.status} ${response.statusText} (${relativeUrl})`,
      );
    }

    return (await response.json()) as T;
  }
}
