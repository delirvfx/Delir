export type ParameterType =
    'POINT_2D'      |
    'POINT_3D'      |
    'SIZE_2D'       |
    'SIZE_3D'       |
    'COLOR_RGB'     |
    'COLOR_RGBA'    |
    'BOOL'          |
    'STRING'        |
    'NUMBER'        |
    'FLOAT'         |
    'ENUM'          |
    'LAYER'         |
    'PULSE'         |
    'ASSET'         |
    'ARRAY'         |
    'STRUCTURE'

export interface ParameterTypeDescriptor<T extends ParameterType> {
    type: T
    propName: string
    label: string
    enabled: boolean
    animatable: boolean|null
}

export interface Point2DTypeDescripter extends ParameterTypeDescriptor<'POINT_2D'> {}
export interface Point3DTypeDescripter extends ParameterTypeDescriptor<'POINT_3D'> {}
export interface Size2DTypeDescripter extends ParameterTypeDescriptor<'SIZE_2D'> {}
export interface Size3DTypeDescripter extends ParameterTypeDescriptor<'SIZE_3D'> {}
export interface Size3DTypeDescripter extends ParameterTypeDescriptor<'SIZE_3D'> {}
export interface ColorRGBTypeDescripter extends ParameterTypeDescriptor<'COLOR_RGB'> {}
export interface ColorRGBATypeDescripter extends ParameterTypeDescriptor<'COLOR_RGBA'> {}
export interface BoolTypeDescripter extends ParameterTypeDescriptor<'BOOL'> {}
export interface StringTypeDescripter extends ParameterTypeDescriptor<'STRING'> {}
export interface NumberTypeDescripter extends ParameterTypeDescriptor<'NUMBER'> {}
export interface FloatTypeDescripter extends ParameterTypeDescriptor<'FLOAT'> {}
export interface PulseTypeDescripter extends ParameterTypeDescriptor<'PULSE'> {}
export interface EnumTypeDescripter extends ParameterTypeDescriptor<'ENUM'> {
    selection: Array<any>
}
export interface LayerTypeDescripter extends ParameterTypeDescriptor<'LAYER'> {}
export interface AssetTypeDescripter extends ParameterTypeDescriptor<'ASSET'> {
    mimeTypes: Array<string>
}
export interface ArrayOfTypeDescripter extends ParameterTypeDescriptor<'ARRAY'> {
    subType: TypeDescriptor
}
export interface StructureTypeDescripter extends ParameterTypeDescriptor<'STRUCTURE'> {
    // TODO: implement structure type
    subType: TypeDescriptor
}

export type AnyParameterTypeDescriptor =
    Point2DTypeDescripter
    | Point3DTypeDescripter
    | Size2DTypeDescripter
    | Size3DTypeDescripter
    | Size3DTypeDescripter
    | ColorRGBTypeDescripter
    | ColorRGBATypeDescripter
    | BoolTypeDescripter
    | StringTypeDescripter
    | NumberTypeDescripter
    | FloatTypeDescripter
    | PulseTypeDescripter
    | EnumTypeDescripter
    | LayerTypeDescripter
    | AssetTypeDescripter
    | ArrayOfTypeDescripter
    | StructureTypeDescripter

export class TypeDescriptor {
    properties: AnyParameterTypeDescriptor[] = []

    point2d(propName: string, {label, enabled, animatable}: {label: string, enabled?: boolean, animatable?: boolean})
    {
        enabled = enabled == null ? true : enabled
        animatable = animatable == null ? true : false
        this.properties.push({type: 'POINT_2D', propName, label, enabled, animatable})
        return this
    }

    point3d(propName: string, {label, enabled, animatable}: {label: string, enabled?: boolean, animatable?: boolean})
    {
        enabled = enabled == null ? true : enabled
        animatable = animatable == null ? true : false
        this.properties.push({type: 'POINT_3D', propName, label, enabled, animatable})
        return this
    }

    size2d(propName: string, {label, enabled, animatable}: {label: string, enabled?: boolean, animatable?: boolean})
    {
        enabled = enabled == null ? true : enabled
        animatable = animatable == null ? true : false
        this.properties.push({type: 'SIZE_2D', propName, label, enabled, animatable})
        return this
    }

    size3d(propName: string, {label, enabled, animatable}: {label: string, enabled?: boolean, animatable?: boolean})
    {
        enabled = enabled == null ? true : enabled
        animatable = animatable == null ? true : false
        this.properties.push({type: 'SIZE_3D', propName, label, enabled, animatable})
        return this
    }

    colorRgb(propName: string, {label, enabled, animatable}: {label: string, enabled?: boolean, animatable?: boolean})
    {
        enabled = enabled == null ? true : enabled
        animatable = animatable == null ? true : false
        this.properties.push({type: 'COLOR_RGB', propName, label, enabled, animatable})
        return this
    }

    colorRgba(propName: string, {label, enabled, animatable}: {label: string, enabled?: boolean, animatable?: boolean})
    {
        enabled = enabled == null ? true : enabled
        animatable = animatable == null ? true : false
        this.properties.push({type: 'COLOR_RGBA', propName, label, enabled, animatable})
        return this
    }

    bool(propName: string, {label, enabled, animatable}: {label: string, enabled?: boolean, animatable?: boolean})
    {
        enabled = enabled == null ? true : enabled
        animatable = animatable == null ? true : false
        this.properties.push({type: 'BOOL', propName, label, enabled, animatable})
        return this
    }

    string(propName: string, {label, enabled, animatable}: {label: string, enabled?: boolean, animatable?: boolean})
    {
        enabled = enabled == null ? true : enabled
        animatable = animatable == null ? true : false
        this.properties.push({type: 'STRING', propName, label, enabled, animatable})
        return this
    }

    number(propName: string, {label, enabled, animatable}: {label: string, enabled?: boolean, animatable?: boolean})
    {
        enabled = enabled == null ? true : enabled
        animatable = animatable == null ? true : false
        this.properties.push({type: 'NUMBER', propName, label, enabled, animatable})
        return this
    }

    float(propName: string, {label, enabled, animatable}: {label: string, enabled?: boolean, animatable?: boolean})
    {
        enabled = enabled == null ? true : enabled
        animatable = animatable == null ? true : false
        this.properties.push({type: 'FLOAT', propName, label, enabled, animatable})
        return this
    }

    pulse(propName: string, {label, enabled}: {label: string, enabled?: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'PULSE', propName, label, enabled, animatable: false})
        return this
    }

    enum(propName: string, {label, enabled, selection}: {label: string, enabled?: boolean, selection: Array<any>})
    {
        enabled = enabled == null ? true : enabled
        selection = selection ? selection : []
        this.properties.push({type: 'ENUM', propName, label, enabled, selection, animatable: false})
        return this
    }

    layer(propName: string, {label, enabled, animatable}: {label: string, enabled?: boolean, animatable?: boolean})
    {
        enabled = enabled == null ? true : enabled
        animatable = animatable == null ? true : false
        this.properties.push({type: 'LAYER', propName, label, enabled, animatable})
        return this
    }

    asset(propName: string, {label, enabled, mimeTypes}: {label: string, enabled?: boolean, mimeTypes: Array<string>})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'ASSET', propName, label, enabled, animatable: false, mimeTypes})
        return this
    }

    arrayOf(propName: string, {label, enabled}: {label: string, enabled?: boolean}, type: TypeDescriptor)
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'ARRAY', propName, subType: type, label, enabled, animatable: false})
        return this
    }

    structure(propName: string, {label, enabled}: {label: string, enabled?: boolean}, type: TypeDescriptor)
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'STRUCTURE', propName, subType: type, label, enabled, animatable: false})
        return this
    }
}

export default class Type
{
    constructor()
    {
        throw new TypeError('Type is can not constructing')
    }

    static point2d(propName: string, option: {label: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).point2d(propName, option)
    }

    static point3d(propName: string, option: {label: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).point3d(propName, option)
    }

    static size2d(propName: string, option: {label: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).size2d(propName, option)
    }

    static size3d(propName: string, option: {label: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).size3d(propName, option)
    }

    static colorRgb(propName: string, option: {label: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).colorRgb(propName, option)
    }

    static colorRgba(propName: string, option: {label: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).colorRgba(propName, option)
    }

    static bool(propName: string, option: {label: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).bool(propName, option)
    }

    static string(propName: string, option: {label: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).string(propName, option)
    }

    static number(propName: string, option: {label: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).number(propName, option)
    }

    static float(propName: string, option: {label: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).float(propName, option)
    }

    static pulse(propName: string, option: {label: string, enabled?: boolean})
    {
        return (new TypeDescriptor()).pulse(propName, option)
    }

    static enum(propName: string, option: {label: string, enabled?: boolean, selection: Array<any>})
    {
        return (new TypeDescriptor()).enum(propName, option)
    }

    static layer(propName: string, option: {label: string, enabled?: boolean, animatable?: boolean})
    {
        return (new TypeDescriptor()).layer(propName, option)
    }

    static asset(propName: string, option: {label: string, enabled?: boolean, mimeTypes: Array<string>})
    {
        return (new TypeDescriptor()).asset(propName, option)
    }

    static arrayOf(propName: string, option: {label: string, enabled?: boolean}, type: TypeDescriptor)
    {
        return (new TypeDescriptor()).arrayOf(propName, option, type)
    }

    static none()
    {
      return new TypeDescriptor()
    }
}

export const POINT_2D = 'POINT_2D'
export const POINT_3D = 'POINT_3D'
export const SIZE_2D = 'SIZE_2D'
export const SIZE_3D = 'SIZE_3D'
export const COLOR_RGB = 'COLOR_RGB'
export const COLOR_RGBA = 'COLOR_RGBA'
export const BOOL = 'BOOL'
export const STRING = 'STRING'
export const NUMBER = 'NUMBER'
export const FLOAT = 'FLOAT'
export const ENUM = 'ENUM'
export const LAYER = 'LAYER'
export const ASSET = 'ASSET'
export const PULSE = 'PULSE'
export const ARRAY = 'ARRAY'
export const STRUCTURE = 'STRUCTURE'
