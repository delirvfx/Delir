import AssetProxy from '../Engine/AssetProxy'
import { ColorRGB, ColorRGBA, Expression } from '../Values'
export declare type ParameterType =
    | 'COLOR_RGB'
    | 'COLOR_RGBA'
    | 'BOOL'
    | 'STRING'
    | 'NUMBER'
    | 'FLOAT'
    | 'ENUM'
    | 'ASSET'
    | 'CODE'
export interface ParameterTypeDescriptor<T extends ParameterType> {
    type: T
    paramName: string
    label: string
    enabled: boolean
    animatable: boolean
}
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
export interface EnumTypeDescripter extends ParameterTypeDescriptor<'ENUM'> {
    selection: string[]
    defaultValue?: string
}
export interface AssetTypeDescripter extends ParameterTypeDescriptor<'ASSET'> {
    extensions: string[]
}
export interface CodeTypeDescripter extends ParameterTypeDescriptor<'CODE'> {
    langType: string
    defaultValue?: Expression
}
export declare type AnyParameterTypeDescriptor =
    | ColorRGBTypeDescripter
    | ColorRGBATypeDescripter
    | BoolTypeDescripter
    | StringTypeDescripter
    | NumberTypeDescripter
    | FloatTypeDescripter
    | EnumTypeDescripter
    | AssetTypeDescripter
    | CodeTypeDescripter
export declare type ParameterValueTypes = ColorRGB | ColorRGBA | string | number | boolean | AssetProxy | null
export declare const descriptorToValueType: (desc: AnyParameterTypeDescriptor) => never
export declare class TypeDescriptor {
    public properties: AnyParameterTypeDescriptor[]
    public colorRgb(
        paramName: string,
        conf: {
            label: string
            defaultValue?: ColorRGB
            enabled?: boolean
            animatable?: boolean
        },
    ): this
    public colorRgba(
        paramName: string,
        conf: {
            label: string
            defaultValue?: ColorRGBA
            enabled?: boolean
            animatable?: boolean
        },
    ): this
    public bool(
        paramName: string,
        conf: {
            label: string
            defaultValue?: boolean
            enabled?: boolean
            animatable?: boolean
        },
    ): this
    public string(
        paramName: string,
        conf: {
            label: string
            defaultValue?: string
            enabled?: boolean
            animatable?: boolean
        },
    ): this
    public number(
        paramName: string,
        conf: {
            label: string
            defaultValue?: number
            enabled?: boolean
            animatable?: boolean
        },
    ): this
    public float(
        paramName: string,
        conf: {
            label: string
            defaultValue?: number
            enabled?: boolean
            animatable?: boolean
        },
    ): this
    public enum(
        paramName: string,
        conf: {
            label: string
            defaultValue?: string
            enabled?: boolean
            selection: string[]
        },
    ): this
    public asset(
        paramName: string,
        conf: {
            label: string
            enabled?: boolean
            extensions: Array<string>
        },
    ): this
    public code(
        paramName: string,
        conf: {
            label: string
            enabled?: boolean
            langType: string
            defaultValue?: Expression
        },
    ): this
}
export default class Type {
    public static colorRgb(
        paramName: string,
        option: {
            label: string
            defaultValue?: ColorRGB
            enabled?: boolean
            animatable?: boolean
        },
    ): TypeDescriptor
    public static colorRgba(
        paramName: string,
        option: {
            label: string
            defaultValue?: ColorRGBA
            enabled?: boolean
            animatable?: boolean
        },
    ): TypeDescriptor
    public static bool(
        paramName: string,
        option: {
            label: string
            defaultValue?: boolean
            enabled?: boolean
            animatable?: boolean
        },
    ): TypeDescriptor
    public static string(
        paramName: string,
        option: {
            label: string
            defaultValue?: string
            enabled?: boolean
            animatable?: boolean
        },
    ): TypeDescriptor
    public static number(
        paramName: string,
        option: {
            label: string
            defaultValue?: number
            enabled?: boolean
            animatable?: boolean
        },
    ): TypeDescriptor
    public static float(
        paramName: string,
        option: {
            label: string
            defaultValue?: number
            enabled?: boolean
            animatable?: boolean
        },
    ): TypeDescriptor
    public static asset(
        paramName: string,
        option: {
            label: string
            enabled?: boolean
            extensions: string[]
        },
    ): TypeDescriptor
    public static code(
        paramName: string,
        option: {
            label: string
            defaultValue?: Expression
            enabled?: boolean
            langType: string
        },
    ): TypeDescriptor
    public static none(): TypeDescriptor
    constructor()
}
export declare const COLOR_RGB = 'COLOR_RGB'
export declare const COLOR_RGBA = 'COLOR_RGBA'
export declare const BOOL = 'BOOL'
export declare const STRING = 'STRING'
export declare const NUMBER = 'NUMBER'
export declare const FLOAT = 'FLOAT'
export declare const ENUM = 'ENUM'
export declare const ASSET = 'ASSET'
