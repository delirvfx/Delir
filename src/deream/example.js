const deream = require('./index');
const Canvas = require('canvas');

const streamIn = deream({
    args: {
        // ffmpeg options
        'y' : '',
        'c:v': 'libx264',
        'b:v': '1024k',
        'r:v': '30'
    },
    // path to destination file
    dest: 'dest.mp4',
});


const canvas = new Canvas(640, 360);
const context = canvas.getContext('2d');

// make 2seconds/30fps movie
for (let i = 0; i < 60; i++) {
    const frameHex = `00${i.toString(16)}`.slice(-2);
    context.fillStyle = ['#', frameHex, frameHex, frameHex].join('');
    context.fillRect(0, 0, 640, 360);

    // write PNG Buffer
    streamIn.write(canvas.toBuffer());
}

streamIn.end();
console.log('done');
