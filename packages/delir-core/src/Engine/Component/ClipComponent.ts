import { Clip } from '../../Document/Clip'
import { Component } from './Component'
import EffectComponent from './EffectComponent'

export default class ClipComponent implements Component<Clip> {
    public id: string
    public ref: Clip
    public effects: EffectComponent[]
    public renderer: any

    constructor(ref: Clip) {
        this.id = ref.id
        this.ref = ref
    }

    public async didActivate() { }
    public async didDeactivate() { }
}
