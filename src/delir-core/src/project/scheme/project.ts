import {AssetScheme} from './asset'
import {CompositionScheme} from './composition'

export interface ProjectScheme {
    formatVersion: string
    assets: AssetScheme[]
    compositions: CompositionScheme[]
}
