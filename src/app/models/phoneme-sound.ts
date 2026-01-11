export type PhonemeSoundRef = {
  url: string;
  sourceId: string;
  /** source (provider) id */
  voiceId: string;
  /** Optional provider logo URL (public path) */
  logoUrl?: string;
  /** Optional provider title from meta */
  sourceTitle?: string;
  /** Optional voice author/attribution from voice meta */
  author?: string;
};
