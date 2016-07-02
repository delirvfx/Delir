const g = require("gulp");
const $ = require("gulp-load-plugins")();
const rimraf = require("rimraf-promise");
const webpack = require("webpack");
const packager = require("electron-packager");

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
            let dep = require(join(__dirname, "node_modules", packageName, "package.json")).dependencies;
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

    try { await fs.mkdir(join(paths.compiled.root, "node_modules")); } catch (e) {};

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
        entry: {
            main: "main"
        },
        output: {
            filename: "[name].js",
            sourceMapFilename: "map/[file].map",
            path: join(paths.compiled.renderer, "scripts/"),
        },
        devtool: "#source-map",
        resolve: {
            root: [join(paths.src.renderer, "scripts/")],
            modulesDirectories: ["bower_components", "node_modules"]
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
            use : [require("nib")()]
        }))
        .pipe(g.dest(paths.compiled.renderer));
}

export function copyFonts() {
    return g.src(join(paths.src.renderer, "fonts/*"))
        .pipe(g.dest(join(paths.compiled.renderer, "fonts")));
}

export function copyImage() {
    return g.src(join(paths.src.renderer, "images/**.{png}"))
        .pipe(g.dest(join(paths.compiled.renderer, "images")));
}

export function pack(done) {
    const pjson = require("./package.json");
    packager({
        "dir"       : paths.compiled.root,
        "name"      : pjson.name,
        "platform"  : ["win32", "darwin"],
        "arch"      : "x64",
        "version"   : "1.2.5",

        "out"       : paths.binary,
        "icon"      : null,
        "app-bundle-id"     : null,
        "app-version"       : pjson.version,
        "helper-bundle-id"  : null,
        ignore      : null,
        prune       : true,
        overwrite   : true,
        asar        : true,
        "sign"      : null,

        "version-string": {
            CompanyName         : pjson.author,
            LegalCopyright      : null,
            FileDescription     : null,
            OriginalFilename    : null,
            FileVersion         : pjson.version,
            ProductVersion      : pjson.version,
            ProductName         : pjson.productName,
            InternalName        : null,
        }
    }, done);
}

export async function clean(done) {
    await rimraf(paths.compiled.root)

    if (fs.existsSync(join(paths.compiled.root, "node_modules"))) {
        try { await fs.unlink(join(paths.compiled.root, "node_modules")); } catch (e) {}
    }

    done();
}

export function run(done) {
    console.log(require("electron-prebuilt"));
    const electron = spawn(require("electron-prebuilt"), [paths.compiled.root]);
    electron.on("close", (code) => { code === 0 && run(() => {}); });
    done();
}

export function watch() {
    g.watch(paths.src.browser, buildBrowserJs);
    g.watch(paths.src.renderer, buildRenderer)
}

const buildRenderer = g.parallel(compileRendererJs, compilePugTempates, compileStyles, copyFonts, copyImage);
const buildBrowser = g.parallel(buildBrowserJs, g.series(copyPackageJSON, symlinkDependencies));
const build = g.series(buildRenderer, buildBrowser);
const buildAndWatch = g.parallel(build, run, watch);
const publish = g.series(clean, build, pack);

export {publish, build};
export default buildAndWatch;
