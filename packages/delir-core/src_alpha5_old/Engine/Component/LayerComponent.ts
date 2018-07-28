import { Layer } from '../../Document/Layer'
import ClipComponent from './ClipComponent'
import { Component } from './Component'

export default class LayerComponent implements Component<Layer> {
    public id: string
    public ref: Layer
    public clips: ClipComponent[]

    constructor(ref: Layer) {
        this.id = ref.id
        this.ref = ref
    }

    public async activate() {}
    public async deactivate() {}
}
