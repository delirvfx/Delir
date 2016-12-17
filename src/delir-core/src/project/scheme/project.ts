import {AssetScheme} from './asset'
import {CompositionScheme} from './composition'

export interface ProjectScheme {
    formatVersion: string
    symbolIds: string[]
    assets: AssetScheme[]
    compositions: CompositionScheme[]
}
