import { Asset, Clip, Composition, Effect, Keyframe, Layer, Project } from '../src/Entity'
import { safeAssign } from '../src/helper/safeAssign'
import { ColorRGB } from '../src/Values'

export const mockProject = (props: Partial<Project> = {}) => safeAssign(new Project({}), props)

export const mockAsset = (props: Partial<Asset> = {}) =>
    safeAssign(
        new Asset({
            name: 'mock.png',
            path: '/mocked/mock.png',
            fileType: 'png',
        }),
    )

export const mockComposition = (props: Partial<Composition> = {}) =>
    safeAssign(
        new Composition({
            name: 'mocked-composition',
            width: 100,
            height: 100,
            durationFrames: 100,
            framerate: 30,
            samplingRate: 48000,
            backgroundColor: new ColorRGB(0, 0, 0),
            audioChannels: 2,
        }),
        props,
    )

export const mockLayer = (props: Partial<Layer> = {}) => safeAssign(new Layer({ name: 'mocked-layer' }), props)

export const mockClip = (props: Partial<Clip> = {}) =>
    safeAssign(
        new Clip({
            renderer: 'video',
            durationFrames: 0,
            placedFrame: 0,
        }),
        props,
    )

export const mockEffect = (props: Partial<Effect> = {}) =>
    safeAssign(new Effect({ processor: 'mock', referenceName: null }), props)

export const mockKeyframe = (props: Partial<Keyframe> = {}) =>
    safeAssign(new Keyframe({ frameOnClip: 0, value: null }), props)
