import * as Delir from '@ragg/delir-core'
import { ProjectHelper, Values } from '@ragg/delir-core'
import { join } from 'path'

const assign = <T>(dest: T, ...sources: Partial<T>[]): T => Object.assign(dest as any, ...sources)

const fps = 30
const durationFrames = fps * 10
const project = new Delir.Entity.Project()

const movieAsset = assign(new Delir.Entity.Asset(), {
    name: 'Movie',
    fileType: 'mp4',
    path: join(process.cwd(), 'video.mp4'),
})

const audioAsset = assign(new Delir.Entity.Asset(), {
    name: 'Audio',
    fileType: 'mp3',
    path: join(process.cwd(), 'audio.mp3'),
})

const audioAsset2 = assign(new Delir.Entity.Asset(), {
    name: 'Audio',
    fileType: 'mp3',
    path: join(process.cwd(), 'audio.mp3'),
})

const imageAsset = assign(new Delir.Entity.Asset(), {
    name: 'Image',
    fileType: 'jpg',
    path: join(process.cwd(), 'image.jpg'),
})

; [movieAsset, audioAsset, audioAsset2, imageAsset].forEach(a => ProjectHelper.addAsset(project, a))

// Maser Composition
const c1 = assign(new Delir.Entity.Composition(), {
    name: 'Master Composition',
    width: 640,
    height: 360,
    framerate: fps,
    durationFrames,
    audioChannels: 2,
    samplingRate: 48000,
    backgroundColor: new Values.ColorRGB(0, 188, 255),
})

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
    name: 'video',
})

const movieClip = assign(new Delir.Entity.Clip(), {
    renderer: 'video',
    placedFrame: 0,
    durationFrames,
    keyframes: {
        source: [
            assign(new Delir.Entity.Keyframe(), {
                value: {assetId: movieAsset.id},
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
            assign(new Delir.Entity.Keyframe(), {value: {assetId: movieAsset.id}, frameOnClip: 0})
        ],
        loop: [
            assign(new Delir.Entity.Keyframe(), {value: true, frameOnClip: 0}),
        ],
        x: [
            assign(new Delir.Entity.Keyframe(), {value: 0, frameOnClip: 0, easeOutParam: [.4, .5]}),
            assign(new Delir.Entity.Keyframe(), {value: 300, frameOnClip: 600, easeInParam: [.6, .5]}),
        ],
    },
    expressions: {
        text: new Values.Expression('typescript', 'console.log(duration);\n`time:${time}\\nframe:${frame}`')
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
        ],
        x: [
            assign(new Delir.Entity.Keyframe(), {
                value: 0,
                frameOnClip: -10,
            }),
            assign(new Delir.Entity.Keyframe(), {
                value: 10,
                frameOnClip: 20,
            }),
            assign(new Delir.Entity.Keyframe(), {
                value: 40,
                frameOnClip: 100,
            }),
        ]
    }
})

ProjectHelper.addComposition(project, c1)
; [layer1, layer2, layer3, layer4].forEach(lane => ProjectHelper.addLayer(project, c1, lane))

ProjectHelper.addClip(project, layer1, imageClip)
ProjectHelper.addClip(project, layer2, audioClip)
ProjectHelper.addClip(project, layer3, movieClip)
ProjectHelper.addClip(project, layer4, textClip)

export const IMAGE_LAYER_INDEX = 0
export default project
