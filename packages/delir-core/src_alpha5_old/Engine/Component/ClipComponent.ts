import { Clip } from '../../Document/Clip'
import { ClipRenderer } from '../ClipRenderer'
import { Component } from './Component'
import EffectComponent from './EffectComponent'

export default class ClipComponent implements Component<Clip> {
    public id: string
    public ref: Clip
    public effects: EffectComponent[]
    public renderer: ClipRenderer<any>

    constructor(ref: Clip) {
        this.id = ref.id
        this.ref = ref
    }

    public async activate() {
        this.renderer = this.ref.renderer
    }

    public async deactivate() { }
}
