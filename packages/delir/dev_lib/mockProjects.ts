import * as Delir from '@ragg/delir-core'

export const defaultProject = Object.assign(Delir.default.createProject(), {
    formatVersion: '1.0.0',
    compositions: [
        {
            id: 'mock-comp-1',
            audioChannels: 2,
            samplingRate: 48000,
            backgroundColor: { red: 255, green: 255, blue: 255 },
            framerate: 30,
            durationFrames: 60,
            width: 640,
            height: 360,
            name: 'Mock comp 1',
            layers: ['video-layer']
        }
    ],
    layers: [
        {
            id: 'mock-layer-1',
            name: 'Layer 1',
            clips: []
        }
    ],
    clips: [
        {
            id: 'mock-clip-1',
            renderer: '@delir/video-renderer',
            placedFrame: 0,
            durationFrames: 60,
            keyframes: {},
            expressions: {},
            effects: []
        }
    ],
    effects: [],
    assets: []
} as Delir.Document.Project)
