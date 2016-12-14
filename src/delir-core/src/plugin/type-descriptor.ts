// @flow
import * as  keyMirror from 'keymirror'

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

export type ParameterTypeDescriptor = {
    type: ParameterType,
    propName: string,
    label: string,
    enabled: boolean,
    mimeTypes?: Array<string>,
    animatable?: boolean,
    subType?: TypeDescriptor,
    selection?: Array<any>,
}

export class TypeDescriptor {
    properties: Array<ParameterTypeDescriptor> = []

    point2d(propName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'POINT_2D', propName, label, enabled, animatable})
        return this
    }

    point3d(propName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'POINT_3D', propName, label, enabled, animatable})
        return this
    }

    size2d(propName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'SIZE_2D', propName, label, enabled, animatable})
        return this
    }

    size3d(propName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'SIZE_3D', propName, label, enabled, animatable})
        return this
    }

    colorRgb(propName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'COLOR_RGB', propName, label, enabled, animatable})
        return this
    }

    colorRgba(propName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'COLOR_RGBA', propName, label, enabled, animatable})
        return this
    }

    bool(propName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'BOOL', propName, label, enabled, animatable})
        return this
    }

    string(propName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'STRING', propName, label, enabled, animatable})
        return this
    }

    number(propName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'NUMBER', propName, label, enabled, animatable})
        return this
    }

    float(propName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'FLOAT', propName, label, enabled, animatable})
        return this
    }

    pulse(propName: string, {label, enabled}: {label: string, enabled: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'PULSE', propName, label, enabled, animatable: false})
        return this
    }

    enum(propName: string, {label, enabled, selection}: {label: string, enabled: boolean, selection: Array<any>})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'ENUM', propName, label, enabled, selection, animatable: false})
        return this
    }

    layer(propName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'LAYER', propName, label, enabled, animatable})
        return this
    }

    asset(propName: string, {label, enabled, mimeTypes}: {label: string, enabled: boolean, mimeTypes: Array<string>})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'ASSET', propName, label, enabled, animatable: false, mimeTypes})
        return this
    }

    arrayOf(propName: string, {label, enabled}: {label: string, enabled: boolean}, type: TypeDescriptor)
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'ARRAY', propName, subType: type, label, enabled, animatable: false})
        return this
    }

    structure(propName: string, {label, enabled}: {label: string, enabled: boolean}, type: TypeDescriptor)
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

    static point2d(propName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).point2d(propName, option)
    }

    static point3d(propName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).point3d(propName, option)
    }

    static size2d(propName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).size2d(propName, option)
    }

    static size3d(propName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).size3d(propName, option)
    }

    static colorRgb(propName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).colorRgb(propName, option)
    }

    static colorRgba(propName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).colorRgba(propName, option)
    }

    static bool(propName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).bool(propName, option)
    }

    static string(propName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).string(propName, option)
    }

    static number(propName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).number(propName, option)
    }

    static float(propName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).float(propName, option)
    }

    static pulse(propName: string, option: {label: string, enabled: boolean})
    {
        return (new TypeDescriptor()).pulse(propName, option)
    }

    static enum(propName: string, option: {label: string, enabled: boolean, selection: Array<any>})
    {
        return (new TypeDescriptor()).enum(propName, option)
    }

    static layer(propName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).layer(propName, option)
    }

    static asset(propName: string, option: {label: string, enabled: boolean, mimeTypes: Array<string>})
    {
        return (new TypeDescriptor()).asset(propName, option)
    }

    static arrayOf(propName: string, option: {label: string, enabled: boolean}, type: TypeDescriptor)
    {
        return (new TypeDescriptor()).arrayOf(propName, option, type)
    }
}

keyMirror({
    'POINT_2D'      : null,
    'POINT_3D'      : null,
    'SIZE_2D'       : null,
    'SIZE_3D'       : null,
    'COLOR_RGB'     : null,
    'COLOR_RGBA'    : null,
    'BOOL'          : null,
    'STRING'        : null,
    'NUMBER'        : null,
    'FLOAT'         : null,
    'ENUM'          : null,
    'LAYER'         : null,
    'ASSET'         : null,
    'PULSE'         : null,
    'ARRAY'         : null,
    'STRUCTURE'     : null,
})
