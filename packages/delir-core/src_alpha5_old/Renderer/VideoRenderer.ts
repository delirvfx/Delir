import RendererBase from '../Engine/RendererBase'
import RendererContext from '../Engine/RendererContext'

interface Params {

}

export default class VideoRenderer extends RendererBase {
    public static provideParameters() {
        return
    }

    public async beforeRender(context: RendererContext) {
        context
    }

    public async render(context: RendererContext<Params>) {
        const source = context.getSourceBufferCanvas()

    }
}
