import * as uuid from 'uuid'

export default class Effect {
    public id: string
    public processor: string

    constructor() {
        this.id = uuid.v4()
    }
}
