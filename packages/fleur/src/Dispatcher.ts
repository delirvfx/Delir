import { ActionIdentifier } from './ActionIdentifier'
import Emitter from './Emitter'

export interface Events {
    dispatch: {
        type: ActionIdentifier<any>
        payload: any
    }
}

export default class Dispatcher {
    private emitter = new Emitter<Events>()

    public listen(listener: (action: Events['dispatch']) => void) {
        this.emitter.on('dispatch', listener)
    }

    public dispatch<P>(type: ActionIdentifier<P>, payload: P) {
        this.emitter.emit('dispatch', { type, payload })
    }
}
