import {
    Type,
    TypeDescriptor,
    LayerPluginBase,
    PluginPreRenderRequest,
    RenderRequest,
} from 'delir-core'

import * as _ from 'lodash'
import * as Exceptions from '../../delir-core/src/exceptions/index'
import * as FontManager from 'font-manager'

export default class HTML5VideoLayer extends LayerPluginBase
{
    static async pluginDidLoad()
    {
        // ✋( ͡° ͜ʖ ͡°) インターフェースに誓って
        if (typeof window === 'undefined') {
            throw new Exceptions.PluginLoadFailException('this plugin only running on Electron')
        }
    }

    static provideParameters(): TypeDescriptor
    {
        const fonts = FontManager.getAvailableFontsSync()
        const families: string[] = (_(fonts).map(desc => desc.family) as any).unique().value()
        return Type
            .string('text', {
                label: 'Movie file',
            })
            .enum('font', {
                label: 'Font family',
                selection: families
            })
            .number('size', {
                label: 'Font size',
                animatable: true,
            })
            .number('x', {
                label: 'Position X',
                animatable: true,
            })
            .number('y', {
                label: 'Position Y',
                animatable: true,
            })
    }

    // onParameterChanged(newParam: Object, oldParam: Object)
    // {
    //     if (newParam.sourceFile !== oldParam.sourceFile) {
    //         this.video.src = newParam.sourceFile.path
    //     }
    // }

    async beforeRender(preRenderRequest: PluginPreRenderRequest)
    {
    }

    async render(req: RenderRequest)
    {
        const param = req.parameters as any
        const ctx = req.destCanvas.getContext('2d')!

        ctx.fillStyle = '#fff'
        ctx.font = `${param.fontSize}px ${param.font}`
        ctx.fillText(param.text, param.x, param.y)
    }

    //
    // Editor handling methods
    //

    // MEMO: キャッシュが必要な（例えば音声ファイルなど）パラメータの変更を検知するためのAPI
    // onDidParameterChanged(newParam, oldParam)
    // {
    //
    // }
}
