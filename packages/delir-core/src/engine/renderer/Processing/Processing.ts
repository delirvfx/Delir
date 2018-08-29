import 'processing-js'
import * as VM from 'vm'

import Type from '../../../plugin-support/type-descriptor'
import { TypeDescriptor } from '../../../plugin-support/type-descriptor'
import PreRenderingRequest from '../../pipeline/pre-rendering-request'
import RenderingRequest from '../../pipeline/render-request'
import { IRenderer } from '../renderer-base'

import Asset from '../../../project/asset'

interface SketchRendererParams {
    sketch: string
}

export default class ProcessingRenderer implements IRenderer<SketchRendererParams>
{
    public static get rendererId(): string { return 'processing' }

    public static provideAssetAssignMap() {
        return {}
    }

    public static provideParameters()
    {
        return Type.code('sketch', {
            label: 'Sketch',
            langType: 'processing',
            defaultValue: `
                void setup() {

                }
                void draw() {

                }
            `
        })
    }

    private vmContext: any
    private vmScope: any
    private processing: any
    private canvas: HTMLCanvasElement

    public async beforeRender(req: PreRenderingRequest<SketchRendererParams>)
    {
        const compiledSketch = Processing.compile(req.parameters.sketch)

        // Make VM environment
        this.vmScope = this.makeVmScopeVariables(req)

        const vm = new VM.Script(compiledSketch.sourceCode, {})
        this.vmContext = VM.createContext(
            new Proxy({ console: global.console }, {
                get: (target: any, propKey) => {
                    if (target[propKey]) return target[propKey]
                    else return this.vmScope[propKey]
                }
            })
        )

        // Make VM scope binded sketch object
        const sketch = new Processing.Sketch(vm.runInContext(this.vmContext))
        const originalSetup = sketch.setup

        // Initialize canvas and Processing
        this.canvas = document.createElement('canvas')
        this.canvas.width = req.width
        this.canvas.height = req.height

        this.processing = new Processing(this.canvas, sketch)
        this.processing.size(req.width, req.height)
        this.processing.background(0, 0)
        this.processing.noLoop()
    }

    public async render(req: RenderingRequest<SketchRendererParams>)
    {
        this.vmScope = this.makeVmScopeVariables(req)
        this.processing.draw && this.processing.draw()
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
