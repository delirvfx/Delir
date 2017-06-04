import {IRendererStatic, IRenderer} from './renderer-base'
import {TypeDescriptor} from '../../plugin-support/type-descriptor'

import * as _ from 'lodash'
import UnknownPluginReferenceException from '../../exceptions/unknown-plugin-reference-exception'

import VideoRenderer from './video-renderer'
import ImageRenderer from './image-renderer'
import TextRenderer from './text-renderer'
import AudioRenderer from './audio-renderer'

export type AvailableRenderer = 'audio' | 'image' | 'video' | 'text'

export const RENDERERS: {[name: string]: IRendererStatic} = {
    audio: AudioRenderer,
    video: VideoRenderer,
    image: ImageRenderer,
    text: TextRenderer,
}

interface PluginInfo {
    id: string
    handlableFileTypes: string[]
    assetAssignMap: {[extName: string]: string}
    parameter: TypeDescriptor
}

const RENDERER_SUMMARY = _.mapValues(RENDERERS, renderer => {
    const assetAssignMap  = renderer.provideAssetAssignMap()
    const handlableFileTypes = Object.keys(assetAssignMap)

    return {
        id: renderer.rendererId,
        handlableFileTypes,
        assetAssignMap,
        parameter: renderer.provideParameters()
    }
}) as {[name: string]: PluginInfo}

export function getAvailableRenderers() {
    return Object.values(_.clone(RENDERER_SUMMARY))
}

export function getInfo(renderer: AvailableRenderer) {
    const summary = RENDERER_SUMMARY[renderer]

    if (!summary) {
        throw new UnknownPluginReferenceException(`Missing renderer specified(${renderer}`)
    }

    return summary
}

export function create(renderer: AvailableRenderer): IRenderer<any> {
    const Renderer = RENDERERS[renderer]

    if (!Renderer) {
        throw new UnknownPluginReferenceException(`Missing renderer creating (${renderer}`)
    }

    return new Renderer()
}
