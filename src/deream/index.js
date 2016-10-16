const duplexer = require('duplexer3');
const {spawn} = require('child_process');

const isObject = target => Object.getPrototypeOf(target) === Object.prototype;
const hasKey = (target, property) => ({}).hasOwnProperty.call(target, property);
const entries = object => Object.keys(object).map(key => [key, object[key]]);

const parseArgs = args => {
    const ignoreKeys = ['y'];

    if (typeof args === 'string') {
        return args.split(' ');
    }
    else if (isObject(args)) {
        const _args = [];

        for (const [key, value] of entries(args)) {
            if (ignoreKeys.indexOf(key) !== -1) {
                continue;
            }

            _args.push(`-${key}`);
            value !== '' && _args.push(value);
        }

        return _args;
    }

    return args;
}

/**
 * @param {Object} options
 * @param {number} options.fps
 * @param {string} options.args ffmpeg args.
 *      (Not set -i option and destination file in args option. it's specified in Deream)
 *      Ignore other all options ignored when args specified.
 */
module.exports = function deream(options = {}) {
    const _options = Object.assign({
        args: null,
        dest: null,
    }, options);

    if (options.args === null) {
        throw new Error('options.args must be specified');
    }

    if (options.dest === null) {
        throw new Error('options.args must be specified');
    }

    const specificArgs = parseArgs(_options.args);
    const args = ['-i', 'pipe:0', '-c:v', 'png_pipe', ...specificArgs, options.dest ? options.dest : 'pipe:1'];

    if (hasKey(_options.args, 'y')) {
        args.unshift('-y');
    }

    console.log(args.join` `);

    const ffmpeg = spawn('ffmpeg', args);
    ffmpeg.stderr.on('data', chunk => console.log(chunk.toString()));
    return duplexer(ffmpeg.stdin, ffmpeg.stdout);
};
