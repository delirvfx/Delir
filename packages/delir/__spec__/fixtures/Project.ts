import * as Delir from '@delirvfx/core'
import { Values } from '@delirvfx/core'
import { join } from 'path'

const assign = <T>(dest: T, ...sources: Partial<T>[]): T => Object.assign(dest as any, ...sources)

const fps = 30
const durationFrames = fps * 10
const project = new Delir.Entity.Project({})

const movieAsset = new Delir.Entity.Asset({
    name: 'Movie',
    fileType: 'mp4',
    path: join(process.cwd(), 'video.mp4'),
})

const audioAsset = new Delir.Entity.Asset({
    name: 'Audio',
    fileType: 'mp3',
    path: join(process.cwd(), 'audio.mp3'),
})

const audioAsset2 = new Delir.Entity.Asset({
    name: 'Audio',
    fileType: 'mp3',
    path: join(process.cwd(), 'audio.mp3'),
})

const imageAsset = new Delir.Entity.Asset({
    name: 'Image',
    fileType: 'jpg',
    path: join(process.cwd(), 'image.jpg'),
})

// Maser Composition
const c1 = new Delir.Entity.Composition({
    name: 'Master Composition',
    width: 640,
    height: 360,
    framerate: fps,
    durationFrames,
    audioChannels: 2,
    samplingRate: 48000,
    backgroundColor: new Values.ColorRGB(0, 188, 255),
})

const layer1 = new Delir.Entity.Layer({
    name: 'Audio',
})

const layer2 = new Delir.Entity.Layer({
    name: '🔥 FIRE 🔥',
})

const layer3 = new Delir.Entity.Layer({
    name: 'NYAN = ^ . ^ = CAT',
})

const layer4 = new Delir.Entity.Layer({
    name: 'video',
})

const movieClip = assign(
    new Delir.Entity.Clip({
        renderer: 'video',
        placedFrame: 0,
        durationFrames,
    }),
    {
        keyframes: {
            source: [
                new Delir.Entity.Keyframe({
                    value: { assetId: movieAsset.id },
                    frameOnClip: 0,
                }),
            ],
        },
    },
)

const textClip = assign(
    new Delir.Entity.Clip({
        renderer: 'text',
        placedFrame: 0,
        durationFrames,
    }),
    {
        keyframes: {
            text: [new Delir.Entity.Keyframe({ value: 'test', frameOnClip: 0 })],
            source: [
                new Delir.Entity.Keyframe({
                    value: { assetId: movieAsset.id },
                    frameOnClip: 0,
                }),
            ],
            loop: [new Delir.Entity.Keyframe({ value: true, frameOnClip: 0 })],
            x: [
                new Delir.Entity.Keyframe({
                    value: 0,
                    frameOnClip: 0,
                    easeOutParam: [0.4, 0.5],
                }),
                new Delir.Entity.Keyframe({
                    value: 300,
                    frameOnClip: 600,
                    easeInParam: [0.6, 0.5],
                }),
            ],
        },
        expressions: {
            text: new Values.Expression('typescript', 'console.log(duration);\n`time:${time}\\nframe:${frame}`'),
        },
    },
)

const audioClip = assign(
    new Delir.Entity.Clip({
        // renderer: 'video'
        renderer: 'audio',
        placedFrame: 0,
        durationFrames,
    }),
    {
        keyframes: {
            source: [
                new Delir.Entity.Keyframe({
                    value: { assetId: audioAsset.id },
                    frameOnClip: 0,
                }),
            ],
        },
    },
)

const imageClip = assign(
    new Delir.Entity.Clip({
        renderer: 'image',
        placedFrame: 20,
        durationFrames,
    }),
    {
        keyframes: {
            source: [
                new Delir.Entity.Keyframe({
                    value: { assetId: imageAsset.id },
                    frameOnClip: 0,
                }),
            ],
            x: [
                new Delir.Entity.Keyframe({
                    value: 0,
                    frameOnClip: -10,
                }),
                new Delir.Entity.Keyframe({
                    value: 10,
                    frameOnClip: 20,
                }),
                new Delir.Entity.Keyframe({
                    value: 40,
                    frameOnClip: 100,
                }),
            ],
        },
    },
)
;[movieAsset, audioAsset, audioAsset2, imageAsset].forEach(a => project.addAsset(a))
project.addComposition(c1)
;[layer1, layer2, layer3, layer4].forEach(layer => c1.addLayer(layer))

layer1.addClip(imageClip)
layer2.addClip(audioClip)
layer3.addClip(movieClip)
layer4.addClip(textClip)

export default project
