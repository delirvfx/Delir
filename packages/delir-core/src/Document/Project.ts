import { Asset } from './Asset'
import { Clip } from './Clip'
import { Composition } from './Composition'
import { Effect } from './Effect'
import { Layer } from './Layer'

export interface Project {
    formatVersion: string
    assets: Asset[]
    compositions: Composition[]
    layers: Layer[]
    clips: Clip[]
    effects: Effect[]
}
