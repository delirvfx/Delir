import { Clip } from '../../Document/Clip'
import { IClipRenderer } from '../ClipRenderer'
import { Component } from './Component'
import EffectComponent from './EffectComponent'

export default class ClipComponent implements Component<Clip> {
    public id: string
    public ref: Clip
    public effects: EffectComponent[]
    public renderer: IClipRenderer<any>

    constructor(ref: Clip) {
        this.id = ref.id
        this.ref = ref
    }

    public async activate() {
        this.renderer = this.ref.renderer
    }

    public async deactivate() { }
}
