import { TypeDescriptor } from '../../PluginSupport/type-descriptor'
import { IRenderer, IRendererStatic } from './RendererBase'

import * as _ from 'lodash'
import UnknownPluginReferenceException from '../../exceptions/unknown-plugin-reference-exception'

import AdjustmentRenderer from './Adjustment/Adjustment'
import AudioRenderer from './Audio/Audio'
import ImageRenderer from './Image/Image'
import P5jsRenderer from './P5js/P5js'
import TextRenderer from './Text/Text'
import VideoRenderer from './Video/Video'

export type AvailableRenderer = 'audio' | 'image' | 'video' | 'text' | 'adjustment' | 'p5js'

export const RENDERERS: { [name: string]: IRendererStatic } = {
    audio: AudioRenderer,
    video: VideoRenderer,
    image: ImageRenderer,
    text: TextRenderer,
    adjustment: AdjustmentRenderer,
    p5js: P5jsRenderer,
}

interface PluginInfo {
    id: string
    handlableFileTypes: string[]
    assetAssignMap: { [extName: string]: string }
    parameter: TypeDescriptor
}

const RENDERER_SUMMARY = _.mapValues(RENDERERS, renderer => {
    const assetAssignMap = renderer.provideAssetAssignMap()
    const handlableFileTypes = Object.keys(assetAssignMap)

    return {
        id: renderer.rendererId,
        handlableFileTypes,
        assetAssignMap,
        parameter: renderer.provideParameters(),
    }
}) as { [name: string]: PluginInfo }

export function getAvailableRenderers() {
    return _.values(_.clone(RENDERER_SUMMARY))
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
