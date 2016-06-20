webpack = require "webpack"
option  = require "./gulp.coffee"

module.exports =
    watchDelay  : 500

    output      :
        filename            : "[name].ts"
        sourceMapFilename   : "map/[file].map"
        publicPath          : "/js/"

    devtool     : "#source-map"

    target      : "atom"

    resolve     :
        root            : [
            "#{option.sourceDir}/renderer/scripts"
        ]
        extensions      : ["", ".js", ".ts"]
        modulesDirectories  : [
            "bower_components"
            "node_modules"
        ]
        alias               :
            bower   : "bower_components"

    module                  :
        loaders     : [
            {
                test: /\.jade$/,
                loader: "jade-loader",
            }
            {
                test: /\.styl$/,
                loader: "css-loader!stylus-loader",
            }
            {
                test: /\.ts$/,
                loader: "ts",
                exclude: /(node_modules|bower_components)/,
            }
        ]

    plugins         : [
        new webpack.ResolverPlugin(new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("package.json", [ "main" ]))
        new webpack.ResolverPlugin(new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", [ "main" ]))
        new webpack.optimize.AggressiveMergingPlugin
        new webpack.optimize.DedupePlugin
    ]
