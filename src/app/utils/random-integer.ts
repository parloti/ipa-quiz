// type IRange<TArr extends unknown[] = []> = TArr["length"] extends IKnownLength
//   ? TArr[number]
//   : IRange<[...TArr, TArr["length"]]>;

// type IPositive<TNum extends number> = `${TNum}` extends `-${number}`
//   ? never
//   : TNum;

//   type IOpposite<TNum extends number> = TNum extends `-${number}`;
// type q = [IOpposite<1>,IOpposite<-1>];
// //   ^?

// type IRangeVar<TMax extends number, TArr extends unknown[] = []> =
//   TMax extends IPositive<TMax>
//     ? TArr["length"] extends TMax
//       ? TArr[number]
//       : IRangeVar<TMax, [...TArr, TArr["length"]]>
//     : never;

// type IPar = 0 | 2 | 4 | 6 | 8;
// type IDigito = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// type Tabuada = {
//   "0": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
//   "1": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
//   "2": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
//   "3": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
//   "4": [4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
//   "5": [5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
//   "6": [6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
//   "7": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
//   "8": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
//   "9": [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
// };

// type IÉPar<TNum extends number> = `${TNum}` extends `${string}${IPar}`
//   ? true
//   : false;

// type IÉPar<TNum extends number> = `${TNum}` extends `${string}${IPar}`
//   ? true
//   : false;

// type IÉImpar<TNum extends number> = TNum extends IÉPar<TNum> ? false : true;

// type c = IÉPar<11>;
// type cd = IÉImpar<11>;

// type NaturalNumber = IRange;
// type NaturalNumber2 = IRangeVar<-20>;

// type N = Exclude<NaturalNumber, NaturalNumber2>;

// type IIndex = IKnownEvents extends Readonly<unknown[infer TLenght]>?1:0;

// type ColDefObject = Record<(keyof IKnownEvents), undefined>;
// type c: = IIndex extends number[]?1:0;
// type ITitles = IKnownEvents[IIndex]

/**
 * Returns a random integer between the specified values.
 * The value is no lower than min (or the next integer greater than min if min isn't an integer), and is less than (but not equal to) max.
 * @param min -
 * @param max
 * @returns
 */
export function randomInteger<TMin extends number, TMax extends number>(
  min: TMin,
  max: TMax,
): number {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}
