import pluginJs from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

import { comments } from './comments';
import { jsdoc } from './jsdoc';
import { perfectionist } from './perfectionist';
import { prettier } from './prettier';
import { testingLibrary } from './testing-library';

export const es = defineConfig(
  pluginJs.configs.recommended,
  globalIgnores(
    ['.angular', '.chrome', 'dist', 'html', 'XM Global MT5'],
    '@eslint/js/custom-ignore-directory',
  ),
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      // TODO: TESTAR - REMOVER
      parserOptions: {
        // TODO: TESTAR - REMOVER
        project: ['./tsconfig.eslint.json', '../tsconfig.eslint.json'],
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },
    name: '@eslint/js/custom',
    rules: {
      eqeqeq: ['warn', 'always'],
      'lines-between-class-members': ['error', 'always'],
      'no-debugger': 'off',
      'sort-imports': 'off',
    },
  },
  ...comments,
  ...jsdoc,
  ...testingLibrary,
  ...perfectionist,
  prettier,
);
