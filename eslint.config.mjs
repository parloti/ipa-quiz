import prettier from "eslint-plugin-prettier";
import { fixupConfigRules, fixupConfigRules } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends(
    "eslint:recommended",
    "plugin:@eslint-community/eslint-comments/recommended",
    "plugin:testing-library/angular",
    "prettier",
), {
    plugins: {
        prettier,
    },

    languageOptions: {
        globals: {},
        ecmaVersion: "latest",
        sourceType: "module",
    },

    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },

        "import/resolver": {
            typescript: {
                alwaysTryTypes: true,
            },
        },
    },

    rules: {
        eqeqeq: ["warn", "always"],
        "sort-keys": "error",
        "@eslint-community/eslint-comments/disable-enable-pair": "off",
        "@eslint-community/eslint-comments/no-unused-disable": "error",

        "@eslint-community/eslint-comments/require-description": ["error", {
            ignore: [],
        }],
    },
}, ...fixupConfigRules(compat.extends(
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "plugin:custom-rules/recommended",
    "plugin:@angular-eslint/recommended",
    "plugin:@angular-eslint/template/process-inline-templates",
    "plugin:@ngrx/strict-requiring-type-checking",
    "plugin:rxjs/recommended",
    "plugin:import/recommended",
    "plugin:import/electron",
    "plugin:import/typescript",
    "plugin:jsdoc/recommended-typescript-error",
    "prettier",
    "plugin:prettier/recommended",
)).map(config => ({
    ...config,
    files: ["**/*.ts"],
})), {
    files: ["**/*.ts"],

    languageOptions: {
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: ["tsconfig.eslint.json", "tsconfig.cy.lint.json", "cypress/tsconfig.json"],
            createDefaultProgram: true,
        },
    },

    rules: {
        eqeqeq: ["error", "always"],
        "lines-between-class-members": ["error", "always"],
        "sort-imports": "off",

        "@typescript-eslint/unified-signatures": ["error", {
            ignoreDifferentlyNamedParameters: true,
        }],

        "@typescript-eslint/no-unsafe-assignment": "off",

        "@typescript-eslint/no-extraneous-class": ["error", {
            allowStaticOnly: false,
            allowWithDecorator: true,
        }],

        "@typescript-eslint/strict-boolean-expressions": ["error", {
            allowString: false,
            allowNumber: false,
            allowNullableObject: false,
            allowNullableEnum: false,
        }],

        "@typescript-eslint/unbound-method": "off",
        "@typescript-eslint/no-invalid-void-type": "off",

        "@angular-eslint/component-selector": ["error", {
            type: "element",
            prefix: "app",
            style: "kebab-case",
        }],

        "@angular-eslint/directive-selector": ["error", {
            type: "attribute",
            prefix: "app",
            style: "camelCase",
        }],

        "@angular-eslint/prefer-standalone-component": "off",
        "@angular-eslint/prefer-on-push-component-change-detection": "off",
        "@ngrx/no-typed-global-store": "off",
        "@ngrx/prefix-selectors-with-select": "off",
        "@ngrx/use-consistent-global-store-name": "off",
        "@ngrx/prefer-effect-callback-in-block-statement": "off",

        "rxjs/finnish": ["error", {
            functions: false,
            methods: false,
            parameters: true,
            properties: false,
            strict: false,

            types: {
                "^EventEmitter$": false,
            },

            variables: true,
        }],

        "rxjs/no-exposed-subjects": ["error", {
            allowProtected: true,
        }],

        "rxjs/no-ignored-error": "error",
        "rxjs/no-ignored-observable": "error",
        "rxjs/no-ignored-subscribe": "error",
        "rxjs/no-ignored-subscription": "error",
        "rxjs/no-implicit-any-catch": "off",
        "rxjs/no-internal": "off",
        "rxjs/no-subclass": "error",
        "rxjs/no-subject-value": "error",
        "rxjs/no-unbound-methods": "off",
        "rxjs/no-unsafe-catch": "error",
        "rxjs/no-unsafe-first": "error",
        "rxjs/no-unsafe-switchmap": "error",
        "rxjs/prefer-observer": "error",
        "rxjs/throw-error": "error",
        "jsdoc/check-indentation": "error",
        "jsdoc/check-line-alignment": "error",
        "jsdoc/check-syntax": "error",
        "jsdoc/imports-as-dependencies": "error",
        "jsdoc/informative-docs": "error",
        "jsdoc/match-description": "error",
        "jsdoc/no-bad-blocks": "error",
        "jsdoc/no-blank-block-descriptions": "error",
        "jsdoc/no-blank-blocks": "error",
        "jsdoc/require-asterisk-prefix": "error",
        "jsdoc/require-description": "error",
        "jsdoc/require-description-complete-sentence": "off",
        "jsdoc/require-hyphen-before-param-description": "error",
        "jsdoc/require-throws": "error",
        "jsdoc/sort-tags": "error",
    },
}, ...fixupConfigRules(compat.extends("plugin:@angular-eslint/template/recommended")).map(config => ({
    ...config,
    files: ["**/*.html"],
})), {
    files: ["**/*.html"],

    rules: {
        "@angular-eslint/template/i18n": "off",

        "@angular-eslint/template/attributes-order": ["error", {
            alphabetical: true,
        }],
    },
}];