// eslint.config.js (cryptoapi)
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import n from 'eslint-plugin-n';
import promise from 'eslint-plugin-promise';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  { ignores: ['node_modules', 'dist', 'build'] },

  // Браузерный код (без plugin-n)
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2023,
      },
    },
    plugins: {
      import: importPlugin,
      promise,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...promise.configs.recommended.rules,

      'prettier/prettier': 'error',
      'import/extensions': ['error', 'ignorePackages', { js: 'always' }],
      'max-len': [
        'error',
        {
          code: 100,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      'no-multi-spaces': [
        'error',
        { exceptions: { BinaryExpression: true, VariableDeclarator: true } },
      ],
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      quotes: ['error', 'single', { avoidEscape: true }],
    },
  },

  // Node/скрипты/конфиги (тут включаем plugin-n)
  {
    files: ['gulpfile*.js', 'scripts/**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2023,
      },
    },
    plugins: {
      n,
      prettier: eslintPluginPrettier,
    },
    settings: {
      node: {
        version: '>=23.0.0',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...n.configs['flat/recommended-script'].rules,
      'prettier/prettier': 'error',
      // gulpfile/Scripts живут только в dev, поэтому разрешаем devDependencies
      'n/no-unpublished-import': 'off',
      'n/no-unpublished-require': 'off',
    },
  },

  prettier,
];
