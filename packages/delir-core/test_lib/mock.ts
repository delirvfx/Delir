import { Asset, Clip, Composition, Layer, Project } from '../src/Document'

export const mockProject = (prop: Partial<Project> = {}): Project => ({
    formatVersion: '20180128',
    assets: [],
    clips: [],
    compositions: [],
    layers: [],
    effects: [],
    ...prop,
})

export const mockAsset = (prop: Partial<Asset> = {}): Asset => ({
    id: '',
    name: 'MockedAsset',
    fileType: 'mock',
    path: '/fixtures/MockAsset.mock',
    ...prop,
})

export const mockComposition = (prop: Partial<Composition> = {}): Composition => ({
    id: '',
    name: 'Mocked composition',
    durationFrames: 10,
    framerate: 30,
    width: 100,
    height: 100,
    samplingRate: 48000,
    audioChannels: 2,
    backgroundColor: {
        red: 0,
        green: 0,
        blue: 0,
    },
    layers: [],
    ...prop,
})

export const mockLayer = (prop: Partial<Layer> = {}): Layer => ({
    id: '',
    name: 'Mocked layer',
    clips: [],
    ...prop,
})

export const mockClip = (prop: Partial<Clip> = {}): Clip => ({
    id: '',
    renderer: '',
    placedFrame: 10,
    durationFrames: 10,
    keyframes: {},
    effects: [],
    expressions: {},
    ...prop,
})
