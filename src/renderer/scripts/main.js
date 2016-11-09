import fs from 'fs'
import {spawn} from 'child_process'
import canvasToBuffer from 'electron-canvas-to-buffer'
// import {remote} from 'electron'
// import navcodec from 'navcodec'

import React from 'react'
import ReactDOM from 'react-dom'

import devtron from 'devtron'
import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer'

import AppComponent from './views/app'

import dispatcher from './dispatcher'
import EditorStateActions from './actions/editor-state-actions'
import EditorStateStore from './stores/editor-state-store'

import Delir from 'delir-core'
console.log(Delir);
import {join} from 'path'

import RendererService from './services/renderer'
import BrowserProcessProxy from './services/browser-process-proxy'


if (typeof global !== 'undefined') {
    global.require('babel-register')
}

window.addEventListener('DOMContentLoaded', async () => {
    // install devtools
    devtron.install()
    await installExtension(REACT_DEVELOPER_TOOLS)

    // initialize app
    BrowserProcessProxy.initialize()
    await RendererService.initialize()

    window.app = {
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

    const p = app.project = new Delir.Project.Project()
    const a = new Delir.Project.Asset
    const c1 = new Delir.Project.Composition
    const c2 = new Delir.Project.Composition
    const c1_t1 = new Delir.Project.TimeLane
    const c1_t2 = new Delir.Project.TimeLane
    const c1_t3 = new Delir.Project.TimeLane
    const c1_t4 = new Delir.Project.TimeLane
    const c2_t1 = new Delir.Project.TimeLane
    const c1_t1_l1 = new Delir.Project.Layer
    const c1_t2_l1 = new Delir.Project.Layer
    const c1_t3_l1 = new Delir.Project.Layer
    const c1_t4_l1 = new Delir.Project.Layer
    const c2_t1_l1 = new Delir.Project.Layer
    const c2_t1_l2 = new Delir.Project.Layer
    const c2_t1_l3 = new Delir.Project.Layer

    a.name = 'シャロちゃん'
    a.mimeType = 'video/mp4'
    a.path = '/Users/ragg/Downloads/Cv-26hmVYAEBV0p.mp4'

    c1.name = 'Master Composition'
    c1.width = 640
    c1.height = 360
    c1.framerate = 30
    c1.durationFrame = 30 * 2
    c1.audioChannels = 2
    c1.samplingRate = 48000

    c1_t1.name = 'Audio'
    c1_t2.name = '🔥 FIRE 🔥'
    c1_t3.name = 'NYAN = ^ . ^ = CHENCAT'
    c1_t4.name = 'video'

    // c1_t1_l1.renderer = 'audio-layer'
    c1_t1_l1.renderer = 'html5-video-layer'
    c1_t1_l1.rendererOptions.source = a
    c1_t1_l1.rendererOptions.loop = true
    c1_t1_l1.placedFrame = 0
    c1_t1_l1.durationFrame = 30 * 10

    c1_t1_l1.keyframes.x = [
        Object.assign(new Delir.Project.Keyframe, {frameOnLayer: 0, value: 0}),
        Object.assign(new Delir.Project.Keyframe, {frameOnLayer: 60, value: 100}),
    ]
    c1_t1_l1.keyframes.y = [
        Object.assign(new Delir.Project.Keyframe, {frameOnLayer: 0, value: -300}),
    ]
    c1_t1_l1.keyframes.loop = [
        Object.assign(new Delir.Project.Keyframe, {frameOnLayer: 0, value: true}),
    ]

    // c1_t2_l1.renderer = 'html5-video-layer'
    c1_t2_l1.renderer = 'proton-layer'
    c1_t2_l1.placedFrame = 0
    c1_t2_l1.durationFrame = 30 * 10

    c1_t3_l1.renderer = 'red-layer'
    c1_t3_l1.placedFrame = 0
    c1_t3_l1.durationFrame = 30 * 10

    c1_t4_l1.renderer = 'html5-video-layer'
    c1_t4_l1.rendererOptions.source = 'file:///Users/ragg/workspace/delir/sample.mp4'
    c1_t4_l1.placedFrame = 0
    c1_t4_l1.durationFrame = 30 * 10

    p.assets.add(a)
    p.compositions.add(c1)

    c1.timelanes.add(c1_t1)
    c1.timelanes.add(c1_t2)
    c1.timelanes.add(c1_t3)
    c1.timelanes.add(c1_t4)

    c1_t1.layers.add(c1_t1_l1)
    // c1_t2.layers.add(c1_t2_l1)
    // c1_t3.layers.add(c1_t3_l1)
    // c1_t3.layers.add(c1_t4_l1)

    c2.name = 'Sub Composition'
    p.compositions.add(c2)

    c2.timelanes.add(c2_t1)
    c2_t1.layers.add(c2_t1_l1)
    c2_t1_l1.placedFrame = 20

    c2_t1.layers.add(c2_t1_l2)
    c2_t1_l2.placedFrame = 40

    c2_t1.layers.add(c2_t1_l3)
    c2_t1_l3.placedFrame = 100

    // c1_t1_l1.keyframes.add(new Delir.Project.Keyframe)

    ReactDOM.render(
        React.createElement(AppComponent, {}, []),
        document.querySelector('#root')
    )

    EditorStateActions.setActiveProject(p)

    console.log(document.querySelector('canvas'))
    RendererService.renderer.setDestinationCanvas(document.querySelector('canvas'))
    // RendererService.renderer.setDestinationAudioNode(audioContext.destination)

    //
    // delir-core rendering test
    //

    // const audioCtx = new AudioContext()
    // const canvas = document.querySelector('canvas')
    //
    // store.renderer.setDestinationCanvas(canvas)
    // store.renderer.setDestinationAudioContext(audioCtx)
    // store.renderer.render()
    //
    // console.log(navcodec)



    //
    // navcodec rendering test
    //
    // const stream = await navcodec.openStream('navcodec.mp4')
    // const mediaInfo = await navcodec.open('navcodec.mp4')
    //
    // const canvas = document.querySelector('canvas')
    // console.log(canvas);
    // const ctx = canvas.getContext('2d')
    // // document.body.appendChild(canvas)
    //
    // canvas.width = mediaInfo.width
    // canvas.height = mediaInfo.height
    //
    // console.time('in')
    //
    // // let frame = 0
    // // let lastUpdate = Date.now()
    // const render = async () => {
    //     console.time('in')
    //     let buffer = await stream.next()
    //     let srcView = new Uint8ClampedArray(buffer[0])
    //     // console.log(srcView);
    //     let imageData = ctx.createImageData(mediaInfo.width, mediaInfo.height)
    //     // console.dir(imageData);
    //
    //     // let encount4 = 0
    //     // console.info(mediaInfo.width * mediaInfo.height * 4, srcView.length);
    //     for (let idx = 0, len = Math.min(srcView.length, imageData.data.length); idx < len; idx++) {
    //         // if (idx % 4 === 3) {
    //         //     imageData.data[idx] = 255;
    //         //     encount4++;
    //         //     // console.info('encount');
    //         //     continue;
    //         // }
    //
    //         imageData.data[idx] = srcView[idx];
    //     }
    //
    //     ctx.putImageData(imageData, 0, 0)
    //     imageData = null
    //     srcView = null
    //     buffer = null
    //     console.timeEnd('in')
    //     // await new Promise(resolve => setTimeout(resolve, 1000))
    //     setTimeout(render, 1000/40)
    // }
    //
    // requestAnimationFrame(render)

    // imageData.data.set(buf)
    // console.log(srcView);
    // ctx.putImageData(imageData, 0, 0)
    // console.info(imageData, mediaInfo.width, mediaInfo.height)
    // console.info(new ImageData(view, mediaInfo.width, mediaInfo.height));
    // ctx.putImageData(new ImageData(view, mediaInfo.width, mediaInfo.height), 0, 0, 0, 0, mediaInfo.width, mediaInfo.height);
    // console.timeEnd('in')



    //
    // deream export rendering test
    //

    // const buf = new ArrayBuffer(mediaInfo.width * mediaInfo.height * 4)
    // const view = new Uint8ClampedArray(buf)
    //
    // const VIDEO_DURATION_SEC = 1
    // const OUTPUT_FRAMES = VIDEO_DURATION_SEC * 30
    //
    // const cRand = () => ((Math.random() * 256) | 0).toString(16)
    //
    // const canvas = document.querySelector('#canvas')
    // const ctx = canvas.getContext('2d')
    //
    // // try { fs.unlinkSync('test.mp4') } catch (e) {}
    //
    // // const encoder = spawn('ffmpeg', `-i pipe:0 -r ${OUTPUT_FRAMES} -c:v mjpeg -c:v libx264 -r ${OUTPUT_FRAMES} -s 640x360 test.mp4`.split(' '))
    // // encoder.stderr.on('data', data => console.log(data.toString()))
    //
    // // for (let i = 0; i < OUTPUT_FRAMES; i++) {
    // //     ctx.fillStyle = '#' + [cRand(), cRand(), cRand()].join('')
    // //     ctx.fillRect(0, 0, 640, 360)
    // //
    // //     let buffer = canvasToBuffer(canvas, 'image/jpeg')
    // //     encoder.stdin.write(buffer)
    // // }
    //
    // // encoder.stdin.end()
    // console.log('done')
});
