export interface IMovingAverage {
  length: number;
  type: `${'S' | 'E'}MA`;
  value: number;
}
