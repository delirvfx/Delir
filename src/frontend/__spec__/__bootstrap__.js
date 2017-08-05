global.expect = require('expect.js')

require('ts-node').register({
    fast: true,
    compilerOptions: {
        target: 'es2015',
        module: 'commonjs',
    },
})
