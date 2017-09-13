import defaults from '../helper/defaults'
import PluginLoadFailException from '../exceptions/plugin-load-fail-exception'
import AssetProxy from '../engine/pipeline/AssetProxy'

import {
    Point2D,
    Point3D,
    Size2D,
    Size3D,
    ColorRGB,
    ColorRGBA,
} from '../values'

export type ParameterType =
    // | 'POINT_2D'
    // | 'POINT_3D'
    // | 'SIZE_2D'
    // | 'SIZE_3D'
    | 'COLOR_RGB'
    | 'COLOR_RGBA'
    | 'BOOL'
    | 'STRING'
    | 'NUMBER'
    | 'FLOAT'
    | 'ENUM'
    // | 'CLIP'
    // | 'PULSE'
    | 'ASSET'
    // | 'ARRAY'
    // | 'STRUCTURE'

export interface ParameterTypeDescriptor<T extends ParameterType> {
    type: T
    propName: string
    label: string
    enabled: boolean
    animatable: boolean|null
}

// export interface Point2DTypeDescripter extends ParameterTypeDescriptor<'POINT_2D'> {
//     defaultValue?: Point2D
// }
// export interface Point3DTypeDescripter extends ParameterTypeDescriptor<'POINT_3D'> {
//     defaultValue?: Point3D
// }
// export interface Size2DTypeDescripter extends ParameterTypeDescriptor<'SIZE_2D'> {
//     defaultValue?: Size2D
// }
// export interface Size3DTypeDescripter extends ParameterTypeDescriptor<'SIZE_3D'> {
//     defaultValue?: Size3D
// }
export interface ColorRGBTypeDescripter extends ParameterTypeDescriptor<'COLOR_RGB'> {
    defaultValue?: ColorRGB
}
export interface ColorRGBATypeDescripter extends ParameterTypeDescriptor<'COLOR_RGBA'> {
    defaultValue?: ColorRGBA
}
export interface BoolTypeDescripter extends ParameterTypeDescriptor<'BOOL'> {
    defaultValue?: boolean
}
export interface StringTypeDescripter extends ParameterTypeDescriptor<'STRING'> {
    defaultValue?: string
}
export interface NumberTypeDescripter extends ParameterTypeDescriptor<'NUMBER'> {
    defaultValue?: number
}
export interface FloatTypeDescripter extends ParameterTypeDescriptor<'FLOAT'> {
    defaultValue?: number
}
// export interface PulseTypeDescripter extends ParameterTypeDescriptor<'PULSE'> {
//     defaultValue?: true,
// }
export interface EnumTypeDescripter extends ParameterTypeDescriptor<'ENUM'> {
    selection: string[]
    defaultValue?: string
}
// export interface ClipTypeDescripter extends ParameterTypeDescriptor<'CLIP'> {}
export interface AssetTypeDescripter extends ParameterTypeDescriptor<'ASSET'> {
    extensions: string[]
}
// export interface ArrayOfTypeDescripter extends ParameterTypeDescriptor<'ARRAY'> {
//     subType: TypeDescriptor
// }
// export interface StructureTypeDescripter extends ParameterTypeDescriptor<'STRUCTURE'> {
//     // TODO: implement structure type
//     subType: TypeDescriptor
// }

export type AnyParameterTypeDescriptor =
    // | Point2DTypeDescripter
    // | Point3DTypeDescripter
    // | Size2DTypeDescripter
    // | Size3DTypeDescripter
    // | Size3DTypeDescripter
    | ColorRGBTypeDescripter
    | ColorRGBATypeDescripter
    | BoolTypeDescripter
    | StringTypeDescripter
    | NumberTypeDescripter
    | FloatTypeDescripter
    // | PulseTypeDescripter
    | EnumTypeDescripter
    // | ClipTypeDescripter
    | AssetTypeDescripter
    // | ArrayOfTypeDescripter
    // | StructureTypeDescripter

export type ParameterValueTypes =
    | Point2D
    | Point3D
    | Size2D
    | Size3D
    | ColorRGB
    | ColorRGBA
    | string
    | number
    | boolean
    | AssetProxy
    | null

export const descriptorToValueType = (desc: AnyParameterTypeDescriptor) => {
     switch (desc.type) {
        //  case 'POINT_2D': return Point2D
        //  case 'POINT_3D': return Point3D
        //  case 'SIZE_2D': return Size2D
        //  case 'SIZE_3D': return Size3D
         default: throw new Error(`Unsupported parameter type ${desc.type}`)
     }
}

export class TypeDescriptor {
    properties: AnyParameterTypeDescriptor[] = []

    // point2d(propName: string, conf: {label: string, defaultValue?: Point2D, enabled?: boolean, animatable?: boolean})
    // {
    //     const {defaultValue, label, enabled, animatable} = defaults(conf, {
    //         defaultValue: new Point2D(0, 0),
    //         enabled: true,
    //         animatable: true
    //     })

    //     this.properties.push({type: 'POINT_2D', propName, defaultValue, label, enabled, animatable})
    //     return this
    // }

    // point3d(propName: string, conf: {label: string, defaultValue?: Point3D, enabled?: boolean, animatable?: boolean})
    // {
    //     const {defaultValue, label, enabled, animatable} = defaults(conf, {
    //         defaultValue: new Point3D(0, 0, 0),
    //         enabled: true,
    //         animatable: true,
    //     })

    //     this.properties.push({type: 'POINT_3D', propName, defaultValue, label, enabled, animatable})
    //     return this
    // }

    // size2d(propName: string, conf: {label: string, defaultValue?: Size2D, enabled?: boolean, animatable?: boolean})
    // {
    //     const {defaultValue, label, enabled, animatable} = defaults(conf, {
    //         defaultValue: new Size2D(0, 0),
    //         enabled: true,
    //         animatable: true,
    //     })

    //     this.properties.push({type: 'SIZE_2D', propName, defaultValue, label, enabled, animatable})
    //     return this
    // }

    // size3d(propName: string, conf: {label: string, defaultValue?: Size3D, enabled?: boolean, animatable?: boolean})
    // {
    //     const {defaultValue, label, enabled, animatable} = defaults(conf, {
    //         defaultValue: new Size3D(0, 0, 0),
    //         enabled: true,
    //         animatable: true,
    //     })

    //     this.properties.push({type: 'SIZE_3D', propName, defaultValue, label, enabled, animatable})
    //     return this
    // }

    colorRgb(propName: string, conf: {label: string, defaultValue?: ColorRGB, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: new ColorRGB(0, 0, 0),
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'COLOR_RGB', propName, defaultValue, label, enabled, animatable})
        return this
    }

    colorRgba(propName: string, conf: {label: string, defaultValue?: ColorRGBA, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: new ColorRGBA(0, 0, 0, 1),
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'COLOR_RGBA', propName, defaultValue, label, enabled, animatable})
        return this
    }

    bool(propName: string, conf: {label: string, defaultValue?: boolean, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: false,
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'BOOL', propName, defaultValue, label, enabled, animatable})
        return this
    }

    string(propName: string, conf: {label: string, defaultValue?: string, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: '',
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'STRING', propName, defaultValue, label, enabled, animatable})
        return this
    }

    number(propName: string, conf: {label: string, defaultValue?: number, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: 0,
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'NUMBER', propName, defaultValue, label, enabled, animatable})
        return this
    }

    float(propName: string, conf: {label: string, defaultValue?: number, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: 0,
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'FLOAT', propName, defaultValue, label, enabled, animatable})
        return this
    }

    // pulse(propName: string, conf: {label: string, enabled?: boolean})
    // {
    //     const {label, enabled} = defaults(conf, {
    //         defaultValue: false,
    //         enabled: true,
    //     })

    //     this.properties.push({type: 'PULSE', propName, label, enabled, animatable: true})
    //     return this
    // }

    enum(propName: string, conf: {label: string, defaultValue?: string, enabled?: boolean, selection: string[]})
    {
        const {defaultValue, label, enabled, selection} = defaults(conf, {
            enabled: true,
            selection: []
        })

        // Allow to empty selection.
        const validSelection = Array.isArray(selection) && selection.every(e => typeof e === 'string')

        if (!validSelection) {
            throw new PluginLoadFailException('`selection` must be an array of string')
        }

        if (defaultValue != null && !selection.includes(defaultValue)) {
            throw new PluginLoadFailException('Default value not included in selection')
        }

        this.properties.push({type: 'ENUM', propName, defaultValue, label, enabled, selection, animatable: false})
        return this
    }

    // clip(propName: string, conf: {label: string, enabled?: boolean})
    // {
    //     const {label, enabled} = defaults(conf, {
    //         enabled: true,
    //     })

    //     this.properties.push({type: 'CLIP', propName, label, enabled, animatable: false})
    //     return this
    // }

    asset(propName: string, conf: {label: string, enabled?: boolean, extensions: Array<string>})
    {
        const {label, enabled, extensions} = defaults(conf, {
            enabled: true,
            extensions: [],
        })

        const validextensions = Array.isArray(extensions) && extensions.length > 0 && extensions.every(e => typeof e === 'string')

        if (!validextensions) {
            throw new PluginLoadFailException('`extensions` must be an array of string and can not to be empty')
        }

        this.properties.push({type: 'ASSET', propName, label, enabled, animatable: false, extensions})
        return this
    }

    // arrayOf(propName: string, conf: {label: string, enabled?: boolean}, type: TypeDescriptor)
    // {
    //     const {label, enabled} = defaults(conf, {
    //         enabled: true,
    //     })

    //     this.properties.push({type: 'ARRAY', propName, subType: type, label, enabled, animatable: false})
    //     return this
    // }

    // structure(propName: string, conf: {label: string, enabled?: boolean}, type: TypeDescriptor)
    // {
    //     const {label, enabled} = defaults(conf, {
    //         enabled: true,
    //     })

    //     this.properties.push({type: 'STRUCTURE', propName, subType: type, label, enabled, animatable: false})
    //     return this
    // }
}

export default class Type
{
    constructor()
    {
        throw new TypeError('Type is can not constructing')
    }

    // static point2d(propName: string, option: {label: string, defaultValue?: Point2D, enabled?: boolean, animatable?: boolean})
    // {
    //     return (new TypeDescriptor()).point2d(propName, option)
    // }

    // static point3d(propName: string, option: {label: string, defaultValue?: Point3D, enabled?: boolean, animatable?: boolean})
    // {
    //     return (new TypeDescriptor()).point3d(propName, option)
    // }

    // static size2d(propName: string, option: {label: string, defaultValue?: Size2D, enabled?: boolean, animatable?: boolean})
    // {
    //     return (new TypeDescriptor()).size2d(propName, option)
    // }

    // static size3d(propName: string, option: {label: string, defaultValue?: Size3D, enabled?: boolean, animatable?: boolean})
    // {
    //     return (new TypeDescriptor()).size3d(propName, option)
    // }

    static colorRgb(propName: string, option: {label: string, defaultValue?: ColorRGB, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).colorRgb(propName, option)
    }

    static colorRgba(propName: string, option: {label: string, defaultValue?: ColorRGBA, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).colorRgba(propName, option)
    }

    static bool(propName: string, option: {label: string, defaultValue?: boolean, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).bool(propName, option)
    }

    static string(propName: string, option: {label: string, defaultValue?: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).string(propName, option)
    }

    static number(propName: string, option: {label: string, defaultValue?: number, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).number(propName, option)
    }

    static float(propName: string, option: {label: string, defaultValue?: number, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).float(propName, option)
    }

    // static pulse(propName: string, option: {label: string, enabled?: boolean})
    // {
    //     return (new TypeDescriptor()).pulse(propName, option)
    // }

    // static enum(propName: string, option: {label: string, defaultValue?: string, enabled?: boolean, selection: string[]})
    // {
    //     return (new TypeDescriptor()).enum(propName, option)
    // }

    // static clip(propName: string, option: {label: string, enabled?: boolean})
    // {
    //     return (new TypeDescriptor()).clip(propName, option)
    // }

    static asset(propName: string, option: {label: string, enabled?: boolean, extensions: string[]})
    {
        return (new TypeDescriptor()).asset(propName, option)
    }

    // static arrayOf(propName: string, option: {label: string, enabled?: boolean}, type: TypeDescriptor)
    // {
    //     return (new TypeDescriptor()).arrayOf(propName, option, type)
    // }

    static none()
    {
      return new TypeDescriptor()
    }
}

// export const POINT_2D = 'POINT_2D'
// export const POINT_3D = 'POINT_3D'
// export const SIZE_2D = 'SIZE_2D'
// export const SIZE_3D = 'SIZE_3D'
export const COLOR_RGB = 'COLOR_RGB'
export const COLOR_RGBA = 'COLOR_RGBA'
export const BOOL = 'BOOL'
export const STRING = 'STRING'
export const NUMBER = 'NUMBER'
export const FLOAT = 'FLOAT'
export const ENUM = 'ENUM'
// export const CLIP = 'CLIP'
export const ASSET = 'ASSET'
// export const PULSE = 'PULSE'
// export const ARRAY = 'ARRAY'
// export const STRUCTURE = 'STRUCTURE'
