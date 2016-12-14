import LayerScheme from './layer'

export interface TimelaneScheme {
    config: {
        name: string|null
    }
    layers: LayerScheme[]
}
