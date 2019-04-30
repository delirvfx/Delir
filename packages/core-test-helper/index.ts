import { Entity, Values } from '@ragg/delir-core'

const safeAssign = <T extends object>(dest: T, ...source: Partial<T>[]): T => {
    return Object.assign(dest, ...source)
}

type ReplaceFieldType<T, K extends keyof T, NewType> = { [KK in keyof T]: KK extends K ? NewType : T[KK] }
type LooseIdType<T extends { id: any }> = ReplaceFieldType<T, 'id', string>

export const mockProject = (props: Partial<Entity.Project> = {}) => safeAssign(new Entity.Project({}), props)

export const mockAsset = (props: Partial<LooseIdType<Entity.Asset>> = {}) =>
    safeAssign(
        new Entity.Asset({
            name: 'mock.png',
            path: '/mocked/mock.png',
            fileType: 'png',
        }),
        props as Partial<Entity.Asset>,
    )

export const mockComposition = (props: Partial<LooseIdType<Entity.Composition>> = {}) =>
    safeAssign(
        new Entity.Composition({
            name: 'mocked-composition',
            width: 100,
            height: 100,
            durationFrames: 100,
            framerate: 30,
            samplingRate: 48000,
            backgroundColor: new Values.ColorRGB(0, 0, 0),
            audioChannels: 2,
        }),
        props as Partial<Entity.Composition>,
    )

export const mockLayer = (props: Partial<LooseIdType<Entity.Layer>> = {}) =>
    safeAssign(new Entity.Layer({ name: 'mocked-layer' }), props as Partial<Entity.Layer>)

export const mockClip = (props: Partial<LooseIdType<Entity.Clip>> = {}) =>
    safeAssign(
        new Entity.Clip({
            renderer: 'video',
            durationFrames: 0,
            placedFrame: 0,
        }),
        props as Partial<Entity.Clip>,
    )

export const mockEffect = (props: Partial<LooseIdType<Entity.Effect>> = {}) =>
    safeAssign(new Entity.Effect({ processor: 'mock', referenceName: null }), props as Partial<Entity.Effect>)

export const mockKeyframe = (props: Partial<LooseIdType<Entity.Keyframe>> = {}) =>
    safeAssign(new Entity.Keyframe({ frameOnClip: 0, value: null }), props as Partial<Entity.Keyframe>)
