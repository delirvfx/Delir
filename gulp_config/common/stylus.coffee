# gulp-stylus Examples
# https://github.com/stevelacy/gulp-stylus#examples
nib         = require "nib"

module.exports =
    use         : [nib()]
    compress    : false
    sourcemap   :
        # inline      : true
        sourceRoot  : "css/"
