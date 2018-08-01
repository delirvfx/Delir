import { ClipScheme } from './clip'

export interface LayerScheme {
    id: string | null
    config: {
        name: string | null
    }
    clips: ClipScheme[]
}
