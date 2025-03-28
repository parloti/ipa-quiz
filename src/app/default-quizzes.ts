import { IQuiz } from './models/iquiz';

export const defaultQuizzes: IQuiz[] = [
  {
    id: 'quiz-1',
    name: 'IPA Vowels',
    description:
      'Learn the International Phonetic Alphabet (IPA) symbols for vowels.',
    sessions: [],
  },
  {
    sessions: [],
    id: 'quiz-2',
    name: 'IPA Consonants',
    description:
      'Learn the International Phonetic Alphabet (IPA) symbols for consonants.',
  },
];
