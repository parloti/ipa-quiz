// eslint-disable @typescript-eslint/no-unused-vars
import { defineConfig } from 'eslint/config';

import { eslint } from './core/eslint';

import { resolver, typescript } from './core';

import { template } from './domain';

export const tsConfig = defineConfig(
  {
    files: ['**/*.ts'],
    extends: [
      eslint,
      resolver,
      typescript,

      // boundaries,
      // importX,

      // comments,
      // jsdoc,

      // testingLibrary,
      // vitest,

      // angular,
      // ngrx,
      // rxjs,

      // stylistic,
      // prettier,
      // perfectionist,
    ],
  },
  template,
);
