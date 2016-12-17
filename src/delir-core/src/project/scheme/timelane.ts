import {LayerScheme} from './layer'

export interface TimelaneScheme {
    id: string|null
    config: {
        name: string|null
    }
    layers: LayerScheme[]
}
