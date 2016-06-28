const g = require("gulp");
const $ = require("gulp-load-plugins")();
const rimraf = require("rimraf-promise");
const webpack = require("webpack");

const fs = require("fs-promise");
const {join} = require("path");
const {spawn, fork} = require("child_process");

console.log(Object.keys($));

const paths = {
    src         : {
        root        : "./src/",
        browser     : "./src/browser/",
        renderer    : "./src/renderer/"
    },
    compiled    : {
        root        : "./prepublish/",
        browser     : "./prepublish/browser/",
        renderer    : "./prepublish/renderer/"
    },
    build   : "./prepublish/",
    binary  : "./release/",
};

export function buildBrowserJs() {
    return g.src([join(paths.src.browser)])
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
    try { await fs.writeFile(path.join(paths.src.root, "package.json"), newJson, {encoding: "utf8"}); } catch (e) {}
    try { await fs.writeFile(path.join(paths.compiled.root, "package.json"), newJson, {encoding: "utf8"}); } catch (undefined) {}

    done();
}

export function copyDependencies() {
    return g.src($.npmFiles(/* devDependencies */ false, ))
        .pipe(g.dest(".prepublish"));
}

export function compileStyles() {
    return g.src(join(paths.src.renderer, "**/[^_]*.styl"))
        .pipe($.stylus({
            use : [require("nib")]
        }))
        .pipe(g.dest(paths.compiled,renderer));
}

export function compileRendererJs(done) {
    webpack({
        target: "web",
        entry: {
            main: "main"
        },
        output: {
            filename: "[name].js",
            sourceMapFilename: "map/[file].map",
            path: join(paths.compiled, "js/"),
        },
        devtool: "#source-map",
        resolve: {
            root: [path.join(__dirname, "static/js/")],
            modulesDirectories: ["bower_components", "node_modules"]
        },
        externals: {
            "window": "window",
            "document": "document",
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: "babel-loader",
                    exclude: /(node_modules|bower_components)/,
                }
            ]
        },
        plugins: [
            new webpack.ResolverPlugin(new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("package.json", ["main"])),
            new webpack.ResolverPlugin(new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])),
            new webpack.optimize.AggressiveMergingPlugin,
            new webpack.optimize.DedupePlugin,
            new webpack.optimize.UglifyJsPlugin,
        ]
    },  function(err, stats) {
        if (err) {
            console.log(err);
        }

        done(err);
    });
}

export function watch() {
    g.watch(paths.src.browser, buildBrowserJs);
    g.watch(paths.src.renderer, buildRenderer)
}

export async function clean(done) {
    await rimraf(paths.compiled.src);
    done();
}

const build = g.parallel(buildBrowserJs, copyPackageJSON);
const buildAndWatch = g.parallel(buildBrowserJs, watch);
const publish = g.series(clean, build);

export default buildAndWatch;

// export default function () {
//     // g.task("build", ["webpack", "stylus", "jade", "images", "copy-browser-files", "package-json", "assets"]);
//     // g.task("publish", ["production"]);
//     // g.task("dev", ["build", "watch"]);
//     // g.task("default", ["self-watch", "electron-dev"]);
// }
