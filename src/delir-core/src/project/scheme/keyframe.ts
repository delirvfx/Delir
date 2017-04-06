import Point2D from '../../values/point-2d'
import Point3D from '../../values/point-3d'
import Size2D from '../../values/size-2d'
import Size3D from '../../values/size-3d'
import ColorRGB from '../../values/color-rgb'
import ColorRGBA from '../../values/color-rgba'

export interface AssetPointerScheme {
    assetId: string
}

export type KeyframeValueTypes =
    Point2D|Point3D|Size2D|Size3D|ColorRGB|ColorRGBA|number|boolean|string|AssetPointerScheme

export interface KeyframeConfigScheme {
    value: KeyframeValueTypes
    frameOnClip: number|null
    easeInParam: [number, number]
    easeOutParam: [number, number]
}

export interface KeyframeScheme {
    id: string|null
    config: KeyframeConfigScheme
}
