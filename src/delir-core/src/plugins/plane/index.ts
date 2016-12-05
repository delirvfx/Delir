// @flow
import {Type, LayerPluginBase} from '../../index'
import type PluginPreRenderRequest from '../../renderer/plugin-pre-rendering-request'
import type RenderRequest from '../../renderer/render-request'

export default class Plane extends LayerPluginBase
{
    static pluginDidLoad()
    {
    }

    constructor()
    {
        super()

        //use Euler integration calculation is more accurate (default false)
        // Proton.USE_CLOCK = false or true;
    }

    static provideParameters()
    {
        return Type
            .point2d('position', {
                label: 'Position (px)',
            })
            .size2d('size', {
                label: 'Size (px)',
            })
            .size2d('scale', {
                label: 'Scale',
            })
            .colorRgba('color', {
                label: 'Color',
            })
    }

    async beforeRender(req: PluginPreRenderRequest)
    {
        const canvas = this.buffer = document.createElement('canvas')
        canvas.width = req.width
        canvas.height = req.height
    }

    async render(req: RenderRequest)
    {
        const canvas = req.destCanvas
        const ctx = canvas.getContext('2d')
    }
}
