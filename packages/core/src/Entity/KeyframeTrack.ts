import { Keyframe } from './Keyframe'

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

export namespace KeyframeTrack {}

export class KeyframeTrack {
  public dataType: ParameterType
  public paramName: string
  public keyframes: readonly Keyframe[]
}
