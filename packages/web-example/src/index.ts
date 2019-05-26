import { Engine, Entity, Values } from '@delirvfx/core'
import { RenderingStatus } from '@delirvfx/core/typings/Engine/IRenderingStreamObserver'
import { throttle } from 'lodash-es'

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 640
    canvas.height = 360
    document.body.appendChild(canvas)

    const engine = new Engine.Engine()
    const project = new Entity.Project({})
    const asset = new Entity.Asset({
        name: 'Asset',
        path: 'https://cultofthepartyparrot.com/parrots/hd/boredparrot.gif',
        fileType: 'gif',
    })
    project.addAsset(asset)

    const comp = new Entity.Composition({
        name: 'Root',
        width: 640,
        height: 480,
        framerate: 30,
        samplingRate: 48000,
        audioChannels: 2,
        backgroundColor: new Values.ColorRGB(255, 255, 255),
        durationFrames: 100,
    })
    project.addComposition(comp)

    comp.addLayer(new Entity.Layer({ name: 'Layer' }))
    comp.layers[0].addClip(new Entity.Clip({ renderer: 'image', placedFrame: 0, durationFrames: 100 }))
    comp.layers[0].clips[0].addKeyframe(
        'source',
        new Entity.Keyframe({
            frameOnClip: 0,
            value: new Values.AssetPointer(asset.id),
        }),
    )

    comp.layers[0].clips[0].addKeyframe(
        'x',
        new Entity.Keyframe({
            frameOnClip: 0,
            value: 0,
        }),
    )

    comp.layers[0].clips[0].addKeyframe(
        'x',
        new Entity.Keyframe({
            frameOnClip: 100,
            value: 300,
        }),
    )

    comp.layers[0].clips[0].setExpression('x', new Values.Expression('javascript', 'Math.random() * currentValue'))

    // tslint:disable-next-line no-console
    const logger = throttle((status: RenderingStatus) => console.log(status), 2000)

    engine.setStreamObserver({
        onFrame(destCanvas, status) {
            canvas.getContext('2d').drawImage(destCanvas, 0, 0)
            logger(status)
        },
    })

    engine.setProject(project)
    // tslint:disable-next-line no-console
    console.log({ project })
    engine.renderSequencial(comp.id, { loop: true, realtime: true })
})
