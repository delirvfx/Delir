import { FluxStandardAction } from 'flux-standard-action'

import { Action } from './Action'
import Emitter from './Emitter'

interface Events {
    dispatch: Action<any>
}

export default class Dispatcher {
    private emitter = new Emitter<Events>()

    public listen(listener: (action: Action<any>) => void) {
        this.emitter.on('dispatch', listener)
    }

    public dispatch(action: Action<any>) {
        this.emitter.emit('dispatch', action)
    }
}
