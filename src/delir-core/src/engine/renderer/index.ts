import {IRendererStatic, IRenderer} from './renderer-base'
import {TypeDescriptor} from '../../plugin-support/type-descriptor'

import * as _ from 'lodash'
import UnknownPluginReferenceException from '../../exceptions/unknown-plugin-reference-exception'

import VideoRenderer from './Video/Video'
import ImageRenderer from './Image/Image'
import TextRenderer from './Text/Text'
import AudioRenderer from './Audio/Audio'
import AdjustmentRenderer from './Adjustment/Adjustment'
import ScriptingRenderer from './Scripting/Scripting'

export type AvailableRenderer = 'audio' | 'image' | 'video' | 'text' | 'adjustment' | 'scripting'

export const RENDERERS: {[name: string]: IRendererStatic} = {
    audio: AudioRenderer,
    video: VideoRenderer,
    image: ImageRenderer,
    text: TextRenderer,
    adjustment: AdjustmentRenderer,
    scripting: ScriptingRenderer,
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
