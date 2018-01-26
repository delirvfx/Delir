module.exports = {
  rootDir: 'src',
  transform: {
    '^.+\\.tsx?$': 'ts-jest/preprocessor'
  },
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js'],
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.test.json'
    }
  }
};
