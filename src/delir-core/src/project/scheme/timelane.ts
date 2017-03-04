import {ClipScheme} from './clip'

export interface TimelaneScheme {
    id: string|null
    config: {
        name: string|null
    }
    clips: ClipScheme[]
}
