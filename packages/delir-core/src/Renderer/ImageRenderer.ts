import RendererBase from '../Engine/RendererBase'
import RendererContext from '../Engine/RendererContext'

interface Params {

}

export default class ImageRenderer extends RendererBase {
    public async beforeRender(context: RendererContext) {

    }

    public async render(context: RendererContext<Params>) {
        const source = context.getSourceBufferCanvas()

    }
}
