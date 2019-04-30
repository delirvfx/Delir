export const P5jsContextTypeDefinition = `
interface ClipAttributes {
    params: Readonly<{[propertyName: string]: any}>
    effect(effectName: string): EffectAttributes
}

interface EffectAttributes {
    params: { [paramName: string]: any }
}

declare const delir: {
    ctx: {
        time: number
        frame: number
        timeOnComposition: number
        frameOnComposition: number
        width: number
        height: number
        audioBuffer: Float32Array[]
        duration: number
        durationFrames: number
        currentValue: any
        clip: ClipAttributes
    }
}
`
