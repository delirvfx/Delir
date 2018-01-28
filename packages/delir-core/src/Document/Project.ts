import { Asset } from './Asset'
import { Clip } from './Clip'
import { Composition } from './Composition'
import { Layer } from './Layer'

export interface Project {
    formatVersion: string
    assets: Asset[]
    compositions: Composition[]
    layers: Layer[]
    clips: Clip[]
}
