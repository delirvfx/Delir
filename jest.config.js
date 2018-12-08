module.exports = {
    rootDir: '.',
    transform: {
        '^.+\\.tsx?$': 'ts-jest/preprocessor',
    },
    testRegex: 'src/.*\\.spec\\.tsx?$',
    moduleFileExtensions: ['ts', 'js'],
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.test.json',
        },
    },
}
