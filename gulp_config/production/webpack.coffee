webpack     = require "webpack"

module.exports =
    plugins         : [
        new webpack.ResolverPlugin(new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("package.json", [ "main" ]))
        new webpack.ResolverPlugin(new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", [ "main" ]))
        new webpack.ResolverPlugin(new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("component.json", [ "main" ]))
        new webpack.optimize.AggressiveMergingPlugin
        new webpack.optimize.DedupePlugin
        new webpack.optimize.UglifyJsPlugin
    ]
