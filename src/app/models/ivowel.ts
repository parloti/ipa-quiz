import { ILetter } from './iletter';
import { type PhonemeSoundRef } from './phoneme-sound';

export interface IVowel {
  letter: ILetter;
  name: string;
  // name: `${IConstriction} ${IPlacement}(( ${IShape})| )`;
  symbol: {
    entities: string[];
    href: string;
    unicodes: string[];
    names: string[];
  };
  id: `vowel-${number}`;

  /** Optional precomputed sound choices for this vowel (static-host friendly). */
  sounds?: PhonemeSoundRef[];
}
/**

    "Mid central",

    "Near-open central",

    "Near-open front unrounded",

    "Open central unrounded",
 */

// type u1 = `${'front '}${'' | 'un'}${'rounded'}`;
// type u2 = 'back rounded';
// type u = `${'Near-close near-'}${u1 | u2}`;

// type y = `${'Open' | 'Mid'} ${'front' | 'back'} ${'' | 'un'}rounded`;

// type x = `${'Close' | 'Close-mid' | 'Open-mid'} ${
//   | 'front'
//   | 'central'
//   | 'back'} ${'' | 'un'}rounded`;
// type ISpace = ' ';
// type IShape = 'unrounded' | 'rounded';

// type IPlacement = 'front' | 'central' | 'back' | 'near-front' | 'near-back';
// type IConstriction =
//   | 'Close'
//   | 'Near-close'
//   | 'Close-mid'
//   | 'Mid'
//   | 'Open-mid'
//   | 'Near-open'
//   | 'Open';
