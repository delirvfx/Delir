import {IRenderer} from '../renderer-base'
import Type from '../../../plugin-support/type-descriptor'
import Expression from '../../../values/expression'
import RenderingRequest from '../../pipeline/render-request'
import PreRenderingRequest from '../../pipeline/pre-rendering-request'
import * as VM from 'vm'

import 'processing-js'

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

    private vmCtx: VM.Context
    private p: ProcessingJS.Processing
    private canvas: HTMLCanvasElement

    public async beforeRender(req: PreRenderingRequest<ScriptingRendererParam>)
    {
        const sketch = Processing.compile(req.parameters.code)
        const vm = new VM.Script(sketch.sourceCode)

        this.vmCtx = VM.createContext(new Proxy({ console: window.console }, {
            get(target: any, propKey) {
                return target[propKey]
             }
        }))

        this.canvas = document.createElement('canvas')
        Object.assign(this.canvas, { width: req.width, height: req.height })

        this.p = new Processing(this.canvas, vm.runInContext(this.vmCtx))
        this.p.size(req.width, req.height)
        this.p.externals.sketch.options.isTransparent = true
        // this.p
        console.log(this.p)
        this.p.noLoop()
    }

    public async render(req: RenderingRequest<ScriptingRendererParam>)
    {
        this.p.draw && this.p.draw()
        req.destCanvas.getContext('2d')!.drawImage(this.canvas, 0, 0)
    }
}
