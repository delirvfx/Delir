import Delir, { Document } from '@ragg/delir-core'
import { Store } from '@ragg/fleur'

interface State {

}

class RendererStore extends Store<State> {
    public static storeName = 'RendererStore'

    public readonly renderer = new Delir()

    public state = {
        // project: Delir.createProject()
    }

    constructor() {
        super()
        // this.renderer.setProject(this.state.project)
        // this.renderer.project.addComposition({
        //     width: 640,
        //     height: 360,
        //     backgroundColor: { red: 255, green: 255, blue: 255 },
        //     durationFrames: 100,
        //     layers: [],
        //     name: 'Comp',
        //     framerate: 30,
        //     samplingRate: 10,
        //     audioChannels: 2,
        // })
    }

    public getEngine() {
        return this.renderer.engine
    }
}

export { RendererStore as default }
