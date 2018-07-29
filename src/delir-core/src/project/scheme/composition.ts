import {LayerScheme} from './layer'
import {ColorRgbJSON} from '../../values/color-rgb'

export interface CompositionConfigScheme {
    name: string,
    width: number,
    height: number,
    framerate: number,
    durationFrames: number,
    samplingRate: number,
    audioChannels: number,
    backgroundColor: ColorRgbJSON,
}

export interface CompositionScheme {
    id: string|null
    config: CompositionConfigScheme
    layers: LayerScheme[]
}
