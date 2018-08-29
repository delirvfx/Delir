import * as Delir from '@ragg/delir-core'
import { ProjectHelper, Values } from '@ragg/delir-core'
import { join } from 'path'

const dirname = join(process.cwd(), 'packages/delir/utils/Dev/ExampleProject1')
const assign = <T>(dest: T, ...sources: Partial<T>[]): T => Object.assign(dest as any, ...sources)

const fps = 30
const durationFrames = fps * 10
const p = new Delir.Project.Project()

const videoAsset = assign(new Delir.Project.Asset(), {
    name: 'BigBuckBunny',
    fileType: 'mp4',
    path: join(dirname, 'big_buck_bunny.mp4'),
})

const audioAsset = assign(new Delir.Project.Asset(), {
    name: 'Audio',
    fileType: 'mp3',
    path: join(dirname, 'audio.mp3'),
})

const imageAsset = assign(new Delir.Project.Asset(), {
    name: 'Image',
    fileType: 'jpg',
    path: join(dirname, 'image.jpg'),
})

; [videoAsset, audioAsset, imageAsset].forEach(a => ProjectHelper.addAsset(p, a))

// Maser Composition
const composition = assign(new Delir.Project.Composition(), {
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

const layer1 = assign(new Delir.Project.Layer(), {
    name: 'Audio',
})

const layer2 = assign(new Delir.Project.Layer(), {
    name: '🔥 FIRE 🔥',
})

const layer3 = assign(new Delir.Project.Layer(), {
    name: 'NYAN = ^ . ^ = CAT',
})

const layer4 = assign(new Delir.Project.Layer(), {
    name: 'VERY CUTE 🐰-CHAN',
})
const layer5 = assign(new Delir.Project.Layer(), {
    name: 'GENERATIVE',
})

; [layer5, layer4, layer3, layer2, layer1].forEach(lane => {
    ProjectHelper.addLayer(p, composition, lane)
})

//
// Clips
//
const movieClip = assign(new Delir.Project.Clip(), {
    renderer: 'video',
    placedFrame: 0,
    durationFrames,
    keyframes: {
        source: [
            assign(new Delir.Project.Keyframe(), {
                value: {assetId: videoAsset.id},
                frameOnClip: 0,
            })
        ]
    }
})

const textClip = assign(new Delir.Project.Clip(), {
    renderer: 'text',
    placedFrame: 0,
    durationFrames,
    keyframes: {
        text: [
            assign(new Delir.Project.Keyframe(), {value: 'test', frameOnClip: 0})
        ],
        source: [
            assign(new Delir.Project.Keyframe(), {value: {assetId: videoAsset.id}, frameOnClip: 0})
        ],
        loop: [
            assign(new Delir.Project.Keyframe(), {value: true, frameOnClip: 0}),
        ],
        color: [
            assign(new Delir.Project.Keyframe(), { value: new Delir.Values.ColorRGBA(0, 0, 0, 1), frameOnClip: 0 })
        ],
        // x: [
        //     assign(new Delir.Project.Keyframe(), {value: 0, frameOnClip: 0, easeOutParam: [.4, .5]}),
        //     assign(new Delir.Project.Keyframe(), {value: 300, frameOnClip: 600, easeInParam: [.6, .5]}),
        // ],
        // y: [
        //     assign(new Delir.Project.Keyframe(), {value: 130, frameOnClip: 0, easeOutParam: [.4, .5]}),
        // ],
    },
    expressions: {
        text: new Values.Expression('typescript', '`time:${time}\\nframe:${frame}`')
    },
})

const audioClip = assign(new Delir.Project.Clip(), {
    // renderer: 'video'
    renderer: 'audio',
    placedFrame: 0,
    durationFrames,
    keyframes: {
        source: [
            assign(new Delir.Project.Keyframe(), {
                value: {assetId: audioAsset.id},
                frameOnClip: 0
            }),
        ]
    }
})

const imageClip = assign(new Delir.Project.Clip(), {
    renderer: 'image',
    placedFrame: 20,
    durationFrames,
    keyframes: {
        source: [
            assign(new Delir.Project.Keyframe(), {
                value: {assetId: imageAsset.id},
                frameOnClip: 0,
            })
        ]
    }
})

const adjustmentClip = assign(new Delir.Project.Clip(), {
    renderer: 'adjustment',
    placedFrame: 0,
    durationFrames: 30 * 10,
})

const videoClip = assign(new Delir.Project.Clip(), {
    renderer: 'video',
    placedFrame: 0,
    durationFrames: 30 * 10,
    keyframes: {
        source: [
            assign(new Delir.Project.Keyframe(), {
                value: { assetId: videoAsset.id },
                frameOnClip: 0,
            })
        ]
    }
})

const processingClip = assign(new Delir.Project.Clip(), {
    renderer: 'processing',
    placedFrame: 0,
    durationFrames: 30 * 10,
    keyframes: {
        sketch: [
            assign(new Delir.Project.Keyframe(), {
                frameOnClip: 0,
                value: `
float x = 300;
float y = 200;
int r = 180;
// PImage i;
void setup() {
    console.log(console);
    console.log(delir.ctx.width);
    // i = loadImage("test.jpg")
}

void draw(){
    // fill(0, 10);
    noStroke();
    // rect(0, 0, 600, 400);
    noFill();
    x = x + random(-2, 2);
    y = y + random(-2, 2);
    stroke(random(255), random(255), 255);
    ellipse(x, y, r, r);
    stroke(random(255), random(255), 255);
    ellipse(x - 100 + random(-2, 2), y - 100 + random(-2, 2), r + random(-2, 2), r + random(-2, 2));
    // image(i, 0, 0)
}
`
            })
        ]
    }
})

ProjectHelper.addClip(p, layer1, adjustmentClip)
ProjectHelper.addClip(p, layer2, textClip)
ProjectHelper.addClip(p, layer4, videoClip)
ProjectHelper.addClip(p, layer5, processingClip)

//
// Effects
//
// ProjectHelper.addEffect(p, adjustmentClip, assign(new Delir.Project.Effect(), {
//     processor: '@ragg/delir-posteffect-chromakey',
//     // keyframes: {
//     //     color: [
//     //         assign(new Delir.Project.Keyframe(), {
//     //             frameOnClip: 40,
//     //             value: new Delir.Values.ColorRGBA(30, 170, 200, 1),
//     //         }),
//     //         assign(new Delir.Project.Keyframe(), {
//     //             frameOnClip: 200,
//     //             value: new Delir.Values.ColorRGBA(200, 170, 30, 1),
//     //         }),
//     //     ]
//     // }
// }))

export default p
