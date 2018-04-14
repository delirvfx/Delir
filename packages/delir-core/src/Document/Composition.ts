export interface Composition {
    id: string
    name: string
    width: number
    height: number
    framerate: number
    durationFrames: number
    samplingRate: number
    audioChannels: number
    /** id of layers */
    layers: string[]
    backgroundColor: {
        red: number
        green: number
        blue: number
    }
}

// import * as _ from 'lodash'
// import * as uuid from 'uuid'
// import ColorRGB from '../values/color-rgb'
// import Project from './project'
// import Layer from './layer'

// import {CompositionScheme, CompositionConfigScheme} from './scheme/composition'

// import toJSON from '../helper/toJSON'

// export default class Composition
// {
//     static deserialize(compJson: CompositionScheme, project: Project)
//     {
//         const comp = new Composition()

//         const config: CompositionConfigScheme = _.pick(compJson.config, [
//             'name',
//             'width',
//             'height',
//             'framerate',
//             'durationFrames',
//             'samplingRate',
//             'audioChannels',
//             'backgroundColor',
//         ])

//         const layers = compJson.layers.map(layer => Layer.deserialize(layer))

//         Object.defineProperty(comp, '_id', {value: compJson.id || uuid.v4()})
//         Object.assign(comp.config, config)
//         comp.layers = layers

//         const color = config.backgroundColor
//         comp.backgroundColor = new ColorRGB(color.red, color.green, color.blue)
//         return comp
//     }

//     private _id: string = uuid.v4()

//     public layers : Layer[] = []

//     private config : {
//         name: string|null,
//         width: number|null,
//         height: number|null,
//         framerate: number|null,
//         durationFrames: number|null,

//         samplingRate: number|null,
//         audioChannels: number|null,

//         backgroundColor: ColorRGB|null,
//     } = {
//         name: null,
//         width: null,
//         height: null,
//         framerate: null,
//         durationFrames: null,

//         samplingRate: null,
//         audioChannels: null,

//         backgroundColor: new ColorRGB(0, 0, 0),
//     }

//     get id(): string { return this._id }

//     get name(): string { return this.config.name as string }
//     set name(name: string) { this.config.name = name }

//     get width(): number { return this.config.width as number }
//     set width(width: number) { this.config.width = width }

//     get height(): number { return this.config.height as number }
//     set height(height: number) { this.config.height = height }

//     get framerate(): number { return this.config.framerate as number }
//     set framerate(framerate: number) { this.config.framerate = framerate }

//     get durationFrames(): number { return this.config.durationFrames as number }
//     set durationFrames(durationFrames: number) { this.config.durationFrames = durationFrames }

//     get samplingRate(): number { return this.config.samplingRate as number }
//     set samplingRate(samplingRate: number) { this.config.samplingRate = samplingRate }

//     get audioChannels(): number { return this.config.audioChannels as number }
//     set audioChannels(audioChannels: number) { this.config.audioChannels = audioChannels }

//     get backgroundColor(): ColorRGB { return this.config.backgroundColor as ColorRGB }
//     set backgroundColor(backgroundColor: ColorRGB) { this.config.backgroundColor = backgroundColor }

//     constructor()
//     {
//         Object.seal(this)
//     }

//     public toPreBSON(): CompositionScheme
//     {
//         return {
//             id: this.id,
//             config: toJSON(this.config),
//             layers: this.layers.map(layer => layer.toPreBSON()),
//         }
//     }

//     public toJSON(): CompositionScheme
//     {
//         return {
//             id: this.id,
//             config: toJSON(this.config),
//             layers: this.layers.map(layer => layer.toJSON()),
//         }
//     }
// }
