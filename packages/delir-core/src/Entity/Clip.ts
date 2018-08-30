import * as uuid from 'uuid'

export default class Clip {
    public id: string
    public renderer: string
    public placedFrame: number
    public durationFrames: number

    constructor() {
        this.id = uuid.v4()
    }
}
