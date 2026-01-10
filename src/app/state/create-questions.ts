import { IQuestion } from '../models/iquestion';
import { IVowel } from '../models/ivowel';
import { QuestionElement } from '../models/question-element';
import { PhonemeSoundsService } from '../services/phoneme-sounds.service';
import { randomInteger } from '../utils/random-integer';
import { shuffle } from '../utils/shuffle';
import { VOWELS } from '../vowels';

/*
  This file intentionally contains the quiz-question generator.
  It is a bit loop-heavy by nature, so we locally relax some complexity rules.
*/
/* eslint-disable max-lines-per-function, max-statements */

function createQuestionsBase(): IQuestion[] {
  const nQuestions = 10;
  const nAnswers = 5;

  const questionStemVowelIds = new Set<IVowel['id']>();
  const questionOptionVowelsById = new Map<IVowel['id'], IVowel[]>();

  while (questionStemVowelIds.size < nQuestions) {
    const optionVowelIds = new Set<IVowel['id']>();
    const minVowelId = 1;
    const maxVowelId = VOWELS.length;
    const stemId =
      `vowel-${randomInteger(minVowelId, maxVowelId + 1)}` as const;

    questionStemVowelIds.add(stemId);
    optionVowelIds.add(stemId);

    while (optionVowelIds.size < nAnswers) {
      const answerId =
        `vowel-${randomInteger(minVowelId, maxVowelId + 1)}` as const;
      optionVowelIds.add(answerId);
    }

    const optionVowels = [...optionVowelIds]
      .map(optionVowelId => VOWELS.find(vowel => vowel.id === optionVowelId))
      .filter((vowel): vowel is IVowel => vowel !== undefined);

    questionOptionVowelsById.set(stemId, optionVowels);
  }

  const questionStemVowels = [...questionStemVowelIds]
    .map(questionStemVowelId =>
      VOWELS.find(vowel => vowel.id === questionStemVowelId),
    )
    .filter((vowel): vowel is IVowel => vowel !== undefined);

  const elements = [
    QuestionElement.Letter,
    QuestionElement.Sound,
    QuestionElement.Name,
  ] as const;

  const minElementIndex = 0;
  const maxElementIndex = 2;

  const questions = questionStemVowels.map((vowel, index) => {
    const questionElements = new Set<QuestionElement>();

    while (questionElements.size < 3) {
      const elementIndex = randomInteger(minElementIndex, maxElementIndex + 1);
      questionElements.add(elements[elementIndex]);
    }

    const [askType, ...answerType] = [...questionElements.values()];

    const question: IQuestion = {
      vowel,
      answered: false,
      type: askType,
      index: index,
      selectedAnswer: void 0,
      options: questionOptionVowelsById.get(vowel.id)!.map(
        optionVowel =>
          ({
            ...optionVowel,
            type: Math.random() < 0.5 ? answerType[0] : answerType[1],
          }) as IVowel & { type: QuestionElement },
      ),
    };

    shuffle(question.options);

    return question;
  });

  return questions;
}

function collectVowelsNeedingSounds(questions: readonly IQuestion[]) {
  const vowelsNeedingSounds = new Map<IVowel['id'], IVowel>();

  for (const question of questions) {
    if (question.type === QuestionElement.Sound) {
      vowelsNeedingSounds.set(question.vowel.id, question.vowel);
    }

    for (const option of question.options) {
      if (option.type === QuestionElement.Sound) {
        vowelsNeedingSounds.set(option.id, option);
      }
    }
  }

  return vowelsNeedingSounds;
}

async function enrichQuestionsWithSounds(
  questions: IQuestion[],
  phonemeSoundsService: PhonemeSoundsService,
): Promise<void> {
  const vowelsNeedingSounds = collectVowelsNeedingSounds(questions);
  const soundsByVowelId = new Map<
    IVowel['id'],
    NonNullable<IVowel['sounds']>
  >();

  for (const vowel of vowelsNeedingSounds.values()) {
    const soundsByChars = await phonemeSoundsService.listSoundsByChars(
      vowel.letter,
    );
    const sounds =
      soundsByChars.length > 0
        ? soundsByChars
        : await phonemeSoundsService.listSoundsByUnicodes(
            vowel.symbol.unicodes,
          );
    soundsByVowelId.set(vowel.id, sounds);
  }

  for (const question of questions) {
    if (question.type === QuestionElement.Sound) {
      const sounds = soundsByVowelId.get(question.vowel.id);
      if (sounds && sounds.length > 0) {
        question.vowel.sounds = sounds;
        question.vowel.soundIndex = randomInteger(0, sounds.length);
      }
    }

    for (const option of question.options) {
      if (option.type === QuestionElement.Sound) {
        const sounds = soundsByVowelId.get(option.id);
        if (sounds && sounds?.length > 0) {
          option.sounds = sounds;
          option.soundIndex = randomInteger(0, sounds.length);
        }
      }
    }
  }
}

export async function createQuestionsWithSounds(
  phonemeSoundsService: PhonemeSoundsService,
): Promise<IQuestion[]> {
  const questions = createQuestionsBase();
  try {
    await enrichQuestionsWithSounds(questions, phonemeSoundsService);
  } catch (error) {
    console.warn(
      '[createQuestionsWithSounds] Unable to preload sounds; continuing without sound metadata.',
      error,
    );
  }
  return questions;
}
