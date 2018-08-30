import * as uuid from 'uuid'

import Clip from './Clip'

export default class Layer {
    public id: string
    public name: string
    public clips: Clip[]

    constructor() {
        this.id = uuid.v4()
    }
}
