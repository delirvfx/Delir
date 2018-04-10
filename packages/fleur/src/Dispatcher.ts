import { FluxStandardAction } from 'flux-standard-action'

import { ActionIdentifier } from './Action'
import Emitter from './Emitter'

interface Events {
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
