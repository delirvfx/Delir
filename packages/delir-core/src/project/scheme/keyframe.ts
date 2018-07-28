// import Point2D from '../../values/point-2d'
// import Point3D from '../../values/point-3d'
// import Size2D from '../../values/size-2d'
// import Size3D from '../../values/size-3d'
import { ColorRgbJSON } from '../../values/color-rgb'
import { ColorRgbaJSON } from '../../values/color-rgba'

export interface AssetPointerScheme {
    assetId: string
}

export type JSONKeyframeValueTypes =
    | number
    | boolean
    | string
    | {type: 'color-rgb', value: ColorRgbJSON}
    | {type: 'color-rgba', value: ColorRgbaJSON}
    | {type: 'asset', value: AssetPointerScheme}
    // Point2D|Point3D|Size2D|Size3D

export interface KeyframeConfigScheme {
    value: JSONKeyframeValueTypes
    frameOnClip: number
    easeInParam: [number, number]
    easeOutParam: [number, number]
}

export interface KeyframeScheme {
    id: string
    config: KeyframeConfigScheme
}
