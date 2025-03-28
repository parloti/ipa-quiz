import { configs } from 'eslint-plugin-rxjs';
import { config } from 'typescript-eslint';

export const rxjs = config({
  extends: [configs.strict],
  name: 'rxjs/custom',
  rules: {
    'rxjs/no-ignored-default-value': 'off',
    'rxjs/no-unbound-methods': 'off',
  },
});
