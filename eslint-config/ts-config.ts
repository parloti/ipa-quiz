import { config, configs } from 'typescript-eslint';

import { appRootPath } from '../app-root-path';
import { es } from './es';
import { importPlugin } from './import';
import { jasmine } from './jasmine';
import { jest } from './jest';
import { angular, template } from './ng';
import { ngrx } from './ngrx';
import { rxjs } from './rxjs';
import { spec } from './spec';
import { ts } from './ts';

const { strictTypeChecked, stylisticTypeChecked } = configs;

export const tsConfig = config(
  {
    extends: [
      es,
      strictTypeChecked,
      stylisticTypeChecked,
      ts,
      rxjs,
      angular,
      ngrx,
      importPlugin,
    ],
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        // TODO: REMOVER 1/1 e TESTAR
        project: ['./tsconfig.eslint.json', '../tsconfig.eslint.json'],
        tsconfigRootDir: appRootPath,
      },
    },
  },
  {
    extends: [spec, jest],
    files: ['**/*.spec.ts.disabled'],
    ignores: ['**/*.web.spec.ts'],
  },
  {
    extends: [spec, jasmine],
    files: ['**/*.spec.ts'],
  },
  {
    extends: template,
    files: ['**/*.html'],
  },
);
