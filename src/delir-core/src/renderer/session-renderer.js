// @flow

import Project from "../project/project"
import type PluginRegistory from '../services/plugin-registory'

export default class SessionRenderer {
    // plugins: PluginContainer

    pluginRegistory : PluginRegistory
    project: Project

    constructor({
        pluginRegistory
    } : {
        pluginRegistory: PluginRegistory
    }) {
        this.pluginRegistory = pluginRegistory

        if (typeof window !== 'undefined') {
            this.audioCtx = new AudioContext()
        } else {
            this.audioCtx = new (require('node-web-audio-api'))
        }

        this.audioBufferNode = this.audioCtx.createScriptProcessor(4096)
        this.audioBufferNode.onaudioprocess = (e) => {
            console.log(inputBuffer);
            e.outputBuffer = e.inputBuffer
        }
    }

    setProject(project: Project)
    {
        this.project = project
    }

    setDestinationCanvas(canvas)
    {
        this.destinationCanvas = canvas
    }

    setDestinationAudioNode(node)
    {
        this.destinationAudioNode = node
        this.audioBufferNode.connect(node)
    }

    setDestinationAudioContext(ctx)
    {
        this.destinationAudioCtx = ctx
        this.audioBufferNode = ctx.createScriptProcessor(4096)
        this.audioBufferNode.onaudioprocess = (e) => {
            // console.log(e.inputBuffer);

            const srcCh0 = e.inputBuffer.getChannelData(0)
            const srcCh1 = e.inputBuffer.getChannelData(1)

            const dstCh0 = e.outputBuffer.getChannelData(0)
            const dstCh1 = e.outputBuffer.getChannelData(1)

            for (let i = 4095; i; i--) {
                dstCh0[i] = srcCh0[i]
                dstCh1[i] = srcCh1[i]
            }
        }
    }

    render(doc: Project): Promise<void>
    {
        const v = document.createElement('video')
        v.src = document.querySelector('video').src
        v.play()

        const s = this.destinationAudioCtx.createMediaElementSource(v)
        s.connect(this.audioBufferNode)
        this.audioBufferNode.connect(this.destinationAudioCtx.destination)

        const render = () => {
            const ctx = this.destinationCanvas.getContext('2d')
            ctx.fillRect(0, 0, 640, 360)
            ctx.drawImage(v, 20, 0)
            requestAnimationFrame(render)
        }

        requestAnimationFrame(render)

        return new Promise(resolve => {

        })
    }
}
