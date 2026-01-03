export function shuffle<T>(array: T[]): void {
  let i = array.length;

  while (i != 0) {
    const j = Math.floor(Math.random() * i);
    i--;

    [array[i], array[j]] = [array[j], array[i]];
  }
}
