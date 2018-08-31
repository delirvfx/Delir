import * as uuid from 'uuid'

import { Expression } from '../Values'
import Keyframe from './Keyframe'

export default class Effect {
    public id: string
    public processor: string
    public keyframes: {[keyName: string]: Keyframe[]} = Object.create(null)
    public expressions: {[keyName: string]: Expression} = Object.create(null)

    constructor() {
        this.id = uuid.v4()
    }
}
