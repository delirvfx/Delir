import {IRenderer} from '../renderer-base'
import Type from '../../../plugin-support/type-descriptor'
import Expression from '../../../values/expression'
import RenderingRequest from '../../pipeline/render-request'
import PreRenderingRequest from '../../pipeline/pre-rendering-request'

interface ScriptingRendererParam {
    code: Expression
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
            .code('process', {
                label: 'Code',
                langType: 'processing',
                defaultValue: '',
            })
    }

    public async beforeRender(params: PreRenderingRequest<ScriptingRendererParam>)
    {
        return
    }

    public async render(req: RenderingRequest<ScriptingRendererParam>)
    {
        console.log(req.parameters)
        return
    }
}
