const fs = require("fs");
const {spawn} = require("child_process");
const canvasToBuffer = require('electron-canvas-to-buffer');

window.addEventListener('DOMContentLoaded', async () => {
    const VIDEO_DURATION_SEC = 30;
    const OUTPUT_FRAMES = VIDEO_DURATION_SEC * 30;

    const cRand = () => ((Math.random() * 256) | 0).toString(16)

    const canvas = document.querySelector('#canvas');
    const ctx = canvas.getContext('2d');

    try { fs.unlinkSync('test.mp4'); } catch (e) {}

    const encoder = spawn('ffmpeg', `-i pipe:0 -r ${OUTPUT_FRAMES} -c:v mjpeg -c:v libx264 -r ${OUTPUT_FRAMES} -s 640x360 test.mp4`.split(' '));
    encoder.stderr.on('data', data => console.log(data.toString()));

    console.time('out');
    for (let i = 0; i < OUTPUT_FRAMES; i++) {
        ctx.fillStyle = '#' + [cRand(), cRand(), cRand()].join('');
        ctx.fillRect(0, 0, 640, 360);

        let buffer = canvasToBuffer(canvas, 'image/jpeg');
        encoder.stdin.write(buffer);
    }
    console.timeEnd('out');

    encoder.stdin.end();
    console.log('done');
});
