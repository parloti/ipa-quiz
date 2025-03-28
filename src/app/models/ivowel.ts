import { ILetter } from './iletter';

export interface IVowel {
  audio: {
    href: string;
    file: string;
  };
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
