import { Asset, Clip, Composition, Effect, Keyframe, Layer, Project } from './Entity'
import AssetPointer from './Values/AssetPointer'
import ColorRGB from './Values/ColorRGB'
import Expression from './Values/Expression'

import * as Exporter from './Exporter'

describe('Export', () => {
    let project: Project

    beforeEach(() => {
        project = Object.assign(new Project(), {
            assets: [ Object.assign(new Asset(), { id: 'uuid-asset' }) ],
            compositions: [
                Object.assign(new Composition(), {
                    id: 'uuid-composition',
                    backgroundColor: new ColorRGB(0, 0, 0),
                    layers: [
                        Object.assign(new Layer(), {
                            id: 'uuid-layer',
                            clips: [
                                Object.assign(new Clip(), {
                                    id: 'uuid-clip',
                                    keyframes: {
                                        param: [ Object.assign(new Keyframe(), {
                                            id: 'uuid-clip-kf-1',
                                            value: new ColorRGB(0, 0, 0)
                                        }) ],
                                    },
                                    expressions: {
                                        param: new Expression('javascript', '1'),
                                    },
                                    effects: [
                                        Object.assign(new Effect(), {
                                            id: 'uuid-effect',
                                            expressions: {
                                                param: new Expression('javascript', '1')
                                            },
                                            keyframes: {
                                                param: [ Object.assign(new Keyframe(), {
                                                    id: 'uuid-effect-kf-1',
                                                    value: new ColorRGB(0, 0, 0),
                                                }) ],
                                                param2: [ Object.assign(new Keyframe(), {
                                                    id: 'uuid-effect-kf-2',
                                                    value: new AssetPointer(),
                                                }) ],
                                            },
                                        }),
                                    ],
                                })
                            ],
                        }),
                    ],
                }),
            ],
        })
    })

    it('Should correct serialize / desrialize project', () => {
        const serialized = Exporter.serialize(project)
        expect(serialized).toMatchSnapshot()
        expect(Exporter.deserialize(serialized)).toEqual(project)
    })
})
