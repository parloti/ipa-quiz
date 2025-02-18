import { IQuiz } from './models/iquiz';
import { VOWELS } from './vowels';

const initialStatistics = Object.freeze({
  totalQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
  totalElementsSeen: 0,
});

export const defaultQuizzes: IQuiz[] = [
  {
    id: 1,
    name: 'IPA Vowels',
    description:
      'Learn the International Phonetic Alphabet (IPA) symbols for vowels.',
    statistics: { ...initialStatistics, totalElements: VOWELS.length },
  },
  {
    id: 2,
    name: 'IPA Consonants',
    description:
      'Learn the International Phonetic Alphabet (IPA) symbols for consonants.',
    statistics: { ...initialStatistics, totalElements: 0 },
  },
];
