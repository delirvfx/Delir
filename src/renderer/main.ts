import * as React from 'react'
import * as ReactDOM from 'react-dom'

import * as devtron from 'devtron'
import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer'

import AppComponent from './views/app'

import dispatcher from './dispatcher'
import EditorStateActions from './actions/editor-state-actions'
import EditorStateStore from './stores/editor-state-store'

import Delir, {ProjectHelper} from '../../delir-core/src/index'
import {join} from 'path'

import RendererService from './services/renderer'
import BrowserProcessProxy from './services/browser-process-proxy'


if (typeof global !== 'undefined') {
    (global as any).require('babel-register')
}

// Hook require function for plugins
(() => {
    const Module = (global as any).module.constructor
    const _require = Module.prototype.require
    Module.prototype.require = function (module) {
        if (module === 'delir-core') {
            return Delir
        }

        return _require.call(this, module)
    }
})()

window.addEventListener('DOMContentLoaded', async () => {
    // install devtools
    devtron.install()
    await installExtension(REACT_DEVELOPER_TOOLS)

    // initialize app
    BrowserProcessProxy.initialize()
    await RendererService.initialize()

    ;(window as any).app = {
        stores: {EditorStateStore}
    }

    // const file = remote.dialog.showOpenDialog({
    //     title: 'Save as ...',
    //     defaultPath: '/Users/ragg/',
    //     buttonLabel: 'Save',
    //     filters: [
    //         {
    //             name: 'Delir Project File',
    //             extensions: ['delir']
    //         }
    //     ],
    //     properties: ['openFile']
    // })[0]
    //
    // console.log(file);
    //
    // const p = app.project = Delir.Project.Project.deserialize(fs.readFileSync(file))

    console.log(ProjectHelper.addLayer)

    const fps = 60
    const durationFrames = fps * 20
    const p = (window as any).app.project = new Delir.Project.Project()
    const a = new Delir.Project.Asset
    const a2 = new Delir.Project.Asset
    const c1 = new Delir.Project.Composition
    const c2 = new Delir.Project.Composition
    const c1_t1 = new Delir.Project.Timelane
    const c1_t2 = new Delir.Project.Timelane
    const c1_t3 = new Delir.Project.Timelane
    const c1_t4 = new Delir.Project.Timelane
    const c2_t1 = new Delir.Project.Timelane
    const c1_t1_l1 = new Delir.Project.Layer
    const c1_t2_l1 = new Delir.Project.Layer
    const c1_t3_l1 = new Delir.Project.Layer
    const c1_t4_l1 = new Delir.Project.Layer
    const c2_t1_l1 = new Delir.Project.Layer
    const c2_t1_l2 = new Delir.Project.Layer
    const c2_t1_l3 = new Delir.Project.Layer

    a.name = 'シャロちゃん'
    a.mimeType = 'video/mp4'
    a.path = '/Users/ragg/workspace/delir/sample.mp4'
    // a.path = '/Users/ragg/workspace/delir/navcodec.mp4'

    a2.name = 'Audio'
    a2.mimeType = 'audio/mp3'
    // a2.path = '/Users/ragg/workspace/delir/_deream_in.mp3'
    a2.path = '/Users/ragg/workspace/delir/deream_in.mp3'

    c1.name = 'Master Composition'
    c1.width = 640
    c1.height = 360
    c1.framerate = fps
    c1.durationFrames = durationFrames
    c1.audioChannels = 2
    c1.samplingRate = 48000

    c1_t1.name = 'Audio'
    c1_t2.name = '🔥 FIRE 🔥'
    c1_t3.name = 'NYAN = ^ . ^ = CHENCAT'
    c1_t4.name = 'video'

    // c1_t1_l1.renderer = 'audio-layer'
    c1_t1_l1.renderer = 'html5-video-layer'
    // c1_t1_l1.renderer = 'plane'
    c1_t1_l1.rendererOptions.source = a
    c1_t1_l1.rendererOptions.loop = true
    c1_t1_l1.placedFrame = 0
    c1_t1_l1.durationFrames = durationFrames

    // c1_t2_l1.renderer = 'html5-video-layer'
    c1_t2_l1.renderer = 'audio-layer'
    // c1_t2_l1.renderer = 'proton-layer'
    c1_t2_l1.rendererOptions.source = a2
    c1_t2_l1.placedFrame = 0
    c1_t2_l1.durationFrames = durationFrames

    c1_t3_l1.renderer = 'plane'
    c1_t3_l1.placedFrame = 0
    c1_t3_l1.durationFrames = 30 * 10

    c1_t4_l1.renderer = 'html5-video-layer'
    c1_t4_l1.rendererOptions.source = 'file:///Users/ragg/workspace/delir/sample.mp4'
    c1_t4_l1.placedFrame = 0
    c1_t4_l1.durationFrames = 30 * 10

    c2.name = 'Sub Composition'

    c2_t1_l1.placedFrame = 20
    c2_t1_l2.placedFrame = 40
    // c2_t1_l3.placedFrame = 100

    ProjectHelper.addAsset(p, a)
    ProjectHelper.addAsset(p, a2)
    ProjectHelper.addComposition(p, c1)

    ProjectHelper.addTimelane(p, c1, c1_t1)
    // ProjectHelper.addTimelane(p, c1, c1_t2)
    // ProjectHelper.addTimelane(p, c1, c1_t3)
    // ProjectHelper.addTimelane(p, c1, c1_t4)

    // console.log(ProjectHelper.addLayer())
    ProjectHelper.addLayer(p, c1_t1, c1_t1_l1)
    // ProjectHelper.addLayer(p, c1_t2, c1_t2_l1)
    // ProjectHelper.addLayer(p, c1_t3, c1_t3_l1)
    // ProjectHelper.addLayer(p, c1_t3, c1_t4_l1)

    // ProjectHelper.addKeyframe(p, c1_t1_l1, 'x', [
    //     Object.assign(new Delir.Project.Keyframe, {
    //         frameOnLayer: 0,
    //         value: 0,
    //         easeOutParam: [1, -0.03],
    //     }),
    //     Object.assign(new Delir.Project.Keyframe, {
    //         frameOnLayer: fps * 5,
    //         value: 900,
    //         easeInParam: [1, .09],
    //         easeOutParam: [1, -0.03],
    //     }),
    //     Object.assign(new Delir.Project.Keyframe, {
    //         frameOnLayer: durationFrames,
    //         value: 0,
    //         easeInParam: [1, .09],
    //     })
    // ])
    //
    // ProjectHelper.addKeyframe(p, c1_t1_l1, 'y', [
    //     Object.assign(new Delir.Project.Keyframe, {frameOnLayer: 0, value: -300})
    // ])
    //
    // ProjectHelper.addKeyframe(p, c1_t1_l1, 'loop', [
    //     Object.assign(new Delir.Project.Keyframe, {frameOnLayer: 0, value: true})
    // ])


    ProjectHelper.addComposition(p, c2)
    ProjectHelper.addTimelane(p, c2, c2_t1)
    // ProjectHelper.addLayer(p, c2_t1, c2_t1_l1)
    ProjectHelper.addLayer(p, c2_t1, c2_t1_l2)
    ProjectHelper.createAddEffect(p, c1_t1_l1, {
      processor: 'noise',
    })
    // ProjectHelper.addLayer(p, c2_t1, c2_t1_l3)
    // ProjectHelper.addKeyframe(p, c1_t1_l1, new Delir.Project.Keyframe)

    console.log(ProjectHelper.createAddEffect, p)

    ReactDOM.render(
        React.createElement(AppComponent as any, {}, []),
        document.querySelector('#root')
    )

    ;(document.querySelector('#loading') as HTMLElement).style.display = 'none'

    EditorStateActions.setActiveProject(p)

    console.log(document.querySelector('canvas'))
    RendererService.renderer.setDestinationCanvas(document.querySelector('canvas'))
    // RendererService.renderer.setDestinationAudioNode(audioContext.destination)
});
