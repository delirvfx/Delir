import { AssetProxy } from '../Engine/AssetProxy'
import { ColorRGB as _ColorRGB, ColorRGBA as _ColorRGBA, Expression } from '../Values'

/** The type of value given to the parameter */
export namespace ParamType {
  export type ColorRGB = _ColorRGB
  export type ColorRGBA = _ColorRGBA
  export type Bool = boolean
  export type String = string
  export type Number = number
  export type Float = number
  export type Enum = string
  export type Asset = AssetProxy
  export type Code = Expression
}
