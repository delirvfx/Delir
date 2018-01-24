import {IRenderer} from '../renderer-base'
import Type from '../../../plugin-support/type-descriptor'
import Expression from '../../../values/expression'
import RenderingRequest from '../../pipeline/render-request'
import PreRenderingRequest from '../../pipeline/pre-rendering-request'
import * as VM from 'vm'

import 'processing-js'
import * as p5 from 'p5'
// import Processing from './DelirProcessing'
// import processingJSPatch from './processingJsPatch'

console.log(p5)

interface ScriptingRendererParam {
    langType: 'Processing.js'
    code: string
}

export default class ScriptingRenderer implements IRenderer<ScriptingRendererParam> {
    public static get rendererId(): string { return 'scripting' }

    public static provideAssetAssignMap() {
        return {}
    }

    public static provideParameters()
    {
        return Type
            .enum('langType', {
                label: 'Language',
                selection: ['Processing.js'],
                defaultValue: 'Processing.js',
            })
            .code('code', {
                label: 'Code',
                langType: 'processing',
                defaultValue: '',
            })
    }

    private vmContext: any
    private vmScope: any
    private p: ProcessingJS.Processing
    private canvas: HTMLCanvasElement

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

    public async beforeRender(req: PreRenderingRequest<ScriptingRendererParam>)
    {
        const compiled = Processing.compile(req.parameters.code)

        // Make VM environment
        this.vmScope = this.makeVmScopeVariables(req)

        const vm = new VM.Script(compiled.sourceCode, {})
        this.vmContext = VM.createContext(
            new Proxy({ console: window.console }, {
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
        Object.assign(this.canvas, { width: req.width, height: req.height })

        this.p = new Processing(this.canvas, sketch)

        this.p.size(req.width, req.height)
        this.p.background(0, 0)
        this.p.noLoop()

        console.log(this.p)
    }

    public async render(req: RenderingRequest<ScriptingRendererParam>)
    {
        this.vmScope = this.makeVmScopeVariables(req)
        this.p.draw && this.p.draw()
        req.destCanvas.getContext('2d')!.drawImage(this.canvas, 0, 0)
    }
}
