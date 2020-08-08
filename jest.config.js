module.exports = {
  verbose: true,
  testMatch: [
    '<rootDir>/src/__tests__/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: ['(testCases).*$'],
  collectCoverage: false,
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,ts}'],
  coveragePathIgnorePatterns: ['<rootDir>/src/__tests__/'],
  coverageDirectory: '<rootDir>/coverage/',
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  setupFiles: ['<rootDir>/src/setupJest.js'],
};
