import { Composition } from '../../Document/Composition'
import { Component } from './Component'
import LayerComponent from './LayerComponent'

export default class CompositionComponent implements Component<Composition> {
    public readonly id: string
    public readonly ref: Composition
    public layers: LayerComponent[]

    constructor(ref: Composition) {
        this.id = ref.id
        this.ref = ref
    }

    public async activate() {}
    public async deactivate() {}
}
