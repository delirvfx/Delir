global.expect = require('expect.js')
global.__DEV__ = false

const stylus = require('stylus')

require('ts-node').register({
    fast: true,
    compilerOptions: {
        target: 'es2015',
        module: 'commonjs',
    },
})

require('css-modules-require-hook')({
    extensions: ['.styl'],
    preprocessCss: (css, filename) =>
        stylus(css)
            .set('filename', filename)
            .render(),
})
