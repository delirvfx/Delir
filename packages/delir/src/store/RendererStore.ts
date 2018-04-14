import DelirCore, { Document } from '@ragg/delir-core'
import { Store } from '@ragg/fleur'

interface State {

}

class RendererStore extends Store<State> {
    public readonly renderer = new DelirCore()
    public state: Document = {}

    constructor() {
        super()
        this.renderer.setProject({})

        console.log(this.renderer)
    }

    public getEngine() {
        return this.renderer.engine
    }
}

export { RendererStore as default }
