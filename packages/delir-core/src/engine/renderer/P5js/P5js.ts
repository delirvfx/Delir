import * as VM from 'vm'
import P5Hooks from './P5Hooks'

import Type from '../../../plugin-support/type-descriptor'
import Expression from '../../../values/expression'
import PreRenderingRequest from '../../PreRenderingRequest'
import RenderingRequest from '../../RenderRequest'
import { IRenderer } from '../renderer-base'

interface SketchRendererParams {
    sketch: Expression
}

export default class P5jsRenderer implements IRenderer<SketchRendererParams>
{
    public static get rendererId(): string { return 'p5js' }

    public static provideAssetAssignMap() {
        return {}
    }

    public static provideParameters()
    {
        return Type.code('sketch', {
            label: 'Sketch',
            langType: 'javascript',
            defaultValue: new Expression('javascript', 'function setup() {\n    \n}\n\nfunction draw() {\n    \n}\n')
        })
    }

    private vmGlobal: any
    private vmScope: any
    private p5ex: P5Hooks
    private canvas: HTMLCanvasElement

    public async beforeRender(req: PreRenderingRequest<SketchRendererParams>)
    {
        this.p5ex = new P5Hooks(req.resolver)

        // Make VM environment
        this.vmScope = this.makeVmScopeVariables(req)

        this.vmGlobal = VM.createContext(new Proxy({
            console: global.console,
            p5: this.p5ex.p5
        }, {
            get: (target: any, propKey) => {
                if (target[propKey]) {
                    return target[propKey]
                } else if (this.p5ex.p5[propKey]) {
                    // Expose p5 drawing methods
                    return typeof this.p5ex.p5[propKey] === 'function' ? this.p5ex.p5[propKey].bind(this.p5ex.p5) : this.p5ex.p5[propKey]
                } else {
                    // Dynamic exposing
                    return this.vmScope[propKey]
                }
            }
        }))

        const vm = new VM.Script(req.parameters.sketch.code, {})

        // Make VM scope binded sketch object
        vm.runInContext(this.vmGlobal)

        this.canvas = this.p5ex.p5.canvas
        this.p5ex.p5.createCanvas(req.width, req.height)

        if (typeof this.vmGlobal.setup === 'function') {
            this.vmGlobal.setup()
        }
    }

    public async render(req: RenderingRequest<SketchRendererParams>)
    {
        await new Promise(resolve => {
            const intervalId = setInterval(() => {
                if (this.p5ex.preloadCount === 0) {
                    resolve()
                    clearInterval(intervalId)
                }
             })
        })

        this.vmScope = this.makeVmScopeVariables(req)
        this.vmGlobal.draw && this.vmGlobal.draw()
        req.destCanvas.getContext('2d')!.drawImage(this.canvas, 0, 0)
    }

    private makeVmScopeVariables(req: PreRenderingRequest<any> | RenderingRequest<any>)
    {
        return {
            delir: {
                ctx: {
                    width: req.width,
                    height: req.height,
                    framerate: req.framerate,
                    time: (req as RenderingRequest).time,
                    frame: (req as RenderingRequest).frame,
                    timeOnClip: (req as RenderingRequest).timeOnClip,
                    frameOnClip: (req as RenderingRequest).frameOnClip,
                }
            }
        }
    }
}
