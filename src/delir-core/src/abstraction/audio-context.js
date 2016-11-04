let AudioContext;

if (typeof window !== 'undefined') {
    AudioContext = window.AudioConext
} else if (typeof global !== 'undefined') {
    AudioContext = require('web-audio-api').AudioContext
}

export default AudioContext
