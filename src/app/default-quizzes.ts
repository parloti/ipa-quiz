import { IQuiz, IQuizID } from './models/iquiz';

export const defaultQuizzes: Record<IQuizID, IQuiz> = {
  'quiz-1': {
    id: 'quiz-1',
    name: 'IPA Vowels',
    description:
      'Learn the International Phonetic Alphabet (IPA) symbols for vowels.',
    sessions: {},
  },
  'quiz-2': {
    sessions: {},
    id: 'quiz-2',
    name: 'IPA Consonants',
    description:
      'Learn the International Phonetic Alphabet (IPA) symbols for consonants.',
  },
};
