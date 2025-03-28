import { configs } from '@ngrx/eslint-plugin/v9';
import { config } from 'typescript-eslint';

export const ngrx = config({
  extends: configs.all,
  name: '@ngrx/custom',
  rules: {
    '@ngrx/no-typed-global-store': 'off',
    '@ngrx/use-consistent-global-store-name': ['off', 'store$'],
  },
});
