import { createContext, runInNewContext } from 'vm'

interface ExpressionVMOption {
    filename?: string
}

interface CompositionAttributes {
    width: number
    height: number
    time: number
    frame: number
    duration: number
    durationFrames: number
    audioBuffer: Float32Array[] | null
}

interface ClipAttributes {
    time: number
    frame: number
    params: Readonly<{ [paramName: string]: any }>
    effect(referenceName: string): EffectAttributes
}

interface EffectAttributes {
    params: { [paramName: string]: any }
}

export interface ExpressionContext {
    currentValue: any
    thisComp: CompositionAttributes
    thisClip: ClipAttributes
}

export default class ExpressionVM {
    public static execute<Result = any>(
        code: string,
        context: ExpressionContext,
        options: ExpressionVMOption = {}
    ): Result {
        const vmGlobal = Object.freeze({
            console: global.console,
            ...context
        })

        const vmContext = createContext(vmGlobal)
        return runInNewContext(code, vmContext, { filename: options.filename })
    }
}
