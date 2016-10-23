// @flow
import Delir from '../../index'
import type RenderRequest from '../../renderer/render-request'

export default class REDLAYER extends Delir.PluginBase.CustomLayerPluginBase
{
    static pluginDidLoad()
    {
        console.log('🔥%c FIRE RED 🔥', 'color:#f00');
    }

    constructor()
    {
        super()
        this.img = document.createElement('img')
        this.img.src = 'https://yt3.ggpht.com/-YUfPDE5tpIs/AAAAAAAAAAI/AAAAAAAAAAA/xTvI7PCeoGg/s900-c-k-no-rj-c0xffffff/photo.jpg'
    }

    provideParameter()
    {
        return {}
    }

    async render(req: RenderRequest)
    {
        const canvas = req.destCanvas
        const ctx = canvas.getContext('2d')

        if (ctx == null) return
        // ctx.fillStyle = '#1647c3'
        // ctx.fillRect(0, 0, canvas.width, canvas.height)
        // ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(req.frameOnLayer * 8 * Math.PI / 180)
        ctx.drawImage(this.img, 0, 0, this.img.width / 4, this.img.height / 4)
    }
}
