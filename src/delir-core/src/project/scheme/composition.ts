import {TimelaneScheme} from './timelane'

export interface CompositionScheme {
    id: string|null
    config: {
        [prop: string]: any
    }
    timelanes: TimelaneScheme[],
}
