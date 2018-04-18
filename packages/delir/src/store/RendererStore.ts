import Delir, { Document } from '@ragg/delir-core'
import { Store } from '@ragg/fleur'

interface State {

}

class RendererStore extends Store<State> {
    public readonly renderer = new Delir()
    public state = {
        project: Delir.createProject()
    }

    constructor() {
        super()
        this.renderer.setProject(this.state.project)
    }

    public getEngine() {
        return this.renderer.engine
    }
}

export { RendererStore as default }
