import { Composition, Project } from '../src/Document'

export const mockNewProject = (prop: Partial<Project> = {}): Project => ({
    formatVersion: '20180128',
    assets: [],
    clips: [],
    compositions: [],
    layers: [],
    effects: [],
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
