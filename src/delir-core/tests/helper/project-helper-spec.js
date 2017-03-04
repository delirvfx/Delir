// @flow
import * as ProjectHelper from '../../src/helper/project-helper'

import Project from '../../src/project/project'
import Asset from '../../src/project/asset'
import Composition from '../../src/project/composition'
import Layer from '../../src/project/layer'
import Clip from '../../src/project/clip'
import Keyframe from '../../src/project/keyframe'

import ColorRGB from '../../src/struct/color-rgb'

const propNotWritable = (obj, prop) => {
    return Object.getOwnPropertyDescriptor(obj, prop).writable === false
}

describe('ProjectHelper specs', () => {
    let project: Project

    beforeEach(() => { project = new Project() })
    // afterEach(() => {　project = null　})

    describe('/ createAdd* /', () => {

        describe('::createAddAsset', () => {
            it('correcty make and add asset', () => {
                const props = {name: 'test', mimeType: 'text/plain', path: '/tmp/test'}
                const asset = ProjectHelper.createAddAsset(project, props)
                props.id = asset.id

                // must be returns instanceof Asset
                expect(asset).to.be.an(Asset)

                // must be assign .id property
                expect(asset.id).to.not.be.empty()

                // check correctry assigned given properties
                Object.keys(props).forEach(key => expect(asset[key]).to.eql(props[key]))

                // must be not writable `id` property
                expect(propNotWritable(asset, 'id')).to.be(true)

                // must be register symbolId in Project
                expect(project.symbolIds.has(asset.id)).to.be(true)
            })
        })

        describe('::createAddComposition', () => {
            it('correcty make and add Composition', () => {
                const props = {
                    name: 'test',
                    width: 100,
                    height: 100,
                    framerate: 30,
                    durationFrames: 30,
                    samplingRate: 48000,
                    audioChannels: 2,
                    backgroundColor: new ColorRGB(0, 0, 0),
                }

                const composition = ProjectHelper.createAddComposition(project, props)
                props.id = composition.id

                // must be returns instanceof Asset
                expect(composition).to.be.an(Composition)

                // must be assign .id property
                expect(composition.id).to.not.be.empty()

                // check correctry assigned given properties
                Object.keys(props).forEach(key => expect(composition[key]).to.eql(props[key]))

                // must be not writable `id` property
                expect(propNotWritable(composition, 'id')).to.be(true)

                // must be register symbolId in Project
                expect(project.symbolIds.has(composition.id)).to.be(true)
            })
        })

        describe('::createAddLayer', () => {
            it('correcty make and add Layer', () => {
                const props = {name: 'test'}
                const composition = new Composition
                const layer = ProjectHelper.createAddLayer(project, composition, props)
                props.id = layer.id

                // must be returns instanceof Asset
                expect(layer).to.be.an(Layer)

                // must be assign .id property
                expect(layer.id).to.not.be.empty()

                // check correctry assigned given properties
                Object.keys(props).forEach(key => expect(layer[key]).to.eql(props[key]))

                // must be not writable `id` property
                expect(propNotWritable(layer, 'id')).to.be(true)

                // must be added to target composition
                expect(composition.layers.has(layer)).to.be(true)

                // must be register symbolId in Project
                expect(project.symbolIds.has(layer.id)).to.be(true)
            })
        })

        describe('::createAddClip', () => {
            it('correcty make and add Clip', () => {
                const props = {renderer: 'test', placedFrame: 0, durationFrames: 100}
                const layer = new Layer
                const clip = ProjectHelper.createAddClip(project, layer, props)
                props.id = clip.id

                // must be returns instanceof Asset
                expect(clip).to.be.an(Clip)

                // must be assign .id property
                expect(clip.id).to.not.be.empty()

                // check correctry assigned given properties
                Object.keys(props).forEach(key => expect(clip[key]).to.eql(props[key]))

                // must be not writable `id` property
                expect(propNotWritable(clip, 'id')).to.be(true)

                // must be added to target layer
                expect(layer.clips.has(clip)).to.be(true)

                // must be register symbolId in Project
                expect(project.symbolIds.has(clip.id)).to.be(true)
            })
        })

        describe('::createAddKeyframe', () => {
            it('correcty make and add Keyframe', () => {
                const props = {value: 0, frameOnClip: 0, easeInParam: [1, 0], easeOutParam: [0, 1]}
                const clip = new Clip
                const keyframe = ProjectHelper.createAddKeyframe(project, clip, 'x', props)[0]
                props.id = keyframe.id

                // must be returns instanceof Asset
                expect(keyframe).to.be.an(Keyframe)

                // must be assign .id property
                expect(keyframe.id).to.not.be.empty()

                // check correctry assigned given properties
                Object.keys(props).forEach(key => expect(keyframe[key]).to.eql(props[key]))

                // must be not writable `id` property
                expect(propNotWritable(keyframe, 'id')).to.be(true)

                // must be added to target prop of clip
                expect(clip.keyframes.x.has(keyframe)).to.be(true)

                // must be register symbolId in Project
                expect(project.symbolIds.has(keyframe.id)).to.be(true)
            })

            it('correcty make and add Keyframe array', () => {
                const props = [
                    {value: 0, frameOnClip: 0, easeInParam: [1, 0], easeOutParam: [0, 1]},
                    {value: 10, frameOnClip: 10, easeInParam: [1, 0], easeOutParam: [0, 1]}
                ]
                const clip = new Clip
                const keyframes = ProjectHelper.createAddKeyframe(project, clip, 'x', props)
                expect(keyframes).to.be.an(Array)

                keyframes.forEach((keyframe, idx) => {
                    props[idx].id = keyframe.id

                    // must be returns instanceof Asset
                    expect(keyframe).to.be.an(Keyframe)

                    // must be assign .id property
                    expect(keyframe.id).to.not.be.empty()

                    // check correctry assigned given properties
                    Object.keys(props[idx]).forEach(key => expect(keyframe[key]).to.eql(props[idx][key]))

                    // must be not writable `id` property
                    expect(propNotWritable(keyframe, 'id')).to.be(true)

                    // must be added to target prop of clip
                    expect(clip.keyframes.x.has(keyframe)).to.be(true)

                    // must be register symbolId in Project
                    expect(project.symbolIds.has(keyframe.id)).to.be(true)
                })
            })
        })
    })
})
