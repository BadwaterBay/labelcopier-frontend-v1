module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jquery: true,
  },
  extends: [
    'google',
    'plugin:prettier/recommended',
    'plugin:css-modules/recommended',
    'plugin:json/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'prettier/prettier': 'error',
    'no-invalid-this': 1,
    'new-cap': 1,
  },
  plugins: ['prettier', 'html', 'jquery', 'css-modules', 'markdown'],
};
