const g = require("gulp");
const $ = require("gulp-load-plugins")();
const rimraf = require("rimraf-promise");
const webpack = require("webpack");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const builder = require('electron-builder');
const nib = require('nib');
const notifier = require('node-notifier');

const os = require('os')
const fs = require("fs-promise");
const {join} = require("path");
const {spawn, spawnSync} = require("child_process");

const NATIVE_MODULES = ['font-manager'];

const paths = {
    src         : {
        root        : join(__dirname, "./packages/"),
        plugins     : join(__dirname, './packages/post-effect-plugins'),
        frontend    : join(__dirname, "./packages/delir/"),
    },
    compiled    : {
        root        : join(__dirname, "./prepublish/"),
        plugins     : join(__dirname, './prepublish/plugins'),
        frontend    : join(__dirname, "./prepublish/delir/"),
    },
    build   : join(__dirname, "./prepublish/"),
    binary  : join(__dirname, "./release/"),
};

const isWindows = os.type() === 'Windows_NT'
const __DEV__ = process.env.DELIR_ENV === 'dev'

export function buildBrowserJs() {
    return g.src([join(paths.src.frontend, "browser.js")])
        .pipe($.plumber())
        .pipe($.babel())
        .pipe(g.dest(paths.compiled.frontend));
}

export async function copyPackageJSON(done) {
    const string = await fs.readFile(join(paths.src.frontend, "package.json"), {encoding: "utf8"});
    const json = JSON.parse(string);
    delete json.devDependencies;
    const newJson = JSON.stringify(json, null, "  ");

    try { await fs.mkdir(paths.compiled.root); } catch (e) {}
    try { await fs.writeFile(join(paths.compiled.root, "package.json"), newJson, {encoding: "utf8"}); } catch (e) {}

    done();
}

export async function symlinkNativeModules(done) {
    const prepublishNodeModules = join(paths.compiled.root, "node_modules/")

    await rimraf(prepublishNodeModules);
    await fs.mkdir(prepublishNodeModules);

    for (let dep of NATIVE_MODULES) {
        try {
            if (dep.includes('/')) {
                const ns = dep.slice(0, dep.indexOf('/'))

                if (!(await fs.exists(join(prepublishNodeModules, ns)))) {
                    await fs.mkdir(join(prepublishNodeModules, ns))
                }
            }

            await fs.symlink(
                join(__dirname, "node_modules/", dep),
                join(prepublishNodeModules, dep),
                "dir"
            );
        } catch (e) { console.log(e); }
    }

    done();
}

export function compileRendererJs(done) {
    webpack({
        mode: __DEV__ ? 'development' : 'production',
        target: "electron-renderer",
        watch: __DEV__,
        context: paths.src.root,
        entry: {
            'delir/main': ['./delir/main'],
        },
        output: {
            filename: "[name].js",
            sourceMapFilename: "map/[file].map",
            path: paths.compiled.root,
        },
        devtool: __DEV__ ? "#source-map" : 'none',
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            modules: ["node_modules"],
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    loader: "babel-loader",
                    exclude: /node_modules/,
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    enforce: 'pre',
                    loader: 'tslint-loader',
                },
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules\//,
                    use: [
                        {loader: 'ts-loader', options: {
                            transpileOnly: true,
                        }},
                    ],
                },
                {
                    test: /\.styl$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                localIdentName: __DEV__
                                    ? '[path][name]__[local]--[emoji:4]'
                                    : '[local]--[hash:base64:5]',
                            },
                        },
                        {
                            loader: 'stylus-loader'
                        },
                    ],
                },
            ]
        },
        plugins: [
            new CleanWebpackPlugin([''], {verbose: true, root: paths.compiled.frontend}),
            new webpack.DefinePlugin({__DEV__: JSON.stringify(__DEV__)}),
            new webpack.LoaderOptionsPlugin({
                test: /\.styl$/,
                stylus: {
                    default: {
                        use: [nib()],
                    }
                }
            }),
            // preserve require() for native modules
            new webpack.ExternalsPlugin('commonjs', NATIVE_MODULES),
            new ForkTsCheckerWebpackPlugin({
                tsconfig: join(paths.src.frontend, 'tsconfig.json'),
            }),
            ...(__DEV__ ? [] : [
                new webpack.optimize.AggressiveMergingPlugin(),
                new UglifyJSPlugin(),
            ])
        ]
    },  function(err, stats) {
        err && console.error(err)
        stats.compilation.errors.length && stats.compilation.errors.forEach(e => {
            console.error(e.message)
            e.module && console.error(e.module.userRequest)
        });

        notifier.notify({title: 'Delir build', message: 'Renderer compiled', sound: true})
        console.log('Compiled')
        done()
    })
}

export async function compilePlugins(done) {
    webpack({
        mode: __DEV__ ? 'development' : 'production',
        target: "electron-renderer",
        watch: __DEV__,
        context: paths.src.plugins,
        entry: {
            'chromakey/index': './chromakey/index',
            'the-world/index': './the-world/index',
            ...(__DEV__ ? {
                'filler/index': '../experimental-plugins/filler/index',
                'mmd/index': '../experimental-plugins/mmd/index',
                // 'composition-layer/composition-layer': '../experimental-plugins/composition-layer/composition-layer',
                // 'plane/index': '../experimental-plugins/plane/index',
                // 'noise/index': '../experimental-plugins/noise/index',
            }: {})
        },
        output: {
            filename: "[name].js",
            path: paths.compiled.plugins,
            libraryTarget: 'commonjs-module',
        },
        devtool: __DEV__ ? "#source-map" : 'none',
        externals: [
            (ctx, request, callback) => {
                if (request !== 'delir-core') return callback()
                callback(null, `require('${request}')`)
                // if (/^(?!\.\.?\/|\!\!?)/.test(request)) {
                //     // throughs non relative requiring ('./module', '../module', '!!../module')
                //     return callback(null, `require('${request}')`)
                // }
            }
        ],
        resolve: {
            extensions: ['.js', '.ts'],
            modules: ["node_modules"],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules\//,
                    use: [
                        {loader: 'ts-loader', options: {
                            transpileOnly: true,
                        }},
                    ],
                },
                {
                    test: /\.(frag|vert)$/,
                    loader: 'raw-loader'
                },
            ]
        },
        plugins: [
            new CleanWebpackPlugin([''], {verbose: true, root: join(paths.compiled.root, 'plugins')}),
            new webpack.DefinePlugin({__DEV__: JSON.stringify(__DEV__)}),
            ...(__DEV__ ? [] : [
                new webpack.optimize.AggressiveMergingPlugin(),
                new UglifyJSPlugin(),
            ])
        ]
    },  function(err, stats) {
        err && console.error(err)
        stats.compilation.errors.length && stats.compilation.errors.forEach(e => {
            console.error('Plugin compilation: ', e.message)
            e.module && console.error(e.module.userRequest)
        });

        notifier.notify({title: 'Delir build', message: 'Plugin compiled', sound: true})
        console.log('Plugin compiled')
        done()
    })
}

export function copyPluginsPackageJson() {
    return g.src(join(paths.src.plugins, '*/package.json'), {base: join(paths.src.plugins)})
        .pipe(g.dest(paths.compiled.plugins));
}

export function copyExperimentalPluginsPackageJson() {
    return __DEV__ ?
        g.src(join(paths.src.root, 'experimental-plugins/*/package.json'))
            .pipe(g.dest(paths.compiled.plugins))
        : Promise.resolve()
}

export function compilePugTempates() {
    return g.src(join(paths.src.frontend, "**/[^_]*.pug"))
        .pipe($.plumber())
        .pipe($.pug())
        .pipe(g.dest(paths.compiled.frontend));
}

export function compileStyles() {
    return g.src(join(paths.src.frontend, "**/[^_]*.styl"))
        .pipe($.plumber())
        .pipe($.stylus({
            'include css': true,
            use : [require("nib")()]
        }))
        .pipe(g.dest(paths.compiled.frontend));
}

export function copyFonts() {
    return g.src(join(paths.src.frontend, "assets/fonts/*"))
        .pipe(g.dest(join(paths.compiled.frontend, "assets/fonts")));
}

export function copyImage() {
    return g.src(join(paths.src.frontend, "assets/images/**/*"), {since: g.lastRun('copyImage')})
        .pipe(g.dest(join(paths.compiled.frontend, "assets/images")));
}

export function makeIcon() {
    return new Promise((resolve, reject) => {
        const binName = isWindows ? 'electron-icon-maker.cmd' : 'electron-icon-maker'
        const binPath = join(__dirname, 'node_modules/.bin/', binName)
        const source = join(__dirname, 'build-assets/icon.png')

        const iconMaker = spawn(binPath, [`--input=${source}`, `--output=./build-assets`]);
        iconMaker
            .on('error', err => reject(err))
            .on('close', (code, signal) => code === 0 ? resolve() : reject(new Error(signal)))
    })
}

export async function pack(done) {
    const pjson = require("./package.json");
    const yarnBin = isWindows ? 'yarn.cmd' : 'yarn'

    await rimraf(join(paths.build, 'node_modules'))

    await new Promise((resolve, reject) => {
        spawn(yarnBin, ['install'], {cwd: paths.build})
            .on('error', err => reject(err))
            .on('close', (code, signal) => code === 0 ? resolve() : reject(new Error(signal)))
    })

    const targets = [
        ...(!isWindows ? [builder.Platform.MAC.createTarget()] : []),
        builder.Platform.WINDOWS.createTarget(),
        // ...builder.Platform.LINUX.createTarget(),
    ]

    for (const target of targets) {
        await builder.build({
            // targets: builder.Platform.MAC.createTarget(),
            targets: target,
            config: {
                appId: 'studio.delir',
                copyright: '© 2017 Ragg',
                productName: 'Delir',
                electronVersion: '1.7.3',
                asar: true,
                asarUnpack: ["node_modules/"],
                npmRebuild: true,
                // nodeGypRebuild: true,
                directories: {
                    app: paths.build,
                    output: paths.binary,
                },
                mac: {
                    target: 'zip',
                    type: "distribution",
                    category: "AudioVideo",
                    icon: join(__dirname, 'build-assets/icons/mac/icon.icns'),
                },
                win: {
                    target: 'zip',
                    icon: join(__dirname, 'build-assets/icons/win/icon.ico'),
                },
            },
        })
    }
}

export async function clean(done) {
    await rimraf(paths.compiled.root)

    if (fs.existsSync(join(paths.compiled.root, "node_modules"))) {
        try { await fs.unlink(join(paths.compiled.root, "node_modules")); } catch (e) {}
    }

    done();
}

export async function cleanRendererScripts(done) {
    await rimraf(join(paths.compiled.frontend, 'scripts'))
    done();
}

export function run(done) {
    const electron = spawn(require("electron"), [join(paths.compiled.frontend, 'browser.js')], {stdio:'inherit'});
    electron.on("close", (code) => { code === 0 && run(() => {}); });
    done()
}

export function watch() {
    g.watch(join(paths.src.frontend, 'browser.js'), buildBrowserJs)
    g.watch(join(paths.src.frontend, '**/*'), buildRendererWithoutJs)
    g.watch(join(paths.src.frontend, '**/*.styl'), compileStyles)
    g.watch(join(paths.src.root, '**/package.json'), g.parallel(copyPluginsPackageJson, copyExperimentalPluginsPackageJson))
    g.watch(join(__dirname, 'node_modules'), symlinkNativeModules)
}

const buildRendererWithoutJs = g.parallel(compilePugTempates, compileStyles, copyFonts, copyImage);
const buildRenderer = g.parallel(g.series(compileRendererJs, g.parallel(compilePlugins, copyPluginsPackageJson, copyExperimentalPluginsPackageJson)), compilePugTempates, compileStyles, copyFonts, copyImage);
const buildBrowser = g.parallel(buildBrowserJs, g.series(copyPackageJSON, symlinkNativeModules));
const build = g.series(buildRenderer, buildBrowser);
const buildAndWatch = g.series(clean, build, run, watch);
const publish = g.series(clean, build, makeIcon, pack);

export {publish, build};
export default buildAndWatch;
