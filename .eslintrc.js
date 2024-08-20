module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
    ],
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    rules: {
      //тут пользовательские правила...
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  };
  