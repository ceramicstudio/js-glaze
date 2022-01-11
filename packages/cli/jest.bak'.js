module.exports = {
  preset: 'ts-jest',
  testTimeout: 10000,
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',
}
