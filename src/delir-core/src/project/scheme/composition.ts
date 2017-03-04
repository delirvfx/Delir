import {LayerScheme} from './layer'
import {ColorRgbJSON} from '../../values/color-rgb'

export interface CompositionScheme {
    id: string|null
    config: {
        [prop: string]: any
    }
    layers: LayerScheme[]
    backgroundColor: ColorRgbJSON
}
