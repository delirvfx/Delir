import { createContext, runInNewContext } from 'vm'
// import FrameContext from './FrameContext'

interface ExpressionVMOption {
    filename?: string
}

interface ExpressionContext {
    time: number
    frame: number
    timeOnComposition: number
    frameOnComposition: number
    width: number
    height: number
    audioBuffer: Float32Array | null
    duration: number
    durationFrames: number
    clipProp: object
    currentValue: any
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
