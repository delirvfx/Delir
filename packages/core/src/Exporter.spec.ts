import {
    mockAsset,
    mockClip,
    mockComposition,
    mockEffect,
    mockKeyframe,
    mockLayer,
    mockProject,
} from '@delirvfx/core-test-helper'
import { Asset, Clip, Composition, Effect, Keyframe, Layer, Project } from './Entity'
import AssetPointer from './Values/AssetPointer'
import ColorRGB from './Values/ColorRGB'
import Expression from './Values/Expression'

import { deserializeProject, serializeProject } from './Exporter'

describe('Export', () => {
    let project: Project

    beforeEach(() => {
        project = mockProject({
            assets: [mockAsset({ id: 'uuid-asset' as Asset.Id })],
            compositions: [
                mockComposition({
                    id: 'uuid-composition' as Composition.Id,
                    backgroundColor: new ColorRGB(0, 0, 0),
                    layers: [
                        mockLayer({
                            id: 'uuid-layer' as Layer.Id,
                            clips: [
                                mockClip({
                                    id: 'uuid-clip' as Clip.Id,
                                    renderer: 'video',
                                    durationFrames: 100,
                                    placedFrame: 0,
                                    keyframes: {
                                        param: [
                                            mockKeyframe({
                                                id: 'uuid-clip-kf-1' as Keyframe.Id,
                                                value: new ColorRGB(0, 0, 0),
                                            }),
                                        ],
                                    },
                                    expressions: {
                                        param: new Expression('javascript', '1'),
                                    },
                                    effects: [
                                        mockEffect({
                                            id: 'uuid-effect' as Effect.Id,
                                            expressions: {
                                                param: new Expression('javascript', '1'),
                                            },
                                            keyframes: {
                                                param: [
                                                    mockKeyframe({
                                                        id: 'uuid-effect-kf-1' as Keyframe.Id,
                                                        value: new ColorRGB(0, 0, 0),
                                                    }),
                                                ],
                                                param2: [
                                                    mockKeyframe({
                                                        id: 'uuid-effect-kf-2' as Keyframe.Id,
                                                        value: new AssetPointer('uuid-asset'),
                                                    }),
                                                ],
                                            },
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        })
    })

    it('Should correct serialize / desrialize project', () => {
        const serialized = serializeProject(project)
        expect(serialized).toMatchSnapshot()
        expect(deserializeProject(serialized)).toEqual(project)
    })
})
