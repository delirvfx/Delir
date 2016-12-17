import {TimelaneScheme} from './timelane'
import {ColorRgbJSON} from '../../struct/color-rgb'

export interface CompositionScheme {
    id: string|null
    config: {
        [prop: string]: any
    }
    timelanes: TimelaneScheme[]
    backgroundColor: ColorRgbJSON
}
