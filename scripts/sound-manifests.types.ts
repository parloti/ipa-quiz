export type SoundVoiceTarget = {
  sourceId: string;
  voiceId: string;
  publicPath: string;
  absPath: string;
};

export type ManifestFileEntry = {
  file: string;
  stem: string;
  url: string;
  codepoints?: number[];
  chars?: string;
  variant?: number;
};

export type VoiceFolderManifest = {
  version: 2;
  generatedAt: string;
  sourceId: string;
  voiceId: string;
  path: string;
  count: number;
  files: ManifestFileEntry[];
};

export type GlobalVoiceIndex = {
  voiceId: string;
  path: string;
  manifestUrl: string;
  count: number;
};

export type GlobalSourceIndex = {
  sourceId: string;
  logoUrl?: string;
  voices: GlobalVoiceIndex[];
};

export type GlobalSoundsManifest = {
  version: 1;
  generatedAt: string;
  sources: GlobalSourceIndex[];
};

export type WriteResult = { key: string; count: number };
export type LogoResult = { sourceId: string; logoUrl: string };

export const LOGO_EXTENSIONS: readonly string[] = [
  'svg',
  'png',
  'webp',
  'jpg',
  'jpeg',
];
