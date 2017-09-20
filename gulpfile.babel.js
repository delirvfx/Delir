const g = require("gulp");
const $ = require("gulp-load-plugins")();
const rimraf = require("rimraf-promise");
const webpack = require("webpack");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const builder = require('electron-builder')
const nib = require('nib')
const notifier = require('node-notifier')

const os = require('os')
const fs = require("fs-promise");
const {join} = require("path");
const {spawn, spawnSync} = require("child_process");

const paths = {
    src         : {
        root        : join(__dirname, "./src/"),
        plugins     : join(__dirname, './src/post-effect-plugins'),
        browser     : join(__dirname, "./src/browser/"),
        renderer    : join(__dirname, "./src/frontend/"),
    },
    compiled    : {
        root        : join(__dirname, "./prepublish/"),
        plugins     : join(__dirname, './prepublish/plugins'),
        browser     : join(__dirname, "./prepublish/browser/"),
        frontend    : join(__dirname, "./prepublish/frontend/"),
    },
    build   : join(__dirname, "./prepublish/"),
    binary  : join(__dirname, "./release/"),
};

const isWindows = os.type() === 'Windows_NT'
const DELIR_ENV = process.env.DELIR_ENV

export function buildBrowserJs() {
    return g.src([join(paths.src.browser, "**/*.js")])
        .pipe($.plumber())
        .pipe($.changed(paths.compiled.browser))
        .pipe($.babel())
        .pipe(g.dest(paths.compiled.browser));
}

export async function copyPackageJSON(done) {
    const string = await fs.readFile("./package.json", {encoding: "utf8"});
    const json = JSON.parse(string);
    delete json.devDependencies;
    const newJson = JSON.stringify(json, null, "  ");

    try { await fs.mkdir(paths.compiled.root); } catch (e) {}
    try { await fs.writeFile(join(paths.compiled.root, "package.json"), newJson, {encoding: "utf8"}); } catch (e) {}

    done();
}

export async function symlinkDependencies(done) {
    const checkdep = (packageName, depList = []) => {
        try {
            let dep = require(join(__dirname, "node_modules", packageName, "package.json")).dependencies || {};
            let deps = Object.keys(dep);

            for (let dep of deps) {
                if (depList.indexOf(dep) === -1) {
                    console.log("dep: %s", dep);
                    depList.push(dep);
                    checkdep(dep, depList);
                }
            }
        } catch (e) { console.log(e); }
    };

    try {
        await rimraf(join(paths.compiled.root, "node_modules"));
    } catch (e) {
        console.log(e);
    };
    try {
        await fs.mkdir(join(paths.compiled.root, "node_modules"));
    } catch (e) {
        console.log(e);
    };

    const packageJson = require(join(paths.compiled.root, "package.json"));
    const dependencies = Object.keys(packageJson.dependencies);
    for (let dep of dependencies) {
        checkdep(dep, dependencies);
    }

    for (let dep of dependencies) {
        try {
            await fs.symlink(
                join(__dirname, "node_modules/", dep),
                join(paths.compiled.root, "node_modules/", dep),
                "dir"
            );
        } catch (e) { console.log(e); }
    }

    done();
}

export function compileRendererJs(done) {
    webpack({
        target: "electron",
        watch: DELIR_ENV === 'dev',
        context: paths.src.root,
        entry: {
            'frontend/main': ['./frontend/require-hook', './frontend/main'],
        },
        output: {
            filename: "[name].js",
            sourceMapFilename: "map/[file].map",
            path: paths.compiled.root,
        },
        devtool: DELIR_ENV === 'dev' ? "#source-map" : 'none',
        externals: [
            (ctx, request, callback) => {
                if (/^(?!\.\.?\/|\!\!?)/.test(request)) {
                    // throughs non relative requiring ('./module', '../module', '!!../module')
                    return callback(null, `require('${request}')`)
                }

                callback()
            },
        ],
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            modules: ["node_modules"],
            alias: {
                'delir-core': join(__dirname, 'src/delir-core/src/'),
            }
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
                                localIdentName: DELIR_ENV === 'dev'
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
            new webpack.DefinePlugin({__DEV__: JSON.stringify(DELIR_ENV === 'dev')}),
            new webpack.LoaderOptionsPlugin({
                test: /\.styl$/,
                stylus: {
                    default: {
                        use: [nib()],
                    }
                }
            }),
            ...(DELIR_ENV === 'dev' ? [] : [
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
        target: "electron",
        watch: DELIR_ENV === 'dev',
        context: paths.src.plugins,
        entry: {
            'chromakey/index': './chromakey/index',
            'the-world/index': './the-world/index',
            ...(DELIR_ENV === 'dev' ? {
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
        devtool: DELIR_ENV === 'dev' ? "#source-map" : 'none',
        externals: [
            (ctx, request: string, callback) => {
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
            new webpack.DefinePlugin({__DEV__: JSON.stringify(DELIR_ENV === 'dev')}),
            ...(DELIR_ENV === 'dev' ? [] : [
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
    return DELIR_ENV === 'dev' ?
        g.src(join(paths.src.root, 'experimental-plugins/*/package.json'))
            .pipe(g.dest(paths.compiled.plugins))
        : Promise.resolve()
}

export function compilePugTempates() {
    return g.src(join(paths.src.renderer, "**/[^_]*.pug"))
        .pipe($.plumber())
        .pipe($.pug())
        .pipe(g.dest(paths.compiled.frontend));
}

export function compileStyles() {
    return g.src(join(paths.src.renderer, "**/[^_]*.styl"))
        .pipe($.plumber())
        .pipe($.stylus({
            'include css': true,
            use : [require("nib")()]
        }))
        .pipe(g.dest(paths.compiled.frontend));
}

export function copyFonts() {
    return g.src(join(paths.src.renderer, "assets/fonts/*"))
        .pipe(g.dest(join(paths.compiled.frontend, "assets/fonts")));
}

export function copyImage() {
    return g.src(join(paths.src.renderer, "assets/images/**/*"), {since: g.lastRun('copyImage')})
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

export async function cleanBrowserScripts(done) {
    await rimraf(join(paths.compiled.browser, 'scripts'))
    done();
}

export function run(done) {
    const electron = spawn(require("electron"), [paths.compiled.root], {stdio:'inherit'});
    electron.on("close", (code) => { code === 0 && run(() => {}); });
    done()
}

export function watch() {
    g.watch(paths.src.browser, g.series(cleanBrowserScripts, buildBrowserJs))
    g.watch(join(paths.src.renderer, '**/*'), buildRendererWithoutJs)
    g.watch(join(paths.src.renderer, '**/*.styl'), compileStyles)
    g.watch(join(paths.src.root, '**/package.json'), g.parallel(copyPluginsPackageJson, copyExperimentalPluginsPackageJson))
    // g.watch(join(__dirname, 'src/navcodec'), g.parallel(compileNavcodecForElectron, compileNavcodec))
    g.watch(join(__dirname, 'node_modules'), symlinkDependencies)
}

const buildRendererWithoutJs = g.parallel(compilePugTempates, compileStyles, copyFonts, copyImage);
const buildRenderer = g.parallel(g.series(compileRendererJs, g.parallel(compilePlugins, copyPluginsPackageJson, copyExperimentalPluginsPackageJson)), compilePugTempates, compileStyles, copyFonts, copyImage);
const buildBrowser = g.parallel(buildBrowserJs, g.series(copyPackageJSON, symlinkDependencies));
const build = g.series(buildRenderer, buildBrowser);
const buildAndWatch = g.series(clean, build, run, watch);
const publish = g.series(clean, build, makeIcon, pack);

// export function navcodecTest() {
//     g.watch(join(__dirname, 'src/navcodec'), compileNavcodec)
// }

export {publish, build};
export default buildAndWatch;
