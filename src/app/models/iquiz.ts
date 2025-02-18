import { IStatistics } from './istatistics';

export interface IQuiz {
  name: string;
  description: string;
  id: number;
  started?: boolean;
  statistics: IStatistics;
}
