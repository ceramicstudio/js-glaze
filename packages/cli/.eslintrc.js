module.exports = {
  env: { node: true },
  extends: ['3box', '3box/typescript'],
  parserOptions: {
    project: ['tsconfig.json'],
  },
  rules: {
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
}
