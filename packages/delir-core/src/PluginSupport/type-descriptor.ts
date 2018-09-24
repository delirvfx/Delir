import AssetProxy from '../Engine/AssetProxy'
import PluginLoadFailException from '../exceptions/plugin-load-fail-exception'
import defaults from '../helper/defaults'

import {
    ColorRGB,
    ColorRGBA,
    Expression,
    Point2D,
    Point3D,
    Size2D,
    Size3D,
} from '../Values'

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
    | 'CODE'
    // | 'ARRAY'
    // | 'STRUCTURE'

export interface ParameterTypeDescriptor<T extends ParameterType> {
    type: T
    paramName: string
    label: string
    enabled: boolean
    animatable: boolean
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
export interface CodeTypeDescripter extends ParameterTypeDescriptor<'CODE'> {
    langType: string
    defaultValue?: Expression
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
    | CodeTypeDescripter
    // | ArrayOfTypeDescripter
    // | StructureTypeDescripter

export type ParameterValueTypes =
    // | Point2D
    // | Point3D
    // | Size2D
    // | Size3D
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
    public properties: AnyParameterTypeDescriptor[] = []

    // public point2d(paramName: string, conf: {label: string, defaultValue?: Point2D, enabled?: boolean, animatable?: boolean})
    // {
    //     const {defaultValue, label, enabled, animatable} = defaults(conf, {
    //         defaultValue: new Point2D(0, 0),
    //         enabled: true,
    //         animatable: true
    //     })

    //     this.properties.push({type: 'POINT_2D', paramName, defaultValue, label, enabled, animatable})
    //     return this
    // }

    // public point3d(paramName: string, conf: {label: string, defaultValue?: Point3D, enabled?: boolean, animatable?: boolean})
    // {
    //     const {defaultValue, label, enabled, animatable} = defaults(conf, {
    //         defaultValue: new Point3D(0, 0, 0),
    //         enabled: true,
    //         animatable: true,
    //     })

    //     this.properties.push({type: 'POINT_3D', paramName, defaultValue, label, enabled, animatable})
    //     return this
    // }

    // public size2d(paramName: string, conf: {label: string, defaultValue?: Size2D, enabled?: boolean, animatable?: boolean})
    // {
    //     const {defaultValue, label, enabled, animatable} = defaults(conf, {
    //         defaultValue: new Size2D(0, 0),
    //         enabled: true,
    //         animatable: true,
    //     })

    //     this.properties.push({type: 'SIZE_2D', paramName, defaultValue, label, enabled, animatable})
    //     return this
    // }

    // public size3d(paramName: string, conf: {label: string, defaultValue?: Size3D, enabled?: boolean, animatable?: boolean})
    // {
    //     const {defaultValue, label, enabled, animatable} = defaults(conf, {
    //         defaultValue: new Size3D(0, 0, 0),
    //         enabled: true,
    //         animatable: true,
    //     })

    //     this.properties.push({type: 'SIZE_3D', paramName, defaultValue, label, enabled, animatable})
    //     return this
    // }

    public colorRgb(paramName: string, conf: {label: string, defaultValue?: ColorRGB, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: new ColorRGB(0, 0, 0),
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'COLOR_RGB', paramName, defaultValue, label, enabled, animatable})
        return this
    }

    public colorRgba(paramName: string, conf: {label: string, defaultValue?: ColorRGBA, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: new ColorRGBA(0, 0, 0, 1),
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'COLOR_RGBA', paramName, defaultValue, label, enabled, animatable})
        return this
    }

    public bool(paramName: string, conf: {label: string, defaultValue?: boolean, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: false,
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'BOOL', paramName, defaultValue, label, enabled, animatable})
        return this
    }

    public string(paramName: string, conf: {label: string, defaultValue?: string, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: '',
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'STRING', paramName, defaultValue, label, enabled, animatable})
        return this
    }

    public number(paramName: string, conf: {label: string, defaultValue?: number, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: 0,
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'NUMBER', paramName, defaultValue, label, enabled, animatable})
        return this
    }

    public float(paramName: string, conf: {label: string, defaultValue?: number, enabled?: boolean, animatable?: boolean})
    {
        const {defaultValue, label, enabled, animatable} = defaults(conf, {
            defaultValue: 0,
            enabled: true,
            animatable: true,
        })

        this.properties.push({type: 'FLOAT', paramName, defaultValue, label, enabled, animatable})
        return this
    }

    // public pulse(paramName: string, conf: {label: string, enabled?: boolean})
    // {
    //     const {label, enabled} = defaults(conf, {
    //         defaultValue: false,
    //         enabled: true,
    //     })

    //     this.properties.push({type: 'PULSE', paramName, label, enabled, animatable: true})
    //     return this
    // }

    public enum(paramName: string, conf: {label: string, defaultValue?: string, enabled?: boolean, selection: string[]})
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

        this.properties.push({type: 'ENUM', paramName, defaultValue, label, enabled, selection, animatable: false})
        return this
    }

    // public clip(paramName: string, conf: {label: string, enabled?: boolean})
    // {
    //     const {label, enabled} = defaults(conf, {
    //         enabled: true,
    //     })

    //     this.properties.push({type: 'CLIP', paramName, label, enabled, animatable: false})
    //     return this
    // }

    public asset(paramName: string, conf: {label: string, enabled?: boolean, extensions: Array<string>})
    {
        const {label, enabled, extensions} = defaults(conf, {
            enabled: true,
            extensions: [],
        })

        const validextensions = Array.isArray(extensions) && extensions.length > 0 && extensions.every(e => typeof e === 'string')

        if (!validextensions) {
            throw new PluginLoadFailException('`extensions` must be an array of string and can not to be empty')
        }

        this.properties.push({type: 'ASSET', paramName, label, enabled, animatable: false, extensions})
        return this
    }

    public code(paramName: string, conf: { label: string, enabled?: boolean, langType: string, defaultValue?: Expression })
    {
        const { defaultValue, label, enabled, langType } = defaults(conf, { enabled: true })
        this.properties.push({type: 'CODE', paramName, label, defaultValue, langType, enabled, animatable: false })
        return this
    }

    // public arrayOf(paramName: string, conf: {label: string, enabled?: boolean}, type: TypeDescriptor)
    // {
    //     const {label, enabled} = defaults(conf, {
    //         enabled: true,
    //     })

    //     this.properties.push({type: 'ARRAY', paramName, subType: type, label, enabled, animatable: false})
    //     return this
    // }

    // public structure(paramName: string, conf: {label: string, enabled?: boolean}, type: TypeDescriptor)
    // {
    //     const {label, enabled} = defaults(conf, {
    //         enabled: true,
    //     })

    //     this.properties.push({type: 'STRUCTURE', paramName, subType: type, label, enabled, animatable: false})
    //     return this
    // }
}

export default class Type
{

    // public static point2d(paramName: string, option: {label: string, defaultValue?: Point2D, enabled?: boolean, animatable?: boolean})
    // {
    //     return (new TypeDescriptor()).point2d(paramName, option)
    // }

    // public static point3d(paramName: string, option: {label: string, defaultValue?: Point3D, enabled?: boolean, animatable?: boolean})
    // {
    //     return (new TypeDescriptor()).point3d(paramName, option)
    // }

    // public static size2d(paramName: string, option: {label: string, defaultValue?: Size2D, enabled?: boolean, animatable?: boolean})
    // {
    //     return (new TypeDescriptor()).size2d(paramName, option)
    // }

    // public static size3d(paramName: string, option: {label: string, defaultValue?: Size3D, enabled?: boolean, animatable?: boolean})
    // {
    //     return (new TypeDescriptor()).size3d(paramName, option)
    // }

    public static colorRgb(paramName: string, option: {label: string, defaultValue?: ColorRGB, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).colorRgb(paramName, option)
    }

    public static colorRgba(paramName: string, option: {label: string, defaultValue?: ColorRGBA, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).colorRgba(paramName, option)
    }

    public static bool(paramName: string, option: {label: string, defaultValue?: boolean, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).bool(paramName, option)
    }

    public static string(paramName: string, option: {label: string, defaultValue?: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).string(paramName, option)
    }

    public static number(paramName: string, option: {label: string, defaultValue?: number, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).number(paramName, option)
    }

    public static float(paramName: string, option: {label: string, defaultValue?: number, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).float(paramName, option)
    }

    // public static pulse(paramName: string, option: {label: string, enabled?: boolean})
    // {
    //     return (new TypeDescriptor()).pulse(paramName, option)
    // }

    // public static enum(paramName: string, option: {label: string, defaultValue?: string, enabled?: boolean, selection: string[]})
    // {
    //     return (new TypeDescriptor()).enum(paramName, option)
    // }

    // public static clip(paramName: string, option: {label: string, enabled?: boolean})
    // {
    //     return (new TypeDescriptor()).clip(paramName, option)
    // }

    public static asset(paramName: string, option: {label: string, enabled?: boolean, extensions: string[]})
    {
        return (new TypeDescriptor()).asset(paramName, option)
    }

    public static code(paramName: string, option: { label: string, defaultValue?: Expression, enabled?: boolean, langType: string })
    {
        return (new TypeDescriptor()).code(paramName, option)
    }

    // public static arrayOf(paramName: string, option: {label: string, enabled?: boolean}, type: TypeDescriptor)
    // {
    //     return (new TypeDescriptor()).arrayOf(paramName, option, type)
    // }

    public static none()
    {
      return new TypeDescriptor()
    }
    constructor()
    {
        throw new TypeError('Type is can not constructing')
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
