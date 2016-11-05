let AudioContext;

if (typeof window !== 'undefined') {
    AudioContext = window.AudioContext
} else if (typeof global !== 'undefined') {
    AudioContext = require('web-audio-api').AudioContext
}

console.log(AudioContext);
export default AudioContext
