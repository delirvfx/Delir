// @flow
import type RenderRequest from '../../renderer/render-request'

import * as _ from 'lodash'
import {Type, LayerPluginBase} from '../../index'
import T from '../../plugin/type-descriptor'
import {Exceptions} from '../../exceptions/index'
import FontManager from 'font-manager'

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
        const families = _(fonts).map(desc => desc.family).unique().value()
        console.log(families);

        return Type
            .string('text', {
                label: 'Movie file',
                mimeTypes: ['movie/mp4'],
            })
            .enum('font', {
                label: 'Font family',
                selection: families
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

    async beforeRender(preRenderRequest: Object)
    {
    }

    async render(req: RenderRequest)
    {
        const {parameters: param} = req
        const ctx = req.destCanvas.getContext('2d')

        if (ctx == null) { return }
        console.log(param);
        ctx.fillStyle = '#fff'
        // ctx.font = `16px ${this.font}`
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
