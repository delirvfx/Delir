import fs from 'fs'
import {spawn} from 'child_process'
import canvasToBuffer from 'electron-canvas-to-buffer'
import navcodec from 'navcodec'

import React from 'react'
import ReactDOM from 'react-dom'

import devtron from 'devtron'
import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer'

import AppComponent from './components/app'
import store from './store'

import Delir from 'delir-core'
import {join} from 'path';

window.addEventListener('DOMContentLoaded', async () => {
    devtron.install()
    await installExtension(REACT_DEVELOPER_TOOLS)

    const plugreg = new Delir.Services.PluginRegistory()
    let result = await plugreg.loadPackageDir(join(process.cwd(), 'src/delir-core/src/plugins'))
    console.log(result)

    window.app = {store}
    store.pluginRegistry = plugreg
    store.renderer = new Delir.SessionRenderer({
        pluginRegistory: plugreg,
    })

    ReactDOM.render(
        React.createElement(AppComponent, {store}, []),
        document.querySelector('#root')
    )

    const audioCtx = new AudioContext()
    const canvas = document.querySelector('canvas')

    store.renderer.setDestinationCanvas(canvas)
    store.renderer.setDestinationAudioContext(audioCtx)
    store.renderer.render()

    console.log(navcodec)

    // const stream = await navcodec.openStream('navcodec.mp4')
    // const buffer = await stream.next()
    // const mediaInfo = await navcodec.open('navcodec.mp4')
    //
    // canvas.width = mediaInfo.width
    // canvas.height = mediaInfo.height

    console.time('in')

    // let encount4 = 0
    // console.info(mediaInfo.width * mediaInfo.height * 4, view.length);
    // for (let idx = 0, len = mediaInfo.width * mediaInfo.height * 4; idx < len; idx++) {
    //     // if (idx % 4 === 3) {
    //     //     imageData.data[idx] = 255;
    //     //     encount4++;
    //     //     // console.info('encount');
    //     //     continue;
    //     // }
    //
    //     imageData.data[idx] = srcView[idx];
    // }


    // imageData.data.set(buf)
    // ctx.putImageData(imageData, 0, 0)
    // console.info(imageData, mediaInfo.width, mediaInfo.height)
    // console.info(new ImageData(view, mediaInfo.width, mediaInfo.height));
    // ctx.putImageData(new ImageData(view, mediaInfo.width, mediaInfo.height), 0, 0, 0, 0, mediaInfo.width, mediaInfo.height);
    console.timeEnd('in')

    return ;

    // // Out to render
    // const srcView = new Uint8ClampedArray(buffer)
    // const buf = new ArrayBuffer(mediaInfo.width * mediaInfo.height * 4)
    // const view = new Uint8ClampedArray(buf)
    // const imageData = ctx.createImageData(mediaInfo.width, mediaInfo.height)
    //
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
