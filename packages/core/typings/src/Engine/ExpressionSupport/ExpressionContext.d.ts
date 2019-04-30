import { ParameterValueTypes } from '../../PluginSupport/type-descriptor'
import { ClipRenderContext } from '../RenderContext/ClipRenderContext'
import { EffectRenderContext } from '../RenderContext/EffectRenderContext'
import { ExpressionContext } from './ExpressionVM'
export interface ReferenceableEffectsParams {
    [referenceName: string]: {
        [paramName: string]: ParameterValueTypes
    }
}
export interface ContextSource {
    context: ClipRenderContext<any> | EffectRenderContext<any>
    clipParams: {
        [propName: string]: ParameterValueTypes
    }
    clipEffectParams: ReferenceableEffectsParams
    currentValue: any
}
export declare const buildContext: (contextSource: ContextSource) => ExpressionContext
export declare const expressionContextTypeDefinition =
    '\ninterface CompositionAttributes {\n    width: number\n    height: number\n    time: number\n    frame: number\n    duration: number\n    durationFrames: number\n    audioBuffer: Float32Array[] | null\n}\n\ninterface ClipAttributes {\n    time: number\n    frame: number\n    params: Readonly<{ [paramName: string]: any }>\n    effect(referenceName: string): EffectAttributes\n}\n\ninterface EffectAttributes {\n    params: { [paramName: string]: any }\n}\n\ndeclare const thisComp: CompositionAttributes\ndeclare const thisClip: ClipAttributes\ndeclare const currentValue: any\n'
