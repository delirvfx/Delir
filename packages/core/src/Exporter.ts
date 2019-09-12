import _ from 'lodash'

import { Asset, Clip, Composition, Effect, Keyframe, Layer, Project } from './Entity'
import { AssetPointer, ColorRGB, ColorRGBA, Expression, Shape } from './Values'

const typeMap = {
  'entity:Asset': Asset,
  'entity:Clip': Clip,
  'entity:Composition': Composition,
  'entity:Effect': Effect,
  'entity:Keyframe': Keyframe,
  'entity:Layer': Layer,
  'entity:Project': Project,
  'value:AssetPointer': AssetPointer,
  'value:ColorRGB': ColorRGB,
  'value:ColorRGBA': ColorRGBA,
  'value:Expression': Expression,
  'value:Shape': Shape,
}

export const serializeEntity = (node: any): any => {
  if (typeof node === 'boolean' || typeof node === 'number' || typeof node === 'string' || node === null) {
    return node
  }

  if (Array.isArray(node)) {
    return _.map(node, serializeEntity)
  }

  for (const label of Object.keys(typeMap)) {
    if (node instanceof (typeMap as any)[label]) {
      return {
        __type: label,
        __value: _.mapValues(node, serializeEntity),
      }
    }
  }

  if (_.isObject(node)) {
    return _.mapValues(node, serializeEntity)
  }
}

export const deserializeEntity = (node: any): any => {
  if (typeof node === 'boolean' || typeof node === 'number' || typeof node === 'string' || node === null) {
    return node
  }

  if (Array.isArray(node)) {
    return _.map(node, deserializeEntity)
  }

  for (const label of Object.keys(typeMap)) {
    if (node.__type === label) {
      const instance = new (typeMap as any)[label]()
      return Object.assign(instance, _.mapValues(node.__value, deserializeEntity))
    }
  }

  if (_.isObject(node)) {
    return _.mapValues(node, deserializeEntity)
  }
}

export const serializeProject = (project: Project) => {
  return serializeEntity(project)
}

export const deserializeProject = (project: any) => {
  return deserializeEntity(project)
}
