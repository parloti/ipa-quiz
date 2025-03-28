import { configs, processInlineTemplates } from 'angular-eslint';
import { config } from 'typescript-eslint';

export const angular = config({
  extends: configs.tsRecommended,
  name: '@angular-eslint/custom',
  processor: processInlineTemplates,
  rules: {
    '@angular-eslint/component-selector': [
      'error',
      {
        prefix: 'app',
        style: 'kebab-case',
        type: 'element',
      },
    ],
    '@angular-eslint/directive-selector': [
      'error',
      {
        prefix: 'app',
        style: 'camelCase',
        type: 'attribute',
      },
    ],
    '@angular-eslint/prefer-on-push-component-change-detection': 'off',
  },
});

export const template = config({
  extends: [configs.templateRecommended, configs.templateAccessibility],
  name: '@angular-eslint/template/custom',
  rules: {
    '@angular-eslint/template/attributes-order': [
      'error',
      { alphabetical: true },
    ],
    '@angular-eslint/template/click-events-have-key-events': 'off',
    '@angular-eslint/template/i18n': 'off',
    '@angular-eslint/template/interactive-supports-focus': 'off',
  },
});
