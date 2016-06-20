g       = require "gulp"
$       = do require "gulp-load-plugins"

fs      = require "fs"
path    = require "path"
{spawn, fork} = require("child_process")

throttle = (interval, fn) ->
  lastTime = Date.now() - interval

  return ->
    return if (lastTime + interval) >= Date.now()
    lastTime = Date.now()

    fn()
    return

once = (fn) ->
    executed = false
    return ->
        return if executed

        fn.apply null, arguments
        executed = true
        return

envRequireConfig = (file) ->
    exports = {}

    for env in ["common", BUILD_ENV]
        filePath = "./gulp_config/#{env}/#{file}"
        exports[k] = v for k, v of require(filePath) if fs.existsSync(filePath)

    return exports

# Use for renderer only
genPaths = (dir, ext, withinDirs = []) ->
    if (ext isnt null or ext isnt "") and ext[0] isnt "."
        ext = ".#{ext}"

    if dir isnt ""
        dir = "#{dir}/"

    return [
        "#{gulpOption.sourceDir}/renderer/#{dir}**/*#{ext}"
        "!#{gulpOption.sourceDir}/renderer/#{dir}**/_*#{ext}"
        "!#{gulpOption.sourceDir}/renderer/#{dir}_*/**"
    ].concat withinDirs


BUILD_ENV   = "dev"
gulpOption  = envRequireConfig "gulp.coffee"


#
# Script copy task for Electron
#
g.task "copy-browser-files", ->
    g.src [
        "src/**"
        "!src/renderer/**"
    ]
        .pipe $.changed(gulpOption.buildDir)
        .pipe g.dest(gulpOption.buildDir)

#
# Webpack Task
#
g.task "webpack", (cb) ->
    g.src genPaths("scripts", "{coffee,js,ts}")
        .pipe $.plumber()
        .pipe $.changed("#{gulpOption.buildDir}/renderer/js/")
        .pipe $.webpack(envRequireConfig("webpack.coffee"))
        .pipe g.dest("#{gulpOption.buildDir}/renderer/js/")

#
# JavaScript copy Task
#
g.task "vendor_js", ->
    g.src genPaths("vendor_js", ".js")
        .pipe $.plumber()
        .pipe $.changed("#{gulpOption.buildDir}/renderer/#{gulpOption.js.vendorJsDir}/")
        .pipe g.dest("#{gulpOption.buildDir}/renderer/#{gulpOption.js.vendorJsDir}/")

#
# Stylus Task
#
g.task "stylus", ->
    g.src genPaths("styl", ".styl")
        .pipe $.plumber()
        .pipe $.changed("#{gulpOption.buildDir}/renderer/css/")
        .pipe $.stylus(envRequireConfig("stylus.coffee"))
        .pipe g.dest("#{gulpOption.buildDir}/renderer/css/")

#
# Jade Task
#
g.task "jade", ->
    g.src genPaths("", "jade", ["!#{gulpOption.sourceDir}/coffee/**/*.jade"])
        .pipe $.plumber()
        .pipe $.changed("#{gulpOption.buildDir}/renderer/")
        .pipe $.jade()
        .pipe $.prettify()
        .pipe g.dest("#{gulpOption.buildDir}/renderer/")

#
# Image minify Task
#
g.task "images", ->
    g.src genPaths("img", "{png,jpg,jpeg,gif}")
        .pipe $.plumber()
        .pipe $.changed("#{gulpOption.buildDir}/renderer/img/")
        .pipe $.imagemin(envRequireConfig("imagemin.coffee"))
        .pipe g.dest("#{gulpOption.buildDir}/renderer/img/")

#
# Image minify Task
#
g.task "assets", ->
    g.src "#{gulpOption.sourceDir}/renderer/assets/"
        .pipe $.plumber()
        .pipe $.changed("#{gulpOption.buildDir}/renderer/assets/")
        .pipe g.dest("#{gulpOption.buildDir}/renderer/assets/")

#
# package.json copy Task
#
g.task "package-json", (cb) ->
    try
        string = fs.readFileSync "./package.json", {encoding: "utf8"}
        json = JSON.parse(string)

        delete json.devDependencies
        newString = JSON.stringify json, null, "  "

        try fs.mkdirSync(gulpOption.buildDir)
        try fs.writeFileSync path.join(gulpOption.sourceDir, "package.json"), newString, {encoding: "utf8"}
        try fs.writeFileSync path.join(gulpOption.buildDir, "package.json"), newString, {encoding: "utf8"}

    cb()
    return

#
# File watch Task
#
g.task "watch", ->
    rendererSrcRoot = "#{gulpOption.sourceDir}/renderer/"

    $.watch [
        "src/**"
        "!src/renderer/"
    ], ->
        g.start ["copy-browser-files"]

    $.watch [
        "#{rendererSrcRoot}/scripts/**/*"
    ], ->
        g.start ["webpack"]

    $.watch [
        "#{rendererSrcRoot}/vendor_js/**/*.js"
    ], ->
        g.start ["vendor_js"]

    $.watch [
        "#{rendererSrcRoot}/styl/**/*.styl"
    ], ->
        g.start ["stylus"]

    $.watch [
        "#{rendererSrcRoot}/**/*.jade"
        "!#{rendererSrcRoot}/scripts/**/*.jade"
    ], ->
        g.start ["jade"]

    $.watch [
        "package.json"
    ], ->
        g.start ["package-json"]

    $.watch [
        "#{rendererSrcRoot}/img/**/*.{png,jpg,jpeg,gif}"
    ], ->
        g.start ["images"]

    $.watch [
        "#{rendererSrcRoot}/assets/"
    ], ->
        g.start ["assets"]


g.task "packaging", (cb) ->
    pack = require "electron-packager"

    if fs.existsSync(gulpOption.buildDir + "node_modules")
        try fs.unlinkSync(gulpOption.buildDir + "node_modules")

    try fs.mkdirSync(gulpOption.buildDir + "node_modules")

    checkdep = (packageName, depList = []) =>
        try
            pdep = require(path.join(__dirname, "node_modules", packageName, "package.json")).dependencies
            deps = Object.keys(pdep)

            for dep in deps
                if depList.indexOf(dep) == -1
                    console.log "dep: %s", dep
                    depList.push dep
                    checkdep(dep, depList)
        return

    packageJson = require(path.join(gulpOption.buildDir, "package.json"))
    dependencies = Object.keys(packageJson.dependencies)
    dependencies.push("amdefine")
    for dep, version of packageJson.dependencies
        checkdep(dep, dependencies)

    # console.log dependencies
    for dep in dependencies
        try
            fs.symlinkSync(
                path.join(__dirname, "node_modules/", dep),
                path.join(gulpOption.buildDir, "node_modules/", dep),
                "dir"
            )

    pack envRequireConfig("electron.coffee"), cb

#
# build
#
g.task "production", (cb) ->
    BUILD_ENV = "production"
    gulpOption  = envRequireConfig "gulp.coffee"

    g.start ["build", "packaging"]

    return

#
# Gulpfile watcher
#
g.task "self-watch", ->
    proc    = null

    spawnChildren = ->
        proc.kill() if proc?
        proc = fork require.resolve("gulp/bin/gulp"), ["dev"], {silent: false}

    $.watch ["Gulpfile.coffee", "./gulp_config/**"], ->
        spawnChildren()

    spawnChildren()

#
# Electron startup task
#
g.task "electron-dev", do ->
    electron    = null
    restart     = null
    reload      = null

    options     = envRequireConfig("electron_connect.coffee")
    deferTime   = if fs.existsSync("#{gulpOption.buildDir}/package.json") then 1000 else 8000
    rendererDir = path.join(gulpOption.buildDir, "renderer/")

    setupElectron = once =>
        electron = require('electron-connect').server.create
            path    : gulpOption.buildDir
            useGlobalElectron : false

        restart = throttle options.browser.reloadThrottleMs, -> electron.restart "--dev"
        reload = throttle options.renderer.reloadThrottleMs, -> electron.reload()

        return

    return (cb) ->
        setupElectron()

        console.info "%s[task:electron-dev]%s Wait #{deferTime / 1000}sec for build-task complete%s", "\u001b[1;36m", "\u001b[0;36m", "\u001b[m"

        setTimeout ->
            electron.start("--dev")

            if options.browser.watch
                $.watch ["#{gulpOption.buildDir}**", "!#{rendererDir}**"], restart

            if options.renderer.watch
                $.watch ["#{rendererDir}**"], reload

            cb()
        , deferTime


#
# Define default
#
g.task "build", ["webpack", "stylus", "jade", "images", "copy-browser-files", "package-json", "assets"]
g.task "publish", ["production"]
g.task "dev", ["build", "watch"]
g.task "default", ["self-watch", "electron-dev"]
