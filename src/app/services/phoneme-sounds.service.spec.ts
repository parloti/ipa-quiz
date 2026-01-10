import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PhonemeSoundsService } from './phoneme-sounds.service';

type MockResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<unknown>;
};

function responseOk(data: unknown): MockResponse {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => data,
  };
}

function responseError(status = 500, statusText = 'Error'): MockResponse {
  return {
    ok: false,
    status,
    statusText,
    json: async () => ({}),
  };
}

describe('PhonemeSoundsService', () => {
  let service: PhonemeSoundsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PhonemeSoundsService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('picks a matching sound url by chars', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('sounds/manifest.json')) {
        return responseOk({
          version: 1,
          generatedAt: 'now',
          sources: [
            {
              sourceId: 'ipa',
              voices: [
                {
                  voiceId: 'jill_house',
                  path: 'sounds/ipa/jill_house',
                  manifestUrl: 'sounds/ipa/jill_house/manifest.json',
                  count: 1,
                },
              ],
            },
          ],
        });
      }

      if (url.includes('sounds/ipa/jill_house/manifest.json')) {
        return responseOk({
          version: 2,
          generatedAt: 'now',
          sourceId: 'ipa',
          voiceId: 'jill_house',
          path: 'sounds/ipa/jill_house',
          count: 2,
          files: [
            {
              file: '0069.mp3',
              stem: '0069',
              url: 'sounds/ipa/jill_house/0069.mp3',
              chars: 'i',
              codepoints: [105],
            },
            {
              file: '9999.mp3',
              stem: '9999',
              url: 'sounds/ipa/jill_house/9999.mp3',
              chars: 'x',
              codepoints: [120],
            },
          ],
        });
      }

      return responseError(404, 'Not Found');
    });

    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    const url = await service.pickSoundUrlByChars('i');
    expect(url).toBe('sounds/ipa/jill_house/0069.mp3');
  });

  it('returns undefined when no match exists', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('sounds/manifest.json')) {
        return responseOk({
          version: 1,
          generatedAt: 'now',
          sources: [
            {
              sourceId: 'ipa',
              voices: [
                {
                  voiceId: 'jill_house',
                  path: 'sounds/ipa/jill_house',
                  manifestUrl: 'sounds/ipa/jill_house/manifest.json',
                  count: 1,
                },
              ],
            },
          ],
        });
      }

      if (url.includes('sounds/ipa/jill_house/manifest.json')) {
        return responseOk({
          version: 2,
          generatedAt: 'now',
          sourceId: 'ipa',
          voiceId: 'jill_house',
          path: 'sounds/ipa/jill_house',
          count: 0,
          files: [],
        });
      }

      return responseError(404, 'Not Found');
    });

    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    const url = await service.pickSoundUrlByChars('i');
    expect(url).toBeUndefined();
  });

  it('converts unicodes to chars and reuses chars lookup', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('sounds/manifest.json')) {
        return responseOk({
          version: 1,
          generatedAt: 'now',
          sources: [
            {
              sourceId: 'ipa',
              voices: [
                {
                  voiceId: 'jill_house',
                  path: 'sounds/ipa/jill_house',
                  manifestUrl: 'sounds/ipa/jill_house/manifest.json',
                  count: 1,
                },
              ],
            },
          ],
        });
      }

      if (url.includes('sounds/ipa/jill_house/manifest.json')) {
        return responseOk({
          version: 2,
          generatedAt: 'now',
          sourceId: 'ipa',
          voiceId: 'jill_house',
          path: 'sounds/ipa/jill_house',
          count: 1,
          files: [
            {
              file: '0069.mp3',
              stem: '0069',
              url: 'sounds/ipa/jill_house/0069.mp3',
              chars: 'i',
              codepoints: [105],
            },
          ],
        });
      }

      return responseError(404, 'Not Found');
    });

    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    const url = await service.pickSoundUrlByUnicodes(['U+0069']);
    expect(url).toBe('sounds/ipa/jill_house/0069.mp3');
  });

  it('caches index and voice manifests across calls', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes('sounds/manifest.json')) {
        return responseOk({
          version: 1,
          generatedAt: 'now',
          sources: [
            {
              sourceId: 'ipa',
              voices: [
                {
                  voiceId: 'jill_house',
                  path: 'sounds/ipa/jill_house',
                  manifestUrl: 'sounds/ipa/jill_house/manifest.json',
                  count: 1,
                },
              ],
            },
          ],
        });
      }

      if (url.includes('sounds/ipa/jill_house/manifest.json')) {
        return responseOk({
          version: 2,
          generatedAt: 'now',
          sourceId: 'ipa',
          voiceId: 'jill_house',
          path: 'sounds/ipa/jill_house',
          count: 1,
          files: [
            {
              file: '0069.mp3',
              stem: '0069',
              url: 'sounds/ipa/jill_house/0069.mp3',
              chars: 'i',
              codepoints: [105],
            },
          ],
        });
      }

      return responseError(404, 'Not Found');
    });

    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    await service.pickSoundUrlByChars('i');
    await service.pickSoundUrlByChars('i');

    const indexCalls = fetchMock.mock.calls.filter(([arg]) =>
      String(arg).includes('sounds/manifest.json'),
    );
    const voiceCalls = fetchMock.mock.calls.filter(([arg]) =>
      String(arg).includes('sounds/ipa/jill_house/manifest.json'),
    );

    expect(indexCalls.length).toBe(1);
    expect(voiceCalls.length).toBe(1);
  });
});
