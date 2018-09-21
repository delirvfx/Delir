import { createContext, runInNewContext } from 'vm'

interface ExpressionVMOption {
    filename?: string
}

interface EffectAttributes {
    params: { [paramName: string]: any }
}

export interface ExpressionContext {
    time: number
    frame: number
    timeOnComposition: number
    frameOnComposition: number
    width: number
    height: number
    audioBuffer: Float32Array[] | null
    duration: number
    durationFrames: number
    clipProp: { [paramName: string]: any }
    currentValue: any
    effect(referenceName: string): EffectAttributes
}

export default class ExpressionVM {
    public static execute<Result = any>(
        code: string,
        context: ExpressionContext,
        options: ExpressionVMOption = {}
    ): Result {
        const vmGlobal = Object.freeze({
            console: global.console,
            ctx: context,
            ...context
        })

        const vmContext = createContext(vmGlobal)
        return runInNewContext(code, vmContext, { filename: options.filename })
    }
}
