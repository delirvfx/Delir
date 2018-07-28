import { Effect } from '../../Document/Effect'
import { Component } from './Component'

export default class EffectComponent implements Component<Effect> {
    public id: string
    public ref: Effect
    public processor: any

    constructor(ref: Effect) {
        this.id = ref.id
        this.ref = ref
    }

    public async activate() { }
    public async deactivate() { }
}
