export default {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  transformIgnorePatterns: ['./node_modules/(?!(execa)/)'],
  transform: {
    '^.+\\.(ts|js)$': 'ts-jest',
  },
}
