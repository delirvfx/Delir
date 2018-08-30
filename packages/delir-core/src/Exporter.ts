import * as _ from 'lodash'

import { Asset, Clip, Composition, Effect, Keyframe, Layer, Project } from './Entity'
import { AssetPointer, ColorRGB, ColorRGBA, Expression } from './Values'

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
}

const serializeJSONNode = (node: any) => {
    if (
        typeof node === 'boolean'
        || typeof node === 'number'
        || typeof node === 'string'
        || node === null
    ) {
        return node
    }

    if (Array.isArray(node)) {
        return _.map(node, serializeJSONNode)
    }

    for (const label of Object.keys(typeMap)) {
        if (node instanceof typeMap[label]) {
            return {
                __type: label,
                __value: _.mapValues(node, serializeJSONNode),
            }
        }
    }

    if (_.isObject(node)) {
        return _.mapValues(node, serializeJSONNode)
    }
}

const deserializeJSONNode = (node: any) => {
    if (
        typeof node === 'boolean'
        || typeof node === 'number'
        || typeof node === 'string'
        || node === null
    ) {
        return node
    }

    if (Array.isArray(node)) {
        return _.map(node, deserializeJSONNode)
    }

    for (const label of Object.keys(typeMap)) {
        if (node.__type === label) {
            const instance = new typeMap[label]()
            return Object.assign(instance, _.mapValues(node.__value, deserializeJSONNode))
        }
    }

    if (_.isObject(node)) {
        return _.mapValues(node, deserializeJSONNode)
    }
}

export const serialize = (project: Project) => {
    return serializeJSONNode(project)
}

export const deserialize = (project: any) => {
    return deserializeJSONNode(project)
}
