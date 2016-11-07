// @flow
import keyMirror from 'keymirror'

export type ParameterType =
    'POINT_2D'      |
    'POINT_3D'      |
    'SIZE_2D'       |
    'SIZE_3D'       |
    'COLOR_RGB'     |
    'COLOR_RGBA'    |
    'BOOL'          |
    'STRING'        |
    'ENUM'          |
    'NUMBER'        |
    'FLOAT'         |
    'LAYER'         |
    'PULSE'         |
    'ARRAY'         |
    'STRUCTURE'     |
    'ASSET'

export type ParameterTypeDescriptor = {
    type: ParameterType,
    keyName: string,
    label: string,
    enabled: boolean,
    mimeTypes?: Array<string>,
    animatable?: boolean,
    subType?: TypeDescriptor,
    selection?: Array<any>,
}

export class TypeDescriptor {
    properties: Array<ParameterTypeDescriptor> = []

    point2d(keyName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'POINT_2D', keyName, label, enabled, animatable})
        return this
    }

    point3d(keyName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'POINT_3D', keyName, label, enabled, animatable})
        return this
    }

    size2d(keyName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'SIZE_2D', keyName, label, enabled, animatable})
        return this
    }

    size3d(keyName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'SIZE_3D', keyName, label, enabled, animatable})
        return this
    }

    colorRgb(keyName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'COLOR_RGB', keyName, label, enabled, animatable})
        return this
    }

    colorRgba(keyName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'COLOR_RGBA', keyName, label, enabled, animatable})
        return this
    }

    bool(keyName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'BOOL', keyName, label, enabled, animatable})
        return this
    }

    string(keyName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'STRING', keyName, label, enabled, animatable})
        return this
    }

    number(keyName: string, {label, enabled, animatable, mimeTypes}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'NUMBER', keyName, label, enabled, animatable})
        return this
    }

    enum(keyName: string, {label, enabled, selection}: {label: string, enabled: boolean, selection: Array<any>})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'ENUM', keyName, label, enabled, selection, animatable: false})
        return this
    }

    float(keyName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'FLOAT', keyName, label, enabled, animatable})
        return this
    }

    layer(keyName: string, {label, enabled, animatable}: {label: string, enabled: boolean, animatable: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'LAYER', keyName, label, enabled, animatable})
        return this
    }

    asset(keyName: string, {label, enabled, mimeTypes}: {label: string, enabled: boolean, mimeTypes: Array<string>})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'ASSET', keyName, label, enabled, animatable: false, mimeTypes})
        return this
    }

    pulse(keyName: string, {label, enabled, animatable}: {label: string, enabled: boolean})
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'PULSE', keyName, label, enabled, animatable: false})
        return this
    }

    arrayOf(keyName: string, {label, enabled}: {label: string, enabled: boolean}, type: TypeDescriptor)
    {
        enabled = enabled == null ? true : enabled
        this.properties.push({type: 'ARRAY', keyName, subType: type, label, enabled, animatable: false})
        return this
    }
}

export default class Type
{
    constructor()
    {
        throw new TypeError('Type is can not constructing')
    }

    static point2d(keyName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).point2d(keyName, option)
    }

    static point3d(keyName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).point3d(keyName, option)
    }

    static size2d(keyName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).size2d(keyName, option)
    }

    static size3d(keyName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).size3d(keyName, option)
    }

    static colorRgb(keyName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).colorRgb(keyName, option)
    }

    static colorRgba(keyName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).colorRgba(keyName, option)
    }

    static bool(keyName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).bool(keyName, option)
    }

    static string(keyName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).string(keyName, option)
    }

    static number(keyName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).number(keyName, option)
    }

    static enum(keyName: string, option: {label: string, enabled: boolean, selection: Array<any>})
    {
        return (new TypeDescriptor()).enum(keyName, option)
    }

    static float(keyName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).float(keyName, option)
    }

    static layer(keyName: string, option: {label: string, enabled: boolean, animatable: boolean})
    {
        return (new TypeDescriptor()).layer(keyName, option)
    }

    static asset(keyName: string, option: {label: string, enabled: boolean, mimeTypes: Array<string>})
    {
        return (new TypeDescriptor()).asset(keyName, option)
    }

    static pulse(keyName: string, option: {label: string, enabled: boolean})
    {
        return (new TypeDescriptor()).pulse(keyName, option)
    }

    static arrayOf(keyName: string, option: {label: string, enabled: boolean}, type: TypeDescriptor)
    {
        return (new TypeDescriptor()).arrayOf(keyName, option, type)
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
    'ENUM'          : null,
    'FLOAT'         : null,
    'LAYER'         : null,
    'ASSET'         : null,
    'PULSE'         : null,
    'ARRAY'         : null,
    'STRUCTURE'     : null,
})
