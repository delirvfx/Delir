let canvas;

if (typeof window !== 'undefined') {
    canvas = function Canvas() { return document.createElement('canvas') }
} else if (typeof global !== 'undefined') {
    canvas = require('canvas')
}

export default canvas
