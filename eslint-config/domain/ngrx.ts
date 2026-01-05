import { configs } from '@ngrx/eslint-plugin/v9';
import { Config, defineConfig } from 'eslint/config';

export const ngrx = defineConfig({
  extends: configs.allTypeChecked as unknown as Config[],
  name: '@ngrx/custom',
  rules: {
    // TODO: These can be re-enabled gradually; they are currently too noisy for the repo.
    '@ngrx/no-typed-global-store': 'off',
    '@ngrx/use-consistent-global-store-name': 'off',
    '@ngrx/on-function-explicit-return-type': 'off',
    '@ngrx/prefix-selectors-with-select': 'off',
    '@ngrx/prefer-inline-action-props': 'off',
  },
});
