import {TimelaneScheme} from './timelane'
import {ColorRgbJSON} from '../../values/color-rgb'

export interface CompositionScheme {
    id: string|null
    config: {
        [prop: string]: any
    }
    timelanes: TimelaneScheme[]
    backgroundColor: ColorRgbJSON
}
