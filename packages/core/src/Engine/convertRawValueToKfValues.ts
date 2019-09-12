import map from 'lodash/map'
import { TypeDescriptor } from '../PluginSupport/TypeDescriptor'
import { AssetPointer } from '../Values'
import { RawKeyframeTable, RuntimeKeyframeLookupTable } from './ParametersTable'
import { RenderContextBase } from './RenderContext/RenderContextBase'
import { ShapeProxy } from './RuntimeValue/ShapeProxy'

/** Convert raw Keyframe#value to parameter typed value  */
export const convertRawValueToKfValues = (
  context: RenderContextBase,
  descriptors: TypeDescriptor,
  values: RawKeyframeTable,
): RuntimeKeyframeLookupTable => {
  const dest: RuntimeKeyframeLookupTable = { ...values } as any
  const assetParams = descriptors.properties.filter(param => param.type === 'ASSET')
  const shapeParams = descriptors.properties.filter(param => param.type === 'SHAPE')

  // Convert asset to AssetProxy
  assetParams.forEach(param => {
    dest[param.paramName] = map(values[param.paramName], (value: AssetPointer) => {
      return value ? context.resolver.resolveAsset(value.assetId) : null
    })
  })

  // Convert shape to ShapeProxy
  shapeParams.forEach(param => {
    dest[param.paramName] = map(values[param.paramName], value => {
      return value ? new ShapeProxy(value as string) : null
    })
  })

  return dest
}
