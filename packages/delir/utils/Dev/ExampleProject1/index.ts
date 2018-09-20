import * as Delir from '@ragg/delir-core'
import { ProjectHelper, Values } from '@ragg/delir-core'
import { join } from 'path'

const dirname = join(process.cwd(), 'packages/delir/utils/Dev/ExampleProject1')
const assign = <T>(dest: T, ...sources: Partial<T>[]): T => Object.assign(dest as any, ...sources)

const fps = 30
const durationFrames = fps * 10
const p = new Delir.Entity.Project()

const videoAsset = assign(new Delir.Entity.Asset(), {
    name: 'BigBuckBunny',
    fileType: 'mp4',
    path: join(dirname, 'big_buck_bunny.mp4'),
})

const audioAsset = assign(new Delir.Entity.Asset(), {
    name: 'Audio',
    fileType: 'mp3',
    path: join(dirname, 'audio.mp3'),
})

const imageAsset = assign(new Delir.Entity.Asset(), {
    name: 'Image',
    fileType: 'png',
    path: join(dirname, 'image.png'),
})

; [videoAsset, audioAsset, imageAsset].forEach(a => ProjectHelper.addAsset(p, a))

// Maser Composition
const composition = assign(new Delir.Entity.Composition(), {
    name: 'Master Composition',
    width: 640,
    height: 360,
    framerate: fps,
    durationFrames: durationFrames,
    audioChannels: 2,
    samplingRate: 48000,
    backgroundColor: new Values.ColorRGB(0, 188, 255),
})

ProjectHelper.addComposition(p, composition)

const layer1 = assign(new Delir.Entity.Layer(), {
    name: 'Audio',
})

const layer2 = assign(new Delir.Entity.Layer(), {
    name: '🔥 FIRE 🔥',
})

const layer3 = assign(new Delir.Entity.Layer(), {
    name: 'NYAN = ^ . ^ = CAT',
})

const layer4 = assign(new Delir.Entity.Layer(), {
    name: 'VERY CUTE 🐰-CHAN',
})
const layer5 = assign(new Delir.Entity.Layer(), {
    name: 'GENERATIVE',
})

; [layer5, layer4, layer3, layer2, layer1].forEach(lane => {
    ProjectHelper.addLayer(p, composition, lane)
})

//
// Clips
//
const movieClip = assign(new Delir.Entity.Clip(), {
    renderer: 'video',
    placedFrame: 0,
    durationFrames,
    keyframes: {
        source: [
            assign(new Delir.Entity.Keyframe(), {
                value: {assetId: videoAsset.id},
                frameOnClip: 0,
            })
        ]
    }
})

const textClip = assign(new Delir.Entity.Clip(), {
    renderer: 'text',
    placedFrame: 0,
    durationFrames,
    keyframes: {
        text: [
            assign(new Delir.Entity.Keyframe(), {value: 'test', frameOnClip: 0})
        ],
        source: [
            assign(new Delir.Entity.Keyframe(), {value: {assetId: videoAsset.id}, frameOnClip: 0})
        ],
        loop: [
            assign(new Delir.Entity.Keyframe(), {value: true, frameOnClip: 0}),
        ],
        color: [
            assign(new Delir.Entity.Keyframe(), { value: new Delir.Values.ColorRGBA(0, 0, 0, 1), frameOnClip: 0 })
        ],
        // x: [
        //     assign(new Delir.Entity.Keyframe(), {value: 0, frameOnClip: 0, easeOutParam: [.4, .5]}),
        //     assign(new Delir.Entity.Keyframe(), {value: 300, frameOnClip: 600, easeInParam: [.6, .5]}),
        // ],
        // y: [
        //     assign(new Delir.Entity.Keyframe(), {value: 130, frameOnClip: 0, easeOutParam: [.4, .5]}),
        // ],
    },
    expressions: {
        text: new Values.Expression('typescript', '`time:${thisComp.time}\\nframe:${thisComp.frame}`')
    },
})

const audioClip = assign(new Delir.Entity.Clip(), {
    // renderer: 'video'
    renderer: 'audio',
    placedFrame: 0,
    durationFrames,
    keyframes: {
        source: [
            assign(new Delir.Entity.Keyframe(), {
                value: {assetId: audioAsset.id},
                frameOnClip: 0
            }),
        ]
    }
})

const imageClip = assign(new Delir.Entity.Clip(), {
    renderer: 'image',
    placedFrame: 20,
    durationFrames,
    keyframes: {
        source: [
            assign(new Delir.Entity.Keyframe(), {
                value: {assetId: imageAsset.id},
                frameOnClip: 0,
            })
        ]
    }
})

const adjustmentClip = assign(new Delir.Entity.Clip(), {
    renderer: 'adjustment',
    placedFrame: 30,
    durationFrames: 30,
})

const p5jsClip = assign(new Delir.Entity.Clip(), {
    renderer: 'p5js',
    placedFrame: 0,
    durationFrames: 30 * 10,
    keyframes: {
        sketch: [
            assign(new Delir.Entity.Keyframe(), {
                frameOnClip: 0,
                value: new Delir.Values.Expression('javascript', `
// Link: https://p5js.org/examples/simulate-snowflakes.html
let snowflakes = []; // array to hold snowflake objects
let img

function setup() {
    // createCanvas(400, 600);
    // fill(240);
    noStroke();
    img = loadImage('delir:${imageAsset.id}')
}

function draw() {
    // background('brown');
    clear();
    image(img, 0, 0, img.width / 6, img.height / 6);
    let t = frameCount / 60; // update time

    // create a random number of snowflakes each frame
    for (var i = 0; i < random(5); i++) {
        snowflakes.push(new snowflake()); // append snowflake object
    }

    let color = thisClip.effect('Color').params.value
    fill(color.r, color.g, color.b, color.a)

    // loop through snowflakes with a for..of loop
    for (let flake of snowflakes) {
        flake.update(t); // update snowflake position
        flake.display(); // draw snowflake
    }
}

// snowflake class
function snowflake() {
    // initialize coordinates
    this.posX = 0;
    this.posY = random(-50, 0);
    this.initialangle = random(0, 2 * PI);
    this.size = random(2, 5);

    // radius of snowflake spiral
    // chosen so the snowflakes are uniformly spread out in area
    this.radius = sqrt(random(pow(width / 2, 2)));

    this.update = function(time) {
        // x position follows a circle
        let w = 0.6; // angular speed
        let angle = w * time + this.initialangle;
        this.posX = width / 2 + this.radius * sin(angle);

        // different size snowflakes fall at slightly different y speeds
        this.posY += pow(this.size, 0.5);

        // delete snowflake if past end of screen
        if (this.posY > height) {
            let index = snowflakes.indexOf(this);
            snowflakes.splice(index, 1);
        }
    };

    this.display = function() {
        ellipse(this.posX, this.posY, this.size);
    };
}
`)
            })
        ]
    }
})

const videoClip = assign(new Delir.Entity.Clip(), {
    renderer: 'video',
    placedFrame: 0,
    durationFrames: 30 * 10,
    keyframes: {
        source: [
            assign(new Delir.Entity.Keyframe(), {
                value: { assetId: videoAsset.id },
                frameOnClip: 0,
            })
        ],
        x: [
            assign(new Delir.Entity.Keyframe(), {
                value: 0,
                frameOnClip: 0,
                easeOutParam: [1, 0]
            }),
            assign(new Delir.Entity.Keyframe(), {
                value: 300,
                frameOnClip: 300,
                easeInParam: [1, 1],
            }),
        ]
    }
})

ProjectHelper.addClip(p, layer1, adjustmentClip)
ProjectHelper.addClip(p, layer2, textClip)
ProjectHelper.addClip(p, layer4, p5jsClip)
ProjectHelper.addClip(p, layer5, videoClip)

//
// Effects
//
ProjectHelper.addEffect(p, adjustmentClip, assign(new Delir.Entity.Effect(), {
    processor: '@ragg/delir-posteffect-gaussian-blur',
    // keyframes: {
    //     color: [
    //         assign(new Delir.Entity.Keyframe(), {
    //             frameOnClip: 40,
    //             value: new Delir.Values.ColorRGBA(30, 170, 200, 1),
    //         }),
    //         assign(new Delir.Entity.Keyframe(), {
    //             frameOnClip: 200,
    //             value: new Delir.Values.ColorRGBA(200, 170, 30, 1),
    //         }),
    //     ]
    // }
}))

ProjectHelper.addEffect(p, p5jsClip, assign(new Delir.Entity.Effect(), {
    processor: '@ragg/delir-posteffect-color-slider',
    referenceName: 'Color',
    keyframes: {
        value: [
            assign(new Delir.Entity.Keyframe(), {
                frameOnClip: 0,
                value: new Delir.Values.ColorRGBA(0, 0, 0, 255)
            }),
            assign(new Delir.Entity.Keyframe(), {
                frameOnClip: 150,
                value: new Delir.Values.ColorRGBA(255, 255, 255, 255)
            }),
        ]
    }
}))

export default p
