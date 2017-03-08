const g = require("gulp");
const $ = require("gulp-load-plugins")();
const rimraf = require("rimraf-promise");
const webpack = require("webpack");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const builder = require('electron-builder')
const nib = require('nib')

const fs = require("fs-promise");
const {join} = require("path");
const {spawn} = require("child_process");

const paths = {
    src         : {
        root        : join(__dirname, "./src/"),
        browser     : join(__dirname, "./src/browser/"),
        renderer    : join(__dirname, "./src/renderer/"),
    },
    compiled    : {
        root        : join(__dirname, "./prepublish/"),
        browser     : join(__dirname, "./prepublish/browser/"),
        renderer    : join(__dirname, "./prepublish/renderer/"),
    },
    build   : join(__dirname, "./prepublish/"),
    binary  : join(__dirname, "./release/"),
};

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
            'renderer/main': './renderer/main',
        },
        output: {
            filename: "[name].js",
            sourceMapFilename: "map/[file].map",
            path: paths.compiled.root,
        },
        devtool: "#source-map",
        externals: [
            (ctx, request, callback) => {
                if (request === 'delir-core') {
                    // Ignore 'delir-core' requiring for plugins building
                    return callback()
                }

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
                    exclude: [join(__dirname, './src/plugins'), /node_modules|\.jsx?$/],
                    use: [
                        {loader: 'ts-loader', options: {
                            useBabel: true,
                            configFileName: join(__dirname, './tsconfig.json'),
                        }},
                    ],
                },
                {
                    // loader for Delir plugins
                    test: /\.tsx?$/,
                    include: [join(__dirname, './src/plugins')],
                    exclude: /node_modules|\.jsx?$/,
                    use: {
                        loader: 'awesome-typescript-loader',
                        options: {
                            configFileName: join(__dirname, './tsconfig.json'),
                            useBabel: true,
                        },
                    },
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
            new CleanWebpackPlugin([''], {verbose: true, root: paths.compiled.renderer}),
            new CleanWebpackPlugin([''], {verbose: true, root: join(paths.compiled.root, 'plugins')}),
            new webpack.DefinePlugin({__DEV__: JSON.stringify(DELIR_ENV === 'dev')}),
            new webpack.LoaderOptionsPlugin({
                test: /\.styl$/,
                stylus: {
                    default: {
                        use: [nib()],
                    }
                }
            }),
            new webpack.optimize.AggressiveMergingPlugin,
            ...(DELIR_ENV === 'dev' ? [] : [
                new webpack.optimize.UglifyJsPlugin,
            ])
        ]
    },  function(err, stats) {
        err && console.error(err)
        stats.compilation.errors.length && stats.compilation.errors.forEach(e => {
            console.error(e.message)
            e.module && console.error(e.module.userRequest)
        });
        console.log('Compiled')
        done()
    })
}

export function compilePlugins() {
    const project = $.typescript.createProject('tsconfig.json')

    return g.src(join(paths.src.root, 'plugins/**/*.ts'), {base: join(paths.src.root,　'src/')})
        .pipe($.plumber())
        .pipe(project())
        .js.pipe(g.dest(join(paths.compiled.root, 'plugins')))
}

export function copyPluginsPackageJson() {
    console.log(join(paths.compiled.root, 'plugins'));
    return g.src(join(paths.src.root, 'plugins/**/package.json'), {base: join(paths.src.root,　'src/')})
        .pipe(g.dest(join(paths.compiled.root, 'plugins')));
}

export function compilePugTempates() {
    return g.src(join(paths.src.renderer, "**/[^_]*.pug"))
        .pipe($.plumber())
        .pipe($.pug())
        .pipe(g.dest(paths.compiled.renderer));
}

export function compileStyles() {
    return g.src(join(paths.src.renderer, "**/[^_]*.styl"))
        .pipe($.plumber())
        .pipe($.stylus({
            'include css': true,
            use : [require("nib")()]
        }))
        .pipe(g.dest(paths.compiled.renderer));
}

export function copyFonts() {
    return g.src(join(paths.src.renderer, "fonts/*"))
        .pipe(g.dest(join(paths.compiled.renderer, "fonts")));
}

export function copyImage() {
    return g.src(join(paths.src.renderer, "images/*"))
        .pipe(g.dest(join(paths.compiled.renderer, "images")));
}

export async function pack(done) {
    const pjson = require("./package.json");

    await rimraf(join(paths.build, 'node_modules'))

    await new Promise((resolve, reject) => {
        spawn('yarn', ['install'], {cwd: paths.build}).on('close', code => code === 0 ? resolve() : reject())
    })

    const targets = new Map([
        ...builder.Platform.MAC.createTarget(),
        ...builder.Platform.WINDOWS.createTarget(),
        ...builder.Platform.LINUX.createTarget(),
    ])

    await builder.build({
        // targets: builder.Platform.MAC.createTarget(),
        targets,
        config: {
            appId: 'studio.delir',
            copyright: '© 2017 Ragg',
            productName: 'Delir',
            electronVersion: '1.6.1',
            asar: false,
            asarUnpack: ["node_modules/"],
            directories: {
                app: paths.build,
                output: paths.binary,
            },
        },
        mac: {
            target: 'default',
            type: "distribution",
            category: "AudioVideo",
        },
    })
}

export async function clean(done) {
    await rimraf(paths.compiled.root)

    if (fs.existsSync(join(paths.compiled.root, "node_modules"))) {
        try { await fs.unlink(join(paths.compiled.root, "node_modules")); } catch (e) {}
    }

    done();
}

export async function cleanRendererScripts(done) {
    await rimraf(join(paths.compiled.renderer, 'scripts'))
    done();
}

export async function cleanBrowserScripts(done) {
    await rimraf(join(paths.compiled.browser, 'scripts'))
    done();
}

export function run() {
    console.log('run');
    const electron = spawn(require("electron"), [paths.compiled.root], {stdio:'inherit'});
    electron.on("close", (code) => { code === 0 && run(() => {}); });
}

// export async function compileNavcodec() {
//     await new Promise(resolve => {
//         const compiler = spawn('npm', ['i', '../src/navcodec'], {
//             cwd: join(__dirname, 'test'),
//         });

//         compiler.on('close', code => {
//             console.log('npm install ending with %d', code)
//             resolve()
//         })
//     })

//     await new Promise(resolve => {
//         const testRun = spawn('node', ['index.js'], {
//             cwd: join(__dirname, 'test'),
//             stdio: 'inherit',
//         })

//         testRun.on('close', code => {
//             console.log('testRun ending with %d', code)
//             resolve()
//         })
//     })
// }

// export async function compileNavcodecForElectron() {
//     if (buildingElectron) {
//         return
//     }

//     buildingElectron = true

//     await new Promise(resolve => {
//         const compiler = spawn('npm', ['i', 'src/navcodec'], {
//             cwd: join(__dirname),
//         });

//         compiler.on('close', code => {
//             console.log('npm install for electron ending with %d', code);
//             resolve();
//         })
//     })

//     await new Promise(resolve => {
//         const rebuild = spawn('./node_modules/.bin/electron-rebuild', [], {
//             cwd: join(__dirname),
//         })
//         rebuild.on('close', code => {
//             console.log('electron-rebuild ending with %d', code)
//             buildingElectron = false
//             resolve()
//         })
//     })
// }

export function watch() {
    g.watch(paths.src.browser, g.series(cleanBrowserScripts, buildBrowserJs))
    g.watch(paths.src.renderer, buildRendererWithoutJs)
    g.watch(join(paths.src.renderer, 'styles'), compileStyles)
    g.watch(join(paths.src.root, 'plugins'), g.parallel(copyPluginsPackageJson, compilePlugins))
    // g.watch(join(__dirname, 'src/navcodec'), g.parallel(compileNavcodecForElectron, compileNavcodec))
    g.watch(join(__dirname, 'node_modules'), symlinkDependencies)
}

const buildRendererWithoutJs = g.parallel(compilePugTempates, compileStyles, copyFonts, copyImage);
const buildRenderer = g.parallel(g.series(compileRendererJs, g.parallel(compilePlugins, copyPluginsPackageJson)), compilePugTempates, compileStyles, copyFonts, copyImage);
const buildBrowser = g.parallel(buildBrowserJs, g.series(copyPackageJSON, symlinkDependencies));
const build = g.series(buildRenderer, buildBrowser);
const buildAndWatch = g.series(clean, build, run, watch);
const publish = g.series(clean, build, pack);

// export function navcodecTest() {
//     g.watch(join(__dirname, 'src/navcodec'), compileNavcodec)
// }

export {publish, build};
export default buildAndWatch;
