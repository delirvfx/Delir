import { FluxStandardAction } from 'flux-standard-action'

import Emitter from './Emitter'

interface Events {
    dispatch: FluxStandardAction<any, any>
}

export default class Dispatcher extends Emitter<Events> {

}
