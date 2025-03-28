import { config } from 'typescript-eslint';

export const ts = config({
  name: '@typescript-eslint/custom',
  rules: {
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-extraneous-class': [
      'error',
      { allowStaticOnly: false, allowWithDecorator: true },
    ],
    '@typescript-eslint/no-invalid-void-type': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      {
        allowBoolean: true,
        allowNumber: true,
      },
    ],
    '@typescript-eslint/strict-boolean-expressions': [
      'error',
      {
        allowNullableEnum: false,
        allowNullableObject: false,
        allowNumber: false,
        allowString: false,
      },
    ],
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/unified-signatures': [
      'error',
      { ignoreDifferentlyNamedParameters: true },
    ],
  },
});
