module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/main'],
  moduleNameMapper: {
    '^@renderer/(.*)$': '<rootDir>/src/renderer/$1',
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
};
