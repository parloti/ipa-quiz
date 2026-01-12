import { defaultQuizzes } from '../default-quizzes';
import { IQuestion } from '../models/iquestion';
import { IQuiz, IQuizID } from '../models/iquiz';
import { ISession, ISessionID } from '../models/isession';
import { IState } from '../models/istate';
import { IVowel, IVowelID } from '../models/ivowel';
import { QuestionElement } from '../models/question-element';
import { VOWELS } from '../vowels';

/**
 * Normalized option - only user-specific/dynamic data
 */
interface INormalizedOption {
  vowelId: IVowelID;
  type: QuestionElement;
  soundIndex?: number;
}

/**
 * Normalized question - references vowelId instead of embedding full IVowel
 */
interface INormalizedQuestion {
  vowelId: IVowelID;
  vowelSoundIndex?: number;
  type: QuestionElement;
  index: number;
  options: Record<IVowelID, INormalizedOption>;
  selectedAnswer: IVowelID | undefined;
  answered: boolean;
  answeredDate?: string;
}

/**
 * Normalized session - questions are normalized
 */
interface INormalizedSession {
  quizId: IQuizID;
  id: ISessionID;
  creationDate: string;
  questions: Record<number | string, INormalizedQuestion>;
  currentQuestionIndex: number;
}

/**
 * Normalized quiz - only user-specific data, no static metadata
 */
interface INormalizedQuiz {
  id: IQuizID;
  currentSessionId?: ISessionID;
  sessions: Record<ISessionID, INormalizedSession>;
}

/**
 * Normalized state for cloud storage - minimal footprint
 */
export interface INormalizedState {
  quizzes: Record<IQuizID, INormalizedQuiz>;
  currentQuizId: IQuizID | undefined;
  version: number;
}

// Build a lookup map for vowels by ID
const vowelById = new Map<IVowelID, IVowel>(
  VOWELS.map(vowel => [vowel.id, vowel]),
);

/**
 * Normalize state for cloud sync - strips static data
 */
export function normalizeState(state: IState): INormalizedState {
  const normalizedQuizzes: Record<IQuizID, INormalizedQuiz> = {} as any;

  for (const [quizId, quiz] of Object.entries(state.quizzes)) {
    const normalizedSessions: Record<ISessionID, INormalizedSession> =
      {} as any;

    for (const [sessionId, session] of Object.entries(quiz.sessions ?? {})) {
      const normalizedQuestions: Record<number | string, INormalizedQuestion> =
        {};

      for (const [qKey, question] of Object.entries(session.questions ?? {})) {
        const normalizedOptions: Record<IVowelID, INormalizedOption> =
          {} as any;

        for (const [optionId, option] of Object.entries(
          question.options ?? {},
        )) {
          normalizedOptions[optionId as IVowelID] = {
            vowelId: option.id,
            type: option.type,
            soundIndex: option.soundIndex,
          };
        }

        normalizedQuestions[qKey] = {
          vowelId: question.vowel.id,
          vowelSoundIndex: question.vowel.soundIndex,
          type: question.type,
          index: question.index,
          options: normalizedOptions,
          selectedAnswer: question.selectedAnswer,
          answered: question.answered,
          answeredDate: question.answeredDate,
        };
      }

      normalizedSessions[sessionId as ISessionID] = {
        quizId: session.quizId,
        id: session.id,
        creationDate: session.creationDate,
        questions: normalizedQuestions,
        currentQuestionIndex: session.currentQuestionIndex,
      };
    }

    normalizedQuizzes[quizId as IQuizID] = {
      id: quiz.id,
      currentSessionId: quiz.currentSessionId,
      sessions: normalizedSessions,
    };
  }

  return {
    quizzes: normalizedQuizzes,
    currentQuizId: state.currentQuizId,
    version: state.version,
  };
}

/**
 * Denormalize state from cloud - restores full IVowel objects from local data
 */
export function denormalizeState(normalized: INormalizedState): IState {
  const quizzes: Record<IQuizID, IQuiz> = {} as any;

  for (const [quizId, normalizedQuiz] of Object.entries(normalized.quizzes)) {
    // Get static quiz metadata from defaultQuizzes
    const staticQuiz = defaultQuizzes[quizId as IQuizID];
    if (!staticQuiz) {
      // Skip unknown quizzes (shouldn't happen, but be safe)
      continue;
    }

    const sessions: Record<ISessionID, ISession> = {} as any;

    for (const [sessionId, normalizedSession] of Object.entries(
      normalizedQuiz.sessions ?? {},
    )) {
      const questions: Record<number | string, IQuestion> = {};

      for (const [qKey, normalizedQuestion] of Object.entries(
        normalizedSession.questions ?? {},
      )) {
        // Restore full vowel from local VOWELS array
        const vowel = vowelById.get(normalizedQuestion.vowelId);
        if (!vowel) {
          continue; // Skip if vowel not found (shouldn't happen)
        }

        const options: Record<
          IVowelID,
          IVowel & { type: QuestionElement; soundIndex?: number }
        > = {} as any;

        for (const [optionId, normalizedOption] of Object.entries(
          normalizedQuestion.options ?? {},
        )) {
          const optionVowel = vowelById.get(normalizedOption.vowelId);
          if (optionVowel) {
            options[optionId as IVowelID] = {
              ...optionVowel,
              type: normalizedOption.type,
              soundIndex: normalizedOption.soundIndex,
            };
          }
        }

        const baseQuestion = {
          vowel: {
            ...vowel,
            soundIndex: normalizedQuestion.vowelSoundIndex,
          },
          type: normalizedQuestion.type,
          index: normalizedQuestion.index,
          options,
        };

        if (normalizedQuestion.answered) {
          questions[qKey] = {
            ...baseQuestion,
            answered: true,
            selectedAnswer: normalizedQuestion.selectedAnswer!,
            answeredDate: normalizedQuestion.answeredDate!,
          } as IQuestion;
        } else {
          questions[qKey] = {
            ...baseQuestion,
            answered: false,
            selectedAnswer: undefined,
          } as IQuestion;
        }
      }

      sessions[sessionId as ISessionID] = {
        quizId: normalizedSession.quizId,
        id: normalizedSession.id,
        creationDate: normalizedSession.creationDate,
        questions,
        currentQuestionIndex: normalizedSession.currentQuestionIndex,
      };
    }

    quizzes[quizId as IQuizID] = {
      ...staticQuiz, // name, description from local static data
      id: normalizedQuiz.id,
      currentSessionId: normalizedQuiz.currentSessionId,
      sessions,
    };
  }

  // Ensure all default quizzes exist (even if not in cloud state)
  for (const [quizId, staticQuiz] of Object.entries(defaultQuizzes)) {
    if (!quizzes[quizId as IQuizID]) {
      quizzes[quizId as IQuizID] = { ...staticQuiz };
    }
  }

  return {
    quizzes,
    currentQuizId: normalized.currentQuizId,
    version: normalized.version,
  };
}
