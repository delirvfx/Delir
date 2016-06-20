path    = require "path"

module.exports =
    sourceDir   : path.join __dirname, "../../src/"
    buildDir    : path.join __dirname, "../../build/"
    publishDir  : path.join __dirname, "../../publish/"
    cacheDir    : path.join __dirname, "../../cache/"

    js          :
        vendorJsDir : "js/"
        uglify      : true
