export interface IpaSoundEntry {
  file: string;
  stem: string;
  /**
   * URL relative to the app base href (works on GitHub Pages)
   * Example: `sounds/ipa/jill_house/0251.mp3`
   */
  url: string;
  codepoints?: number[];
  chars?: string;
  /** When multiple recordings exist for the same symbol (e.g. `0325_2.mp3`) */
  variant?: number;
}

export interface IpaSoundManifest {
  version: 1;
  generatedAt: string;
  source: string;
  path: string;
  count: number;
  files: IpaSoundEntry[];
}
